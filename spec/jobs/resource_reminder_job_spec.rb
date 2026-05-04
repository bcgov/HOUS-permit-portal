require "rails_helper"
require "sidekiq/testing"

RSpec.describe ResourceReminderJob, type: :job do
  before { Sidekiq::Testing.fake! }

  it "has no unique lock so retries are not suppressed" do
    opts = described_class.get_sidekiq_options
    expect(opts["lock"] || opts[:lock]).to be_nil
  end

  it "publishes reminders and updates stale resources" do
    allow(ENV).to receive(:fetch).and_call_original
    allow(ENV).to receive(:fetch).with(
      "RESOURCE_REMINDER_DAYS",
      180
    ).and_return("180")

    stale_resources =
      double("StaleResources", any?: true, pluck: %w[r1 r2], update_all: true)
    resources_assoc =
      double("ResourcesAssoc").tap do |rel|
        allow(rel).to receive(:where).and_return(stale_resources)
      end

    jurisdiction = instance_double("Jurisdiction", resources: resources_assoc)

    jurisdictions_relation = double("JurisdictionsRelation")
    allow(jurisdictions_relation).to receive(:find_each).and_yield(jurisdiction)
    allow(Jurisdiction).to receive(:all).and_return(jurisdictions_relation)

    allow(NotificationService).to receive(:publish_resource_reminder_event)

    described_class.perform_async
    described_class.perform_one

    expect(NotificationService).to have_received(
      :publish_resource_reminder_event
    ).with(jurisdiction, %w[r1 r2])
    expect(stale_resources).to have_received(:update_all).with(
      last_reminder_sent_at: kind_of(Time)
    )
  end

  it "skips jurisdictions with no stale resources" do
    allow(ENV).to receive(:fetch).and_call_original
    allow(ENV).to receive(:fetch).with(
      "RESOURCE_REMINDER_DAYS",
      180
    ).and_return("180")

    stale_resources = double("StaleResources", any?: false)
    resources_assoc = double("ResourcesAssoc", where: stale_resources)
    jurisdiction = instance_double("Jurisdiction", resources: resources_assoc)

    jurisdictions_relation = double("JurisdictionsRelation")
    allow(jurisdictions_relation).to receive(:find_each).and_yield(jurisdiction)
    allow(Jurisdiction).to receive(:all).and_return(jurisdictions_relation)

    allow(NotificationService).to receive(:publish_resource_reminder_event)

    described_class.perform_async
    described_class.perform_one

    expect(NotificationService).not_to have_received(
      :publish_resource_reminder_event
    )
  end
end
