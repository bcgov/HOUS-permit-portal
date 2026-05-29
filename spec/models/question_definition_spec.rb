require "rails_helper"

RSpec.describe QuestionDefinition, type: :model do
  describe "validations" do
    it { should validate_presence_of(:label) }
    it { should validate_presence_of(:input_type) }
  end

  describe "associations" do
    it { should have_many(:requirements) }
  end

  describe "enums" do
    it "shares the input_type vocabulary with Requirement" do
      expect(described_class.input_types).to eq(Requirement.input_types)
    end

    it "defaults review_state to draft" do
      expect(build(:question_definition).review_state).to eq("draft")
    end
  end
end

RSpec.describe Requirement, "question-bank resolution", type: :model do
  let(:requirement_block) { create(:requirement_block) }

  describe "an unlinked placement (question_definition_id IS NULL)" do
    let(:requirement) do
      create(
        :requirement,
        requirement_block: requirement_block,
        label: "Local label",
        input_type: "text",
        hint: "local hint"
      )
    end

    it "resolves to its own column values verbatim" do
      expect(requirement.linked_to_question_definition?).to be(false)
      expect(requirement.resolved_label).to eq("Local label")
      expect(requirement.resolved_hint).to eq("local hint")
      expect(requirement.resolved_input_type).to eq("text")
      expect(requirement.resolved_input_options).to eq(
        requirement.input_options
      )
    end

    it "produces a default-view blueprint identical to the pre-bank behavior" do
      blueprint = RequirementBlueprint.render_as_hash(requirement)

      expect(blueprint[:label]).to eq("Local label")
      expect(blueprint[:input_type]).to eq("text")
      expect(blueprint[:hint]).to eq("local hint")
      # Linkage metadata must NOT leak into the default view (publish snapshot).
      expect(blueprint).not_to have_key(:is_shared)
      expect(blueprint).not_to have_key(:question_definition_id)
    end

    it "reports unlinked in the authoring view" do
      blueprint =
        RequirementBlueprint.render_as_hash(requirement, view: :authoring)

      expect(blueprint[:is_shared]).to be(false)
      expect(blueprint[:question_definition_id]).to be_nil
    end
  end

  describe "a placement linked to a definition" do
    let(:definition) do
      create(
        :question_definition,
        label: "Shared label",
        hint: "shared hint",
        instructions: "shared instructions",
        input_type: "select",
        input_options: {
          "value_options" => [{ "label" => "A", "value" => "a" }]
        }
      )
    end

    let(:requirement) do
      create(
        :requirement,
        requirement_block: requirement_block,
        label: "stale local label",
        input_type: "text",
        question_definition: definition
      )
    end

    it "inherits the definition's shareable values" do
      expect(requirement.resolved_label).to eq("Shared label")
      expect(requirement.resolved_hint).to eq("shared hint")
      expect(requirement.resolved_instructions).to eq("shared instructions")
      expect(requirement.resolved_input_type).to eq("select")
      expect(requirement.resolved_input_options["value_options"]).to eq(
        [{ "label" => "A", "value" => "a" }]
      )
    end

    it "materializes resolved values onto its own columns on save" do
      requirement.reload
      expect(requirement.label).to eq("Shared label")
      expect(requirement.input_type).to eq("select")
    end

    it "keeps its own per-placement requirement_code" do
      expect(requirement.requirement_code).not_to eq(
        definition.requirement_code
      )
      expect(requirement.requirement_code).to be_present
    end

    it "lets local_overrides win over the definition" do
      requirement.update!(local_overrides: { "label" => "Overridden" })
      expect(requirement.resolved_label).to eq("Overridden")
      expect(requirement.resolved_hint).to eq("shared hint")
    end

    it "preserves placement-only in-block conditionals" do
      requirement.update!(local_overrides: { "input_options" => {} })
      requirement.update_column(
        :input_options,
        requirement.input_options.merge(
          "conditional" => {
            "when" => "other_code",
            "operator" => "isEqual",
            "eq" => "x",
            "show" => true
          }
        )
      )
      requirement.reload

      expect(requirement.resolved_input_options["conditional"]["when"]).to eq(
        "other_code"
      )
      # definition content still inherited alongside the placement conditional
      expect(requirement.resolved_input_options["value_options"]).to be_present
    end

    it "exposes linkage metadata through the authoring view" do
      blueprint =
        RequirementBlueprint.render_as_hash(requirement, view: :authoring)
      expect(blueprint[:is_shared]).to be(true)
      expect(blueprint[:question_definition_id]).to eq(definition.id)
      expect(blueprint[:shared_review_state]).to eq("draft")
      expect(blueprint[:label]).to eq("Shared label")
    end
  end
end
