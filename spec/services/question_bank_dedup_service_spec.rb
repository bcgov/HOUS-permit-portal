require "rails_helper"

RSpec.describe QuestionBankDedupService do
  let(:block_a) { create(:requirement_block) }
  let(:block_b) { create(:requirement_block) }

  def make_requirement(block, label:, input_type: "text", input_options: {})
    create(
      :requirement,
      requirement_block: block,
      label: label,
      input_type: input_type,
      input_options: input_options
    )
  end

  describe ".cluster_candidates" do
    it "clusters placements with the same normalized signature" do
      make_requirement(block_a, label: "Email Address")
      make_requirement(block_b, label: "email address ") # whitespace/case only
      make_requirement(block_a, label: "Totally Different")

      clusters = described_class.cluster_candidates(min_cluster_size: 2)

      expect(clusters.size).to eq(1)
      expect(clusters.first.size).to eq(2)
    end

    it "ignores per-placement-only keys (in-block conditionals) when clustering" do
      make_requirement(block_a, label: "Shared Q")
      make_requirement(
        block_b,
        label: "Shared Q",
        input_options: {
          "conditional" => {
            "when" => "other",
            "operator" => "isEqual",
            "eq" => "x",
            "show" => true
          }
        }
      )

      clusters = described_class.cluster_candidates(min_cluster_size: 2)
      expect(clusters.size).to eq(1)
    end

    it "only considers unlinked placements" do
      definition =
        create(:question_definition, label: "Shared Q", input_type: "text")
      linked = make_requirement(block_a, label: "Shared Q")
      linked.update!(question_definition: definition)
      make_requirement(block_b, label: "Shared Q")

      clusters = described_class.cluster_candidates(min_cluster_size: 2)
      expect(clusters).to be_empty
    end
  end

  describe ".link_cluster!" do
    it "links placements value-preservingly (no resolved-value change) and is reversible" do
      r1 = make_requirement(block_a, label: "Owner Email")
      r2 = make_requirement(block_b, label: "Owner E-mail") # differs from proposed

      before_label_r2 = r2.reload.label

      definition =
        described_class.link_cluster!(requirement_ids: [r1.id, r2.id])

      r1.reload
      r2.reload

      expect(r1.question_definition_id).to eq(definition.id)
      expect(r2.question_definition_id).to eq(definition.id)
      # value-preserving: r2 keeps its original label via local_overrides
      expect(r2.resolved_label).to eq(before_label_r2)

      # reversible
      r2.detach_from_question_definition!
      expect(r2.reload.question_definition_id).to be_nil
      expect(r2.resolved_label).to eq(before_label_r2)
    end

    it "adopts canonical content for converge_ids" do
      r1 = make_requirement(block_a, label: "Owner Email")
      r2 = make_requirement(block_b, label: "Owner E-mail")

      definition =
        described_class.link_cluster!(
          requirement_ids: [r1.id, r2.id],
          converge_ids: [r2.id]
        )

      expect(r2.reload.resolved_label).to eq(definition.label)
    end
  end
end
