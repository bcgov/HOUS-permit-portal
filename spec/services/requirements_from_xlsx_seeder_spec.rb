require "rails_helper"

RSpec.describe RequirementsFromXlsxSeeder do
  describe ".seed" do
    it "reindexes even when xlsx file is missing" do
      allow(File).to receive(:exist?).and_return(false)
      allow(RequirementTemplate).to receive(:reindex)

      described_class.seed

      expect(RequirementTemplate).to have_received(:reindex)
    end

    it "opens workbook and calls setup_requirement_template when xlsx exists" do
      allow(File).to receive(:exist?).and_return(true)

      xlsx = double("Roo::Spreadsheet")
      req_sheet = double("ReqSheet")
      blocks_sheet = double("BlocksSheet")

      allow(Roo::Spreadsheet).to receive(:open).and_return(xlsx)
      allow(xlsx).to receive(:sheet).with("Dev-Requirements").and_return(
        req_sheet
      )
      allow(xlsx).to receive(:sheet).with(
        "Dev-RequirementBlocks-House"
      ).and_return(blocks_sheet)

      allow(req_sheet).to receive(:parse).with(headers: true).and_return(
        [
          { "requirement_code" => "requirement_code" },
          { "requirement_code" => "R1", "display_label" => "x" }
        ]
      )
      allow(RequirementTemplate).to receive(:reindex)
      allow(described_class).to receive(:setup_requirement_template)

      described_class.seed

      expect(described_class).to have_received(
        :setup_requirement_template
      ).with(
        "new_construction",
        "low_residential",
        blocks_sheet,
        array_including(hash_including("requirement_code" => "R1")),
        kind_of(Array)
      )
    end
  end

  describe ".seed_medium" do
    it "reindexes even when xlsx file is missing" do
      allow(File).to receive(:exist?).and_return(false)
      allow(RequirementTemplate).to receive(:reindex)

      described_class.seed_medium

      expect(RequirementTemplate).to have_received(:reindex)
    end
  end

  describe ".clear" do
    it "destroys template-related records" do
      allow(Requirement).to receive(:destroy_all)
      allow(RequirementBlock).to receive(:destroy_all)
      allow(RequirementTemplateSection).to receive(:destroy_all)

      described_class.clear

      expect(Requirement).to have_received(:destroy_all)
      expect(RequirementBlock).to have_received(:destroy_all)
      expect(RequirementTemplateSection).to have_received(:destroy_all)
    end
  end

  describe "private methods" do
    it "does not version when a published template version exists" do
      requirement_template =
        instance_double(
          "RequirementTemplate",
          published_template_version: double("TV")
        )
      described_class.send(
        :force_a_published_template_version,
        requirement_template
      )
    end

    it "schedules and publishes when there is no published template version" do
      requirement_template =
        instance_double("RequirementTemplate", published_template_version: nil)
      allow(Timecop).to receive(:freeze).and_yield

      tv = instance_double("TemplateVersion")
      allow(TemplateVersioningService).to receive(:schedule!).and_return(tv)
      allow(TemplateVersioningService).to receive(:publish_version!).and_return(
        tv
      )

      described_class.send(
        :force_a_published_template_version,
        requirement_template
      )

      expect(TemplateVersioningService).to have_received(:schedule!)
      expect(TemplateVersioningService).to have_received(
        :publish_version!
      ).with(tv)
    end

    it "setup_requirements adds errors when JSON parsing fails" do
      errors = []
      requirement = instance_double("Requirement", update!: true)
      req_assoc = double("ReqAssoc")

      allow(req_assoc).to receive(:present?).and_return(false)
      allow(req_assoc).to receive(:where).and_return(req_assoc)
      allow(req_assoc).to receive(:find_or_initialize_by).and_return(
        requirement
      )

      requirement_block =
        instance_double("RequirementBlock", requirements: req_assoc)
      allow(RequirementBlock).to receive(:reindex)

      valid_rows = [
        {
          "requirement_code" => "R1",
          "display_label" => "L",
          "input_type" => "text",
          "hint" => nil,
          "required" => "yes",
          "elective" => nil,
          "input_options" => "{bad json"
        }
      ]

      described_class.send(
        :setup_requirements,
        requirement_block,
        valid_rows,
        ["R1"],
        errors
      )

      expect(errors.join).to include("Error loading R1")
      expect(RequirementBlock).to have_received(:reindex)
    end

    it "setup_requirement_template creates or finds template and forces a published version" do
      errors = []
      sheet = double("BlocksSheet")

      tag_list = double("TagList")
      allow(tag_list).to receive(:add)
      template =
        double(
          "LiveRequirementTemplate",
          tag_list: tag_list,
          save!: true,
          reload: true
        )
      relation = double("Relation")
      allow(LiveRequirementTemplate).to receive(:where).with(
        nickname: "new_construction - low_residential"
      ).and_return(relation)
      allow(relation).to receive(:first_or_create).with(
        nickname: "new_construction - low_residential"
      ).and_return(template)

      allow(described_class).to receive(:setup_sheet)
      allow(described_class).to receive(:force_a_published_template_version)

      described_class.send(
        :setup_requirement_template,
        "new_construction",
        "low_residential",
        sheet,
        [],
        errors
      )

      expect(tag_list).to have_received(:add).with(
        "new_construction",
        "low_residential"
      )
      expect(described_class).to have_received(:setup_sheet).with(
        "new_construction",
        "low_residential",
        sheet,
        template,
        [],
        errors
      )
      expect(described_class).to have_received(
        :force_a_published_template_version
      ).with(template)
    end

    it "setup_sheet creates sections, blocks, and section-block links" do
      errors = []
      valid_rows = [
        {
          "requirement_code" => "R1",
          "display_label" => "L",
          "input_type" => "text"
        }
      ]

      row = Array.new(30)
      row[0] = "S1"
      row[1] = "Internal"
      row[2] = "Display"
      row[3] = "Desc"
      row[11] = "R1"

      sheet = double("Sheet")
      allow(sheet).to receive(:column).with(1).and_return([nil, nil, nil, "S1"])
      allow(sheet).to receive(:last_row).and_return(4)
      allow(sheet).to receive(:row).with(4).and_return(row)

      tsb = instance_double("TemplateSectionBlock", update!: true)
      tsb_relation = double("TSBRelation")
      allow(tsb_relation).to receive(:where).and_return(tsb_relation)
      allow(tsb_relation).to receive(:first_or_initialize).and_return(tsb)

      section =
        instance_double(
          "RequirementTemplateSection",
          name: "S1",
          template_section_blocks: tsb_relation,
          update!: true
        )
      sections_relation = double("SectionsRelation")
      allow(sections_relation).to receive(:where).and_return(sections_relation)
      allow(sections_relation).to receive(:first_or_create!).and_return(section)
      allow(sections_relation).to receive(:find) { |&blk| [section].find(&blk) }

      requirement_template =
        double("Template", requirement_template_sections: sections_relation)

      rb = instance_double("RequirementBlock")
      rb_relation = double("RBRelation")
      allow(RequirementBlock).to receive(:where).with(
        name: "Internal"
      ).and_return(rb_relation)
      allow(rb_relation).to receive(:first_or_create!).and_return(rb)

      allow(described_class).to receive(:setup_requirements)

      described_class.send(
        :setup_sheet,
        "new_construction",
        "low_residential",
        sheet,
        requirement_template,
        valid_rows,
        errors
      )

      expect(described_class).to have_received(:setup_requirements).with(
        rb,
        valid_rows,
        ["R1"],
        errors
      )
      expect(tsb).to have_received(:update!).with(hash_including(position: 0))
    end

    it "setup_requirements updates requirements and increments positions" do
      errors = []
      requirement = instance_double("Requirement", update!: true)

      req_assoc = double("ReqAssoc")
      allow(req_assoc).to receive(:present?).and_return(true)
      allow(req_assoc).to receive(:pluck).with(:position).and_return([1, 3])
      allow(req_assoc).to receive(:where).and_return(req_assoc)
      allow(req_assoc).to receive(:find_or_initialize_by).and_return(
        requirement
      )

      requirement_block =
        instance_double("RequirementBlock", requirements: req_assoc)
      allow(RequirementBlock).to receive(:reindex)

      valid_rows = [
        {
          "requirement_code" => "R1",
          "display_label" => "L",
          "input_type" => "text",
          "hint" => "h",
          "required" => nil,
          "elective" => "yes",
          "input_options" => ""
        }
      ]

      described_class.send(
        :setup_requirements,
        requirement_block,
        valid_rows,
        ["R1"],
        errors
      )

      expect(requirement).to have_received(:update!).with(
        hash_including(label: "L", elective: true, position: 4)
      )
      expect(RequirementBlock).to have_received(:reindex)
    end
  end
end
