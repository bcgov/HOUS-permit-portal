require "rails_helper"

RSpec.describe PermitTypeRequiredStepSeeder do
  describe ".seed" do
    it "returns early when low_residential permit type is missing" do
      allow(PermitType).to receive(:find_by).with(
        code: "low_residential"
      ).and_return(nil)
      expect(Jurisdiction).not_to receive(:find_each)

      described_class.seed
    end

    it "creates required steps using jurisdiction values when available" do
      permit_type = instance_double("PermitType")
      allow(PermitType).to receive(:find_by).and_return(permit_type)

      jurisdiction =
        double(
          "Jurisdiction",
          energy_step_required: 3,
          zero_carbon_step_required: 2
        )
      allow(jurisdiction).to receive(:respond_to?).with(
        :energy_step_required
      ).and_return(true)
      allow(jurisdiction).to receive(:respond_to?).with(
        :zero_carbon_step_required
      ).and_return(true)
      allow(Jurisdiction).to receive(:find_each).and_yield(jurisdiction)

      ptr_step = instance_double("PermitTypeRequiredStep")
      allow(ptr_step).to receive(:default=)
      allow(ptr_step).to receive(:energy_step_required=)
      allow(ptr_step).to receive(:zero_carbon_step_required=)

      allow(PermitTypeRequiredStep).to receive(:find_or_create_by!).and_yield(
        ptr_step
      )

      described_class.seed

      expect(ptr_step).to have_received(:default=).with(true)
      expect(ptr_step).to have_received(:energy_step_required=).with(3)
      expect(ptr_step).to have_received(:zero_carbon_step_required=).with(2)
    end

    it "falls back to ENV when jurisdiction does not expose required step methods" do
      permit_type = instance_double("PermitType")
      allow(PermitType).to receive(:find_by).and_return(permit_type)

      jurisdiction = instance_double("Jurisdiction")
      allow(jurisdiction).to receive(:respond_to?).with(
        :energy_step_required
      ).and_return(false)
      allow(jurisdiction).to receive(:respond_to?).with(
        :zero_carbon_step_required
      ).and_return(false)
      allow(Jurisdiction).to receive(:find_each).and_yield(jurisdiction)

      allow(ENV).to receive(:[]).and_call_original
      allow(ENV).to receive(:[]).with("PART_9_MIN_ENERGY_STEP").and_return("1")
      allow(ENV).to receive(:[]).with("PART_9_MIN_ZERO_CARBON_STEP").and_return(
        "4"
      )

      ptr_step = instance_double("PermitTypeRequiredStep")
      allow(ptr_step).to receive(:default=)
      allow(ptr_step).to receive(:energy_step_required=)
      allow(ptr_step).to receive(:zero_carbon_step_required=)
      allow(PermitTypeRequiredStep).to receive(:find_or_create_by!).and_yield(
        ptr_step
      )

      described_class.seed

      expect(ptr_step).to have_received(:energy_step_required=).with(1)
      expect(ptr_step).to have_received(:zero_carbon_step_required=).with(4)
    end
  end
end
