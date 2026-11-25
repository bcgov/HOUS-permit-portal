require "rails_helper"

RSpec.describe Part3StepCode, type: :model do
  describe "#current_checklist" do
    it "returns the checklist for the current stage" do
      step_code = create(:part_3_step_code)
      as_built_checklist =
        create(:part_3_checklist, step_code: step_code, stage: :as_built)
      step_code.update!(current_stage: "as_built")

      expect(step_code.current_checklist).to eq(as_built_checklist)
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

  describe "#default_jurisdiction_heating_degree_days" do
    let(:jurisdiction) { create(:sub_district) }
    let(:step_code) { create(:part_3_step_code, jurisdiction: jurisdiction) }

    it "returns nil when the jurisdiction has no HDD rows" do
      expect(step_code.default_jurisdiction_heating_degree_days).to be_nil
    end

    it "returns the HDD when the jurisdiction has exactly one row" do
      create(
        :jurisdiction_heating_degree_day,
        jurisdiction: jurisdiction,
        heating_degree_days: 2825
      )

      expect(step_code.default_jurisdiction_heating_degree_days).to eq(2825)
    end

    it "returns nil when the jurisdiction has multiple HDD rows" do
      create(
        :jurisdiction_heating_degree_day,
        jurisdiction: jurisdiction,
        location_name: "Waterfront",
        heating_degree_days: 2825
      )
      create(
        :jurisdiction_heating_degree_day,
        jurisdiction: jurisdiction,
        location_name: "Lynn Valley",
        heating_degree_days: 3100
      )

      expect(step_code.default_jurisdiction_heating_degree_days).to be_nil
    end
  end
end
