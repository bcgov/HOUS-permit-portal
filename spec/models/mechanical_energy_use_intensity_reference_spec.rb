require "rails_helper"

RSpec.describe MechanicalEnergyUseIntensityReference, type: :model do
  fixtures :mechanical_energy_use_intensity_references,
           :thermal_energy_demand_intensity_references

  describe "reference data lookups" do
    it "finds the correct MEUI reference by ranges and step" do
      checklist = create(:part_9_checklist, compliance_path: :step_code_ers)
      Part9StepCode::DataEntry.create!(
        checklist: checklist,
        hdd: 3500,
        above_grade_heated_floor_area: 30,
        below_grade_heated_floor_area: 10,
        design_cooling_load: 100,
        ac_cooling_capacity: 0.05,
        aec: 100,
        ref_aec: 200,
        baseloads: 10,
        building_volume: 400
      )

      requirement =
        StepCode::Compliance::CheckRequirements::Energy::MEUI.new(
          checklist: checklist,
          step: 3
        )

      expect(requirement.meui_requirement).to eq(90)
    end
  end

  describe "MEUI calculations" do
    it "calculates MEUI using the expected formula" do
      checklist = create(:part_9_checklist, compliance_path: :step_code_ers)
      Part9StepCode::DataEntry.create!(
        checklist: checklist,
        hdd: 3500,
        above_grade_heated_floor_area: 30,
        below_grade_heated_floor_area: 10,
        design_cooling_load: 100,
        ac_cooling_capacity: 0.05,
        aec: 100,
        ref_aec: 200,
        baseloads: 10,
        building_volume: 400
      )

      requirement =
        StepCode::Compliance::CheckRequirements::Energy::MEUI.new(
          checklist: checklist,
          step: 3
        )

      expected_meui =
        (90.0 / 40) *
          StepCode::Compliance::CheckRequirements::Energy::Base::KWH_PER_GJ

      expect(requirement.meui).to be_within(0.01).of(expected_meui)
      expect(requirement.requirements_met?).to eq(true)
    end
  end
end
