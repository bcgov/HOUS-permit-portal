require "rails_helper"

RSpec.describe "Question bank governance", type: :model do
  let(:requirement_block) { create(:requirement_block) }
  let(:requirement) do
    create(
      :requirement,
      requirement_block: requirement_block,
      label: "Governed Q",
      input_type: "text"
    )
  end

  def version_double(*requirements)
    instance_double(
      "TemplateVersion",
      requirement_blocks_json: {
        requirement_block.id => {
          "requirements" => requirements.map { |r| { "id" => r.id } }
        }
      }
    )
  end

  describe TemplateVersioningService,
           ".assert_publishable_question_definitions!" do
    it "passes when no placement is linked to a definition" do
      expect {
        described_class.assert_publishable_question_definitions!(
          version_double(requirement)
        )
      }.not_to raise_error
    end

    it "raises when a linked definition is not approved" do
      definition =
        create(
          :question_definition,
          label: "Governed Q",
          input_type: "text",
          review_state: :draft
        )
      requirement.update!(question_definition: definition)

      expect {
        described_class.assert_publishable_question_definitions!(
          version_double(requirement)
        )
      }.to raise_error(TemplateVersionPublishError)
    end

    it "passes when the linked definition is approved" do
      definition =
        create(
          :question_definition,
          label: "Governed Q",
          input_type: "text",
          review_state: :approved
        )
      requirement.update!(question_definition: definition)

      expect {
        described_class.assert_publishable_question_definitions!(
          version_double(requirement)
        )
      }.not_to raise_error
    end
  end

  describe "drift marking on shared-content edit" do
    let(:requirement_template) { create(:requirement_template) }
    let(:section) do
      create(
        :requirement_template_section,
        requirement_template: requirement_template
      )
    end

    before do
      create(
        :template_section_block,
        requirement_template_section: section,
        requirement_block: requirement_block
      )
      requirement # instantiate
    end

    it "marks referencing templates drift-pending when shared content changes" do
      definition =
        create(:question_definition, label: "Governed Q", input_type: "text")
      requirement.update!(question_definition: definition)

      expect {
        definition.update!(label: "Renamed shared question")
      }.to change {
        requirement_template.reload.question_bank_drift_pending_at
      }.from(nil)
    end

    it "does not mark drift for review_state-only edits" do
      definition =
        create(:question_definition, label: "Governed Q", input_type: "text")
      requirement.update!(question_definition: definition)
      requirement_template.update_columns(question_bank_drift_pending_at: nil)

      expect { definition.update!(review_state: :approved) }.not_to change {
        requirement_template.reload.question_bank_drift_pending_at
      }
    end
  end
end
