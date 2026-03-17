require "rails_helper"
require "sidekiq/testing"

RSpec.describe AutomatedCompliance::DigitalSealValidatorJob, type: :job do
  before { Sidekiq::Testing.fake! }

  it "runs the validator and broadcasts a compliance update" do
    permit_application =
      instance_double(
        "PermitApplication",
        id: "pa1",
        formatted_compliance_data: {
          ok: true
        },
        notifiable_users: double("UsersRel", pluck: ["u1"]),
        assign_attributes: true
      )
    allow(PermitApplication).to receive(:find).with("pa1").and_return(
      permit_application
    )

    validator =
      instance_double("AutomatedCompliance::DigitalSealValidator", call: true)
    allow(AutomatedCompliance::DigitalSealValidator).to receive(
      :new
    ).and_return(validator)

    allow(WebsocketBroadcaster).to receive(:push_update_to_relevant_users)
    allow(PermitApplicationBlueprint).to receive(:render_as_hash).and_return(
      { "x" => 1 }
    )

    described_class.new.perform("pa1")

    expect(validator).to have_received(:call).with(permit_application)
    expect(WebsocketBroadcaster).to have_received(
      :push_update_to_relevant_users
    )
  end

  it "is unique until and while executing" do
    opts = described_class.get_sidekiq_options
    expect((opts["lock"] || opts[:lock]).to_s).to eq(
      "until_and_while_executing"
    )
    expect((opts["queue"] || opts[:queue]).to_s).to eq("websocket")
  end
end
