require "rails_helper"

RSpec.describe Part3StepCode::Checklist, type: :model do
  describe "compliance_metrics" do
    let(:checklist) do
      create(:part_3_checklist, occupancy_classifications: occupancies)
    end

    context "when the checklist has step code occupancies" do
      let(:occupancies) do
        build_list(:step_code_occupancy, 1, :other_residential)
      end

      it "returns the correct metrics" do
        expect(checklist.compliance_metrics).to contain_exactly(
          :teui,
          :tedi,
          :ghgi
        )
      end
    end

    context "when the checklist does not have step code occupancies" do
      let(:occupancies) { build_list(:step_code_occupancy, 1, :low_industrial) }

      it "returns the correct metrics" do
        expect(checklist.compliance_metrics).to contain_exactly(:total_energy)
      end
    end
  end
end
