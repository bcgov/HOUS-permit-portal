# frozen_string_literal: true

require "rails_helper"
require Rails.root.join(
          "db/data/20260709150001_backfill_requirement_questions.rb"
        )

RSpec.describe BackfillRequirementQuestions, type: :migration do
  describe "#up" do
    it "creates 1:1 bank rows, preserves codes, strips placement options, and links via FK" do
      block = create(:requirement_block)
      requirement =
        create(
          :requirement,
          requirement_block: block,
          requirement_question: nil,
          label: "Owner Name",
          requirement_code: "owner_name",
          input_type: :number,
          hint: "<p>help</p>",
          input_options: {
            "conditional" => {
              "when" => "other",
              "eq" => "yes"
            },
            "number_unit" => "m"
          }
        )
      # Same label on a different block: validates no cross-block dedup.
      other_block = create(:requirement_block)
      other =
        create(
          :requirement,
          requirement_block: other_block,
          requirement_question: nil,
          label: "Owner Name",
          requirement_code: "owner_name_2",
          input_type: :text
        )

      expect { described_class.new.up }.to change(
        RequirementQuestion,
        :count
      ).by(2)

      requirement.reload
      other.reload

      expect(requirement.requirement_question_id).to be_present
      expect(other.requirement_question_id).to be_present
      expect(requirement.requirement_question_id).not_to eq(
        other.requirement_question_id
      )

      question = requirement.requirement_question
      expect(question.requirement_code).to eq("owner_name")
      expect(question.label).to eq("Owner Name")
      expect(question.name).to eq("Owner Name")
      expect(question.hint).to eq("<p>help</p>")
      expect(question.input_options).not_to include("conditional")
      expect(question.input_options["number_unit"]).to eq("m")
      expect(requirement.read_attribute(:input_options)).to include(
        "conditional"
      )
      expect(requirement.requirement_code).to eq("owner_name")
      expect(other.requirement_question.label).to eq("Owner Name")
      expect(other.requirement_question.requirement_code).to eq("owner_name_2")
    end
  end
end

RSpec.describe "question_bank:rollback_backfill", type: :task do
  before { Rails.application.load_tasks }

  it "unlinks placements and deletes exclusively linked bank questions" do
    requirement = create(:requirement, requirement_question: nil)
    BackfillRequirementQuestions.new.up
    requirement.reload
    question_id = requirement.requirement_question_id
    expect(question_id).to be_present

    Rake::Task["question_bank:rollback_backfill"].reenable
    Rake::Task["question_bank:rollback_backfill"].invoke

    requirement.reload
    expect(requirement.requirement_question_id).to be_nil
    expect(RequirementQuestion.find_by(id: question_id)).to be_nil
    expect(requirement.requirement_code).to be_present
  end
end
