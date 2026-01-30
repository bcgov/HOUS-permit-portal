require "rails_helper"

RSpec.describe ThermalEnergyDemandIntensityReference, type: :model do
  fixtures :thermal_energy_demand_intensity_references

  describe "reference data lookups" do
    it "finds the correct TEDI reference by range and step" do
      checklist = create(:part_9_checklist, compliance_path: :step_code_ers)
      Part9StepCode::DataEntry.create!(
        checklist: checklist,
        hdd: 3500,
        above_grade_heated_floor_area: 40,
        below_grade_heated_floor_area: 10,
        aux_energy_required: 1000,
        ref_gshl: 100,
        proposed_gshl: 80,
        building_volume: 200
      )

      requirement =
        StepCode::Compliance::CheckRequirements::Energy::TEDI.new(
          checklist: checklist,
          step: 3
        )

      expect(requirement.tedi_requirement).to eq(15)
    end
  end

  describe "TEDI calculations" do
    it "calculates TEDI and meets requirements by value" do
      checklist = create(:part_9_checklist, compliance_path: :step_code_ers)
      Part9StepCode::DataEntry.create!(
        checklist: checklist,
        hdd: 3500,
        above_grade_heated_floor_area: 40,
        below_grade_heated_floor_area: 10,
        aux_energy_required: 1000,
        ref_gshl: 100,
        proposed_gshl: 80,
        building_volume: 200
      )

      requirement =
        StepCode::Compliance::CheckRequirements::Energy::TEDI.new(
          checklist: checklist,
          step: 3
        )

      expected_tedi =
        (1000.0 / 1000 / 50) *
          StepCode::Compliance::CheckRequirements::Energy::Base::KWH_PER_GJ

      expect(requirement.tedi).to be_within(0.01).of(expected_tedi)
      expect(requirement.requirements_met?).to eq(true)
    end

    it "returns zero when reference GSHL is zero" do
      checklist = create(:part_9_checklist, compliance_path: :step_code_ers)
      Part9StepCode::DataEntry.create!(
        checklist: checklist,
        hdd: 3500,
        above_grade_heated_floor_area: 40,
        below_grade_heated_floor_area: 10,
        aux_energy_required: 1000,
        ref_gshl: 0,
        proposed_gshl: 0,
        building_volume: 200
      )

      requirement =
        StepCode::Compliance::CheckRequirements::Energy::TEDI.new(
          checklist: checklist,
          step: 3
        )

      expect(requirement.tedi_hlr_percent).to eq(0)
    end
  end
end
