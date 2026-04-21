require "rails_helper"
require "sidekiq/testing"

RSpec.describe RemindReviewerJob, type: :job do
  before { Sidekiq::Testing.fake! }

  it "has no unique lock so retries are not suppressed" do
    opts = described_class.get_sidekiq_options
    expect(opts["lock"] || opts[:lock]).to be_nil
  end

  it "emails submission contacts for unviewed applications matching permit type" do
    apps_relation = double("AppsRelation")
    allow(apps_relation).to receive(:any?).and_return(true)

    apps_for_type = double("AppsForType", any?: true)
    allow(apps_relation).to receive(:where).with(
      permit_type: "building"
    ).and_return(apps_for_type)

    contact =
      instance_double("PermitTypeSubmissionContact", permit_type: "building")
    contacts_relation = [contact]

    jurisdiction =
      instance_double(
        "Jurisdiction",
        unviewed_permit_applications: apps_relation,
        permit_type_submission_contacts: contacts_relation
      )

    allow(Jurisdiction).to receive(:all).and_return([jurisdiction])

    mail = double("Mail", deliver: true)
    allow(PermitHubMailer).to receive(:remind_reviewer).and_return(mail)

    described_class.perform_async
    described_class.perform_one

    expect(PermitHubMailer).to have_received(:remind_reviewer).with(
      contact,
      apps_for_type
    )
  end

  it "does nothing when there are no unviewed applications" do
    apps_relation = double("AppsRelation", any?: false)
    jurisdiction =
      instance_double(
        "Jurisdiction",
        unviewed_permit_applications: apps_relation,
        permit_type_submission_contacts: []
      )
    allow(Jurisdiction).to receive(:all).and_return([jurisdiction])
    allow(PermitHubMailer).to receive(:remind_reviewer)

    described_class.perform_async
    described_class.perform_one

    expect(PermitHubMailer).not_to have_received(:remind_reviewer)
  end
end
