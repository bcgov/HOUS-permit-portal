require "rails_helper"

RSpec.describe Part3StepCode, type: :model do
  describe "#current_checklist" do
    it "returns the checklist for the current stage" do
      step_code = create(:part_3_step_code)
      as_built_checklist =
        create(:part_3_checklist, step_code: step_code, stage: :as_built)
      step_code.update!(current_stage: "as_built")

      expect(step_code.current_checklist).to eq(as_built_checklist)
      expect(step_code.primary_checklist).to eq(step_code.current_checklist)
    end
  end

  describe "#find_or_create_checklist_for!" do
    it "clones values from the nearest previous stage" do
      step_code = create(:part_3_step_code)
      pre_construction = step_code.pre_construction_checklist
      pre_construction.update!(
        heating_degree_days: 3220,
        completed_by_email: "energy@example.com"
      )
      fuel_type =
        create(:fuel_type, :district_energy, checklist: pre_construction)
      create(
        :energy_output,
        :modelled,
        checklist: pre_construction,
        fuel_type: fuel_type,
        annual_energy: 123,
        use_type: :interior_lighting
      )

      as_built = step_code.find_or_create_checklist_for!(stage: "as_built")

      expect(as_built.heating_degree_days).to eq(3220)
      expect(as_built.completed_by_email).to eq("energy@example.com")
      expect(
        as_built.section_completion_status.dig("project_details", "relevant")
      ).to be(false)
      expect(as_built.modelled_energy_outputs.count).to eq(1)
      expect(as_built.modelled_energy_outputs.first.fuel_type.checklist).to eq(
        as_built
      )
    end

    it "uses mid-construction as the source for as-built when present" do
      step_code = create(:part_3_step_code)
      mid_construction =
        step_code.find_or_create_checklist_for!(stage: "mid_construction")
      mid_construction.update!(completed_by_email: "mid@example.com")

      as_built = step_code.find_or_create_checklist_for!(stage: "as_built")

      expect(as_built.completed_by_email).to eq("mid@example.com")
    end
  end
end
