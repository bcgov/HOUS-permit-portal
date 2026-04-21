require "rails_helper"
require "sidekiq/testing"

RSpec.describe RemindReviewerJob, type: :job do
  before { Sidekiq::Testing.fake! }

  it "has no unique lock so retries are not suppressed" do
    opts = described_class.get_sidekiq_options
    expect(opts["lock"] || opts[:lock]).to be_nil
  end

  it "emails each confirmed submission contact for the jurisdiction's unviewed applications" do
    apps_relation = double("AppsRelation", any?: true)
    contact = instance_double("SubmissionContact")
    contacts_scope = double("ContactsScope", confirmed: [contact])

    jurisdiction =
      instance_double(
        "Jurisdiction",
        unviewed_permit_applications: apps_relation,
        submission_contacts: contacts_scope
      )

    allow(Jurisdiction).to receive(:all).and_return([jurisdiction])

    mail = double("Mail", deliver: true)
    allow(PermitHubMailer).to receive(:remind_reviewer).and_return(mail)

    described_class.perform_async
    described_class.perform_one

    expect(PermitHubMailer).to have_received(:remind_reviewer).with(
      contact,
      apps_relation
    )
  end

  it "does nothing when there are no unviewed applications" do
    apps_relation = double("AppsRelation", any?: false)
    jurisdiction =
      instance_double(
        "Jurisdiction",
        unviewed_permit_applications: apps_relation,
        submission_contacts: double("ContactsScope", confirmed: [])
      )
    allow(Jurisdiction).to receive(:all).and_return([jurisdiction])
    allow(PermitHubMailer).to receive(:remind_reviewer)

    described_class.perform_async
    described_class.perform_one

    expect(PermitHubMailer).not_to have_received(:remind_reviewer)
  end
end
