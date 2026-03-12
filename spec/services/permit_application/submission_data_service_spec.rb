require "rails_helper"

RSpec.describe PermitApplication::SubmissionDataService do
  let(:permit_application) { instance_double("PermitApplication") }
  let(:service) { described_class.new(permit_application) }

  before do
    stub_const("PermitApplication::COMPLETION_SECTION_KEY", "completion")
  end

  describe "#formatted_submission_data" do
    it "filters by permissions but always includes completion section if present" do
      submission_data = {
        "data" => {
          "s1" => {
            "x|RBallowed|a" => 1,
            "x|RBdenied|b" => 2
          },
          "completion" => {
            "done" => true
          }
        }
      }

      user = instance_double("User", id: "u1")
      allow(permit_application).to receive(:submission_data).and_return(
        submission_data
      )
      allow(permit_application).to receive(
        :submission_requirement_block_edit_permissions
      ).with(user_id: "u1").and_return(["allowed"])

      result = service.formatted_submission_data(current_user: user)

      expect(result.dig("data", "s1").keys).to include("x|RBallowed|a")
      expect(result.dig("data", "s1").keys).not_to include("x|RBdenied|b")
      expect(result.dig("data", "completion")).to eq({ "done" => true })
    end
  end

  describe "#update_with_submission_data_merge" do
    it "updates directly when current_user is blank" do
      params = { submission_data: { "data" => {} }, nickname: "X" }
      allow(permit_application).to receive(:update).and_return(true)

      expect(
        service.update_with_submission_data_merge(
          permit_application_params: params,
          current_user: nil
        )
      ).to eq(true)
      expect(permit_application).to have_received(:update).with(params)
    end

    it "merges only permitted fields into existing submission data under lock" do
      existing = {
        "data" => {
          "s1" => {
            "x|RBallowed|a" => 1,
            "x|RBdenied|b" => 2
          }
        }
      }
      incoming = {
        "data" => {
          "s1" => {
            "x|RBallowed|a" => 9,
            "x|RBdenied|b" => 99
          }
        }
      }
      params = { submission_data: incoming }

      user = instance_double("User", id: "u1")

      allow(permit_application).to receive(:with_lock).and_yield
      allow(permit_application).to receive(:submission_data).and_return(
        existing
      )
      allow(permit_application).to receive(
        :submission_requirement_block_edit_permissions
      ).with(user_id: "u1").and_return(["allowed"])
      allow(permit_application).to receive(:update).and_return(true)

      service.update_with_submission_data_merge(
        permit_application_params: params,
        current_user: user
      )

      expect(permit_application).to have_received(:update) do |merged|
        expect(
          merged[:submission_data].dig("data", "s1", "x|RBallowed|a")
        ).to eq(9)
        expect(
          merged[:submission_data].dig("data", "s1", "x|RBdenied|b")
        ).to eq(2) # unchanged
      end
    end
  end
end
