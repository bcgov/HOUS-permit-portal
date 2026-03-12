require "rails_helper"

RSpec.describe Infrastructure::TemplateImportService do
  let(:zip_file) { instance_double("Zip::File") }

  before do
    allow(Rails.logger).to receive(:info)
    allow(Rails.logger).to receive(:warn)
    allow(Rails.logger).to receive(:error)
    allow(ActiveRecord::Base).to receive(:transaction).and_yield
    allow(Zip::File).to receive(:open).and_yield(zip_file)

    allow(RequirementBlock).to receive(:reindex)
    allow(RequirementTemplate).to receive(:reindex)
    allow(SiteConfiguration).to receive(:first).and_return(
      instance_double("SiteConfiguration", id: "sc-1")
    )
  end

  describe "#call" do
    it "prints and returns when IMPORT_ENABLED is not true" do
      allow(ENV).to receive(:[]).and_call_original
      allow(ENV).to receive(:[]).with("IMPORT_ENABLED").and_return("false")

      expect do described_class.new("/tmp/in.zip").call end.to output(
        /IMPORT NOT ENABLED/
      ).to_stdout
    end

    it "runs import steps in a transaction when enabled" do
      allow(ENV).to receive(:[]).and_call_original
      allow(ENV).to receive(:[]).with("IMPORT_ENABLED").and_return("true")

      service = described_class.new("/tmp/in.zip")
      allow(service).to receive(:prepare_classification_map)
      allow(service).to receive(:wipe_data!)
      allow(service).to receive(:import_model)
      allow(service).to receive(:reindex_models)

      allow(zip_file).to receive(:find_entry).and_return(nil)

      service.call

      expect(service).to have_received(:prepare_classification_map)
      expect(service).to have_received(:wipe_data!)
      expect(service).to have_received(:reindex_models)
    end
  end

  describe "private helpers" do
    let(:service) do
      allow(ENV).to receive(:[]).and_call_original
      allow(ENV).to receive(:[]).with("IMPORT_ENABLED").and_return("true")
      described_class.new("/tmp/in.zip")
    end

    it "returns nil for orphaned TemplateSectionBlock and Requirement" do
      allow(RequirementTemplateSection).to receive(:exists?).and_return(false)
      allow(RequirementBlock).to receive(:exists?).and_return(false)

      attrs = {
        "id" => "tsb-1",
        "requirement_template_section_id" => "sec-1",
        "requirement_block_id" => "rb-1"
      }

      expect(
        service.send(:apply_fixups, TemplateSectionBlock, attrs.dup)
      ).to be_nil

      allow(RequirementBlock).to receive(:exists?).and_return(false)
      expect(
        service.send(
          :apply_fixups,
          Requirement,
          { "id" => "r-1", "requirement_block_id" => "rb-1" }
        )
      ).to be_nil
    end

    it "captures old classification map in prepare_classification_map" do
      allow(PermitClassification).to receive(:pluck).with(
        :code,
        :id
      ).and_return([%w[c1 id1]])

      service.send(:prepare_classification_map)

      expect(service.instance_variable_get(:@old_classification_map)).to eq(
        { "c1" => "id1" }
      )
    end

    it "sanitizes RequirementBlock attributes by removing association_list" do
      attrs = { "id" => "rb-1", "association_list" => %w[a b], "name" => "N" }
      fixed = service.send(:apply_fixups, RequirementBlock, attrs)
      expect(fixed).not_to have_key("association_list")
      expect(fixed["name"]).to eq("N")
    end

    it "applies RequirementTemplate fixups and remaps classification ids" do
      service.instance_variable_set(:@site_configuration_id, "sc-9")
      service.instance_variable_set(
        :@classification_id_map,
        { "pt-old" => "pt-new", "act-old" => "act-new" }
      )

      attrs = {
        "id" => "t-1",
        "assignee_id" => "x",
        "site_configuration_id" => "sc-old",
        "permit_type_id" => "pt-old",
        "activity_id" => "act-old"
      }

      fixed = service.send(:apply_fixups, RequirementTemplate, attrs)

      expect(fixed["assignee_id"]).to be_nil
      expect(fixed["site_configuration_id"]).to eq("sc-9")
      expect(fixed["permit_type_id"]).to eq("pt-new")
      expect(fixed["activity_id"]).to eq("act-new")
    end

    it "remaps denormalized_template_json permit_type/activity ids for TemplateVersion" do
      service.instance_variable_set(
        :@classification_id_map,
        { "pt-old" => "pt-new", "act-old" => "act-new" }
      )

      attrs = {
        "id" => "v-1",
        "deprecated_by_id" => "x",
        "denormalized_template_json" => {
          "permit_type" => {
            "id" => "pt-old"
          },
          "activity" => {
            "id" => "act-old"
          }
        }
      }

      fixed = service.send(:apply_fixups, TemplateVersion, attrs)

      expect(fixed["deprecated_by_id"]).to be_nil
      expect(
        fixed.dig("denormalized_template_json", "permit_type", "id")
      ).to eq("pt-new")
      expect(fixed.dig("denormalized_template_json", "activity", "id")).to eq(
        "act-new"
      )
    end

    it "tracks classification id changes when export id differs from local id" do
      service.instance_variable_set(
        :@old_classification_map,
        { "c1" => "old-1" }
      )
      service.instance_variable_set(:@classification_id_map, {})

      service.send(
        :track_classification_id_change,
        { "code" => "c1", "id" => "new-1" }
      )

      map = service.instance_variable_get(:@classification_id_map)
      expect(map["new-1"]).to eq("old-1")
    end

    it "preserves existing PermitClassification ids by code and maps export ids" do
      service.instance_variable_set(:@classification_id_map, {})

      existing =
        instance_double("PermitClassification", id: "local-1", update!: true)
      allow(PermitClassification).to receive(:find_by) do |args|
        args[:code] == "c1" ? existing : nil
      end
      allow(PermitClassification).to receive(:create!)

      records = [
        {
          "id" => "export-1",
          "code" => "c1",
          "created_at" => "x",
          "name" => "N"
        },
        { "id" => "export-2", "code" => "c2", "name" => "N2" }
      ]

      service.send(:handle_classification_upsert, records)

      map = service.instance_variable_get(:@classification_id_map)
      expect(map["export-1"]).to eq("local-1")
      expect(map["export-2"]).to eq("export-2")
      expect(PermitClassification).to have_received(:create!).with(
        hash_including("code" => "c2")
      )
    end

    it "upsert_batch uses upsert_all for non-classification models" do
      model = class_double("SomeModel")
      allow(model).to receive(:upsert_all)

      service.send(:upsert_batch, model, [{ "id" => "1" }])

      expect(model).to have_received(:upsert_all).with(
        [{ "id" => "1" }],
        unique_by: :id
      )
    end

    it "process_deferred_updates applies update_all for each update" do
      model = class_double("SomeModel")
      scope = double("Scope", update_all: true)
      allow(model).to receive(:where).with(id: "1").and_return(scope)

      service.send(
        :process_deferred_updates,
        model,
        [{ :id => "1", "copied_from_id" => "2" }]
      )

      expect(scope).to have_received(:update_all).with(
        hash_including("copied_from_id" => "2", :id => "1")
      )
    end

    it "imports a model from zip, deferring self refs and flushing batches" do
      entry = instance_double("Zip::Entry")
      allow(zip_file).to receive(:find_entry).with("file.ndjson").and_return(
        entry
      )

      line1 = { "id" => "1", "name" => "A", "copied_from_id" => "2" }.to_json
      line2 = { "id" => "2", "name" => "B" }.to_json
      stream = StringIO.new("#{line1}\n#{line2}\n")
      allow(entry).to receive(:get_input_stream).and_return(stream)

      model = class_double("RequirementTemplateSection")
      allow(model).to receive(:upsert_all)
      allow(service).to receive(
        :apply_fixups
      ).and_wrap_original { |_m, _mc, attrs| attrs }
      allow(service).to receive(:process_deferred_updates)

      service.send(
        :import_model,
        zip_file,
        { filename: "file.ndjson", model: model, self_ref: "copied_from_id" }
      )

      expect(model).to have_received(:upsert_all).with(
        array_including(
          hash_including("id" => "1"),
          hash_including("id" => "2")
        ),
        unique_by: :id
      )
      expect(service).to have_received(:process_deferred_updates).with(
        model,
        array_including(hash_including(:id => "1", "copied_from_id" => "2"))
      )
    end

    it "skips import when zip entry is missing" do
      allow(zip_file).to receive(:find_entry).and_return(nil)

      model = class_double("RequirementBlock")
      expect(model).not_to receive(:upsert_all)

      service.send(
        :import_model,
        zip_file,
        { filename: "missing.ndjson", model: model }
      )
      expect(Rails.logger).to have_received(:warn).with(
        /Entry missing\.ndjson not found/
      )
    end
  end
end
