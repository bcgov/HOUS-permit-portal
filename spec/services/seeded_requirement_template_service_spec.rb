require "rails_helper"

RSpec.describe SeededRequirementTemplateService, type: :service do
  before do
    allow(NotificationService).to receive(
      :publish_new_template_version_publish_event
    )
    allow(RequirementTemplate).to receive(:reindex)
    allow_any_instance_of(RequirementTemplate).to receive(:reindex)
  end

  describe ".seed!" do
    it "creates seeded templates with published, draft, and scheduled versions" do
      described_class.seed!

      described_class::SEEDED_TEMPLATE_NICKNAMES.each do |nickname|
        template = RequirementTemplate.find_by!(nickname:)

        expect(template.published_template_version).to be_present
        expect(template.draft_template_version).to be_present
        expect(template.scheduled_template_versions).to be_present
        expect(
          template.published_template_version.form_json.fetch("components")
        ).to be_present
      end
    end

    it "keeps Part 9 and Part 3 step code requirements separated" do
      described_class.seed!

      part_9_input_types =
        requirement_input_types("Sandbox - Large Part 9 Template")
      part_3_input_types =
        requirement_input_types("Sandbox - Large Part 3 Template")

      expect(part_9_input_types).to include("energy_step_code")
      expect(part_9_input_types).not_to include("energy_step_code_part_3")
      expect(part_3_input_types).to include("energy_step_code_part_3")
      expect(part_3_input_types).not_to include("energy_step_code")
    end

    it "includes requirement-level and block-level conditionals in snapshots" do
      described_class.seed!

      template =
        RequirementTemplate.find_by!(
          nickname: "Sandbox - Large Part 9 Template"
        )
      version = template.published_template_version

      requirements = version.form_json_requirements
      blocks =
        version
          .form_json
          .fetch("components")
          .flat_map { |section| section.fetch("components", []) }

      expect(
        requirements.any? do |requirement|
          requirement.dig("input_options", "conditional").present?
        end
      ).to be(true)
      expect(blocks.any? { |block| block["conditional"].present? }).to be(true)
    end

    it "is idempotent for seeded template structures" do
      described_class.seed!
      initial_counts = seeded_counts

      described_class.seed!

      expect(seeded_counts).to eq(initial_counts)
    end
  end

  def requirement_input_types(nickname)
    RequirementTemplate
      .find_by!(nickname:)
      .published_template_version
      .form_json_requirements
      .pluck("input_type")
  end

  def seeded_counts
    templates =
      RequirementTemplate.where(
        nickname: described_class::SEEDED_TEMPLATE_NICKNAMES
      )
    template_ids = templates.select(:id)
    sections =
      RequirementTemplateSection.where(requirement_template_id: template_ids)
    section_blocks =
      TemplateSectionBlock.where(requirement_template_section_id: sections)
    block_ids = section_blocks.distinct.pluck(:requirement_block_id)

    {
      templates: templates.count,
      template_versions:
        TemplateVersion.where(requirement_template_id: template_ids).count,
      sections: sections.count,
      section_blocks: section_blocks.count,
      blocks: block_ids.count,
      requirements: Requirement.where(requirement_block_id: block_ids).count
    }
  end
end
