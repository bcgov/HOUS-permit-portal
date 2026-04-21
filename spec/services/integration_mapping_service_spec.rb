require "rails_helper"

RSpec.describe IntegrationMappingService do
  let(:template_version) do
    instance_double("TemplateVersion", requirement_template_id: "rt-1")
  end
  let(:jurisdiction) { instance_double("Jurisdiction") }

  let(:integration_mapping) do
    double(
      "IntegrationMapping",
      id: "m1",
      jurisdiction: jurisdiction,
      template_version: template_version,
      requirements_mapping: requirements_mapping
    )
  end

  subject(:service) { described_class.new(integration_mapping) }

  before { allow(integration_mapping).to receive(:requirements_mapping=) }

  describe "#get_updated_requirements_mapping" do
    let(:requirements_mapping) do
      {
        "rb_sku" => {
          "id" => "rb1",
          "requirements" => {
            "code1" => {
              "id" => "r1",
              "local_system_mapping" => ""
            }
          }
        }
      }
    end

    it "returns nil when simplified_map is not a hash" do
      expect(service.get_updated_requirements_mapping(nil)).to be_nil
    end

    it "updates local_system_mapping only for existing mappings" do
      updated =
        service.get_updated_requirements_mapping(
          {
            "rb_sku" => {
              "code1" => "X",
              "missing" => "Y"
            },
            "missing_rb" => {
              "code1" => "Z"
            }
          }
        )

      expect(
        updated.dig("rb_sku", "requirements", "code1", "local_system_mapping")
      ).to eq("X")
      expect(updated.dig("rb_sku", "requirements").keys).to eq(["code1"])
    end
  end

  describe "#initialize_requirements_mapping!" do
    let(:requirements_mapping) { {} }

    it "initializes mapping from template_version requirement blocks and copies past mappings when available" do
      allow(template_version).to receive(:requirement_blocks_json).and_return(
        {
          "rb1" => {
            "sku" => "rb_sku",
            "requirements" => [{ "id" => "r1", "requirement_code" => "c1" }]
          }
        }
      )

      allow(service).to receive(
        :get_consolidated_requirements_mapping_from_past_records
      ).and_return(
        {
          "rb_sku" => {
            "requirements" => {
              "c1" => {
                "local_system_mapping" => "past"
              }
            }
          }
        }
      )

      service.initialize_requirements_mapping!

      expect(integration_mapping).to have_received(
        :requirements_mapping=
      ) do |new_map|
        expect(new_map.dig("rb_sku", "id")).to eq("rb1")
        expect(
          new_map.dig("rb_sku", "requirements", "c1", "local_system_mapping")
        ).to eq("past")
      end
    end
  end

  describe "#copyable_record_with_existing_mapping" do
    let(:requirements_mapping) { { "rb" => {} } }

    it "returns nil when no records with existing mapping are found" do
      allow(service).to receive(
        :fetch_records_with_existing_mapping
      ).and_return([])
      expect(service.copyable_record_with_existing_mapping("rb", "c")).to be_nil
    end

    it "delegates to preferred mapping record selection when records exist" do
      records = double("ARRelation")
      allow(records).to receive(:empty?).and_return(false)
      allow(service).to receive(
        :fetch_records_with_existing_mapping
      ).and_return(records)

      preferred = instance_double("IntegrationMapping")
      allow(service).to receive(:fetch_preferred_mapping_record_for_copy).with(
        records
      ).and_return(preferred)

      expect(service.copyable_record_with_existing_mapping("rb", "c")).to eq(
        preferred
      )
    end
  end

  describe "private consolidation and query helpers" do
    let(:requirements_mapping) { {} }

    it "returns empty hash when no past records exist" do
      allow(service).to receive(
        :fetch_ordered_integration_mappings_for_jurisdiction
      ).and_return([])
      expect(
        service.send(
          :get_consolidated_requirements_mapping_from_past_records,
          max_past_records: 1
        )
      ).to eq({})
    end

    it "consolidates mappings across past records without overwriting existing consolidated entries" do
      past_record =
        instance_double(
          "IntegrationMapping",
          requirements_mapping: {
            "rb_sku" => {
              "id" => "rb1",
              "requirements" => {
                "c1" => {
                  "id" => "r1",
                  "local_system_mapping" => "m1"
                }
              }
            }
          }
        )
      allow(service).to receive(
        :fetch_ordered_integration_mappings_for_jurisdiction
      ).and_return([past_record])

      consolidated =
        service.send(
          :get_consolidated_requirements_mapping_from_past_records,
          max_past_records: 1
        )
      expect(
        consolidated.dig("rb_sku", "requirements", "c1", "local_system_mapping")
      ).to eq("m1")
    end

    it "returns nil when jurisdiction is not present for ordered fetch" do
      allow(integration_mapping).to receive(:jurisdiction).and_return(nil)
      expect(
        service.send(:fetch_ordered_integration_mappings_for_jurisdiction)
      ).to be_nil
    end

    it "applies limit and offset when provided for ordered fetch" do
      relation = double("Relation")
      where_chain = double("WhereChain")
      allow(IntegrationMapping).to receive(:joins).with(
        :template_version
      ).and_return(relation)
      allow(relation).to receive(:where).with(
        jurisdiction: jurisdiction
      ).and_return(relation)
      allow(relation).to receive(:where).with(no_args).and_return(where_chain)
      allow(where_chain).to receive(:not).with(id: "m1").and_return(relation)
      allow(relation).to receive(:order).and_return(relation)
      allow(relation).to receive(:limit).and_return(relation)
      allow(relation).to receive(:offset).and_return(relation)
      allow(ActiveRecord::Base).to receive(:sanitize_sql_array).and_return(
        "ORDER"
      )

      service.send(
        :fetch_ordered_integration_mappings_for_jurisdiction,
        limit: 1,
        offset: 2
      )

      expect(relation).to have_received(:limit).with(1)
      expect(relation).to have_received(:offset).with(2)
    end
  end
end
