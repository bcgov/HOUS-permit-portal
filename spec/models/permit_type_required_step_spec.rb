require "rails_helper"

RSpec.describe PermitTypeRequiredStep, type: :model do
  let(:min_energy_step) { ENV.fetch("PART_9_MIN_ENERGY_STEP", "0").to_i }
  let(:min_zero_carbon_step) do
    ENV.fetch("PART_9_MIN_ZERO_CARBON_STEP", "0").to_i
  end
  let(:max_energy_step) { ENV.fetch("PART_9_MAX_ENERGY_STEP", "10").to_i }
  let(:max_zero_carbon_step) do
    ENV.fetch("PART_9_MAX_ZERO_CARBON_STEP", "10").to_i
  end

  describe "associations" do
    it { should belong_to(:jurisdiction) }
    it { should belong_to(:permit_type) }
    it do
      should have_many(:step_code_checklists)
               .class_name("Part9StepCode::Checklist")
               .with_foreign_key("step_requirement_id")
               .dependent(:nullify)
    end
  end

  describe "validations" do
    let!(:permit_type) { create(:permit_type) }
    let!(:jurisdiction) { create(:sub_district) }

    it "enforces uniqueness for default steps per jurisdiction/permit_type" do
      default_step =
        jurisdiction.permit_type_required_steps.find_by(
          permit_type: permit_type,
          default: true
        ) ||
          described_class.create!(
            permit_type: permit_type,
            jurisdiction: jurisdiction,
            default: true,
            energy_step_required: min_energy_step,
            zero_carbon_step_required: min_zero_carbon_step
          )

      duplicate =
        described_class.new(
          permit_type: permit_type,
          jurisdiction: jurisdiction,
          default: true,
          energy_step_required: default_step.energy_step_required,
          zero_carbon_step_required: default_step.zero_carbon_step_required
        )

      expect(duplicate).not_to be_valid
    end

    it "sets default steps when values are missing" do
      step =
        described_class.new(
          permit_type: permit_type,
          jurisdiction: jurisdiction,
          default: true,
          energy_step_required: nil,
          zero_carbon_step_required: nil
        )

      step.valid?

      expect(step.energy_step_required).to eq(min_energy_step)
      expect(step.zero_carbon_step_required).to eq(min_zero_carbon_step)
    end

    it "validates required step ranges" do
      step =
        described_class.new(
          permit_type: permit_type,
          jurisdiction: jurisdiction,
          default: false,
          energy_step_required: min_energy_step - 1,
          zero_carbon_step_required: max_zero_carbon_step + 1
        )

      expect(step).not_to be_valid
      expect(step.errors[:energy_step_required]).to be_present
      expect(step.errors[:zero_carbon_step_required]).to be_present
    end
  end

  describe "overriding defaults" do
    let!(:permit_type) { create(:permit_type) }
    let!(:jurisdiction) { create(:sub_district) }

    it "nullifies existing default checklist links when overriding" do
      default_step =
        jurisdiction.permit_type_required_steps.find_by(
          permit_type: permit_type,
          default: true
        )
      checklist = create(:part_9_checklist, step_requirement: default_step)

      described_class.create!(
        permit_type: permit_type,
        jurisdiction: jurisdiction,
        default: false,
        energy_step_required: min_energy_step,
        zero_carbon_step_required: min_zero_carbon_step
      )

      expect(checklist.reload.step_requirement_id).to be_nil
    end
  end
end
