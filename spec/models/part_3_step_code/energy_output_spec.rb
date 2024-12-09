require "rails_helper"

RSpec.describe Part3StepCode::EnergyOutput, type: :model do
  describe "associations" do
    it { should belong_to(:checklist) }
    it { should belong_to(:fuel_type) }
  end

  describe "enums" do
    it do
      should define_enum_for(:source).with_values(modelled: 0, reference: 1)
    end
    it do
      should define_enum_for(:use_type).with_values(
               interior_lighting: 0,
               exterior_lighting: 1,
               heating_general: 2,
               cooling: 3,
               pumps: 4,
               fans: 5,
               domestic_hot_water: 6,
               plug_loads: 7,
               heating_gas: 8,
               other: 9
             )
    end
  end

  describe "validations" do
    let(:checklist) { create(:part_3_checklist) }
    let(:fuel_type) { create(:fuel_type) }

    context "name validations" do
      it "allows blank name for non-other use types" do
        energy_output =
          build(
            :energy_output,
            use_type: :interior_lighting,
            name: nil,
            checklist: checklist,
            fuel_type: fuel_type
          )
        expect(energy_output).to be_valid
      end

      it "requires name when use_type is other" do
        energy_output =
          build(
            :energy_output,
            use_type: :other,
            name: nil,
            checklist: checklist,
            fuel_type: fuel_type
          )
        expect(energy_output).not_to be_valid
        expect(energy_output.errors[:name]).to include("can't be blank")
      end

      it "validates name uniqueness within checklist for other use_type" do
        create(
          :energy_output,
          use_type: :other,
          name: "Custom Output",
          checklist: checklist,
          fuel_type: fuel_type
        )

        duplicate =
          build(
            :energy_output,
            use_type: :other,
            name: "Custom Output",
            checklist: checklist,
            fuel_type: fuel_type
          )

        expect(duplicate).not_to be_valid
        expect(duplicate.errors[:name]).to include("has already been taken")
      end
    end

    context "use_type uniqueness" do
      it "validates use_type uniqueness within checklist for non-other types" do
        create(
          :energy_output,
          use_type: :interior_lighting,
          checklist: checklist,
          fuel_type: fuel_type
        )

        duplicate =
          build(
            :energy_output,
            use_type: :interior_lighting,
            checklist: checklist,
            fuel_type: fuel_type
          )

        expect(duplicate).not_to be_valid
        expect(duplicate.errors[:use_type]).to include("has already been taken")
      end

      it "allows multiple 'other'use_type as long as they have unique names" do
        create(
          :energy_output,
          use_type: :other,
          name: "Custom Output 1",
          checklist: checklist,
          fuel_type: fuel_type
        )

        another_other =
          build(
            :energy_output,
            use_type: :other,
            name: "Custom Output 2",
            checklist: checklist,
            fuel_type: fuel_type
          )

        expect(another_other).to be_valid
      end
    end
  end
end
