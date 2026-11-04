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
    allow(permit_application).to receive(:reload).and_return(permit_application)
    allow(DigitalSealChecks).to receive(:new).with(
      permit_application
    ).and_return(instance_double(DigitalSealChecks, pending_documents: []))

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

  it "checks uploads saved during broadcasting after its unique lock releases" do
    application = create(:permit_application)
    key = "section|RBblock|design_file"
    allow_any_instance_of(TemplateVersion).to receive(:lookup_props).and_return(
      key => {
        "computedCompliance" => {
          "module" => "DigitalSealValidator"
        }
      }
    )
    allow(PermitApplication).to receive(:find).with(application.id).and_return(
      application
    )
    allow(PermitApplicationBlueprint).to receive(:render_as_hash).and_return({})
    allow_any_instance_of(AutomatedCompliance::DigitalSealValidator).to receive(
      :call
    ).and_return(true)
    allow(WebsocketBroadcaster).to receive(:push_update_to_relevant_users) do
      doc =
        create(
          :supporting_document,
          permit_application: application,
          data_key: key
        )
      application.update!(
        submission_data: {
          "data" => {
            "section" => {
              key => [{ "id" => doc.file_id, "modelId" => doc.id }]
            }
          }
        }
      )
    end
    job = described_class.new
    job.perform(application.id)
    expect(described_class.jobs).to be_empty
    job.after_unlock
    expect(described_class.jobs.map { |j| j["args"] }).to eq([[application.id]])
  end
end
