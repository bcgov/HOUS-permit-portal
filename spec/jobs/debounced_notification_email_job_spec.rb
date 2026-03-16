require "rails_helper"
require "sidekiq/testing"

RSpec.describe DebouncedNotificationEmailJob, type: :job do
  before { Sidekiq::Testing.fake! }

  it "locks by lock_key" do
    expect(
      described_class.lock_args(["k1", 10, "Agg", {}, "Mailer", "method"])
    ).to eq(["k1"])
  end

  it "calls aggregator and delivers email when payload is present" do
    aggregator_class = class_double("Agg", call: { foo: "bar" })
    stub_const("Agg", aggregator_class)

    mailer_class = class_double("SomeMailer")
    stub_const("SomeMailer", mailer_class)

    message = instance_double("Message", deliver_later: true)
    allow(mailer_class).to receive(:public_send).and_return(message)

    described_class.new.perform(
      "lock-key",
      60,
      "Agg",
      { "a" => 1 },
      "SomeMailer",
      "deliver_it"
    )

    expect(aggregator_class).to have_received(:call).with(
      a: 1,
      debounce_window_seconds: 60
    )
    expect(mailer_class).to have_received(:public_send).with(
      "deliver_it",
      foo: "bar"
    )
  end

  it "skips email when aggregator returns blank payload" do
    aggregator_class = class_double("Agg", call: nil)
    stub_const("Agg", aggregator_class)

    mailer_class = class_double("SomeMailer")
    stub_const("SomeMailer", mailer_class)
    allow(mailer_class).to receive(:public_send)

    described_class.new.perform(
      "lock-key",
      60,
      "Agg",
      {},
      "SomeMailer",
      "deliver_it"
    )

    expect(mailer_class).not_to have_received(:public_send)
  end
end
