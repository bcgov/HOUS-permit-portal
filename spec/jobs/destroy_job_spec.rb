require "rails_helper"
require "sidekiq/testing"

RSpec.describe DestroyJob, type: :job do
  before { Sidekiq::Testing.fake! }

  it "disables the unique lock to allow retries" do
    opts = described_class.get_sidekiq_options
    expect((opts["lock"] || opts[:lock]).to_s).to eq("none")
  end

  it "destroys an attachment via the Shrine attacher" do
    attacher = instance_double("Attacher", destroy: true)
    attacher_class = class_double("SomeAttacher", from_data: attacher)
    stub_const("SomeAttacher", attacher_class)

    described_class.perform_async("SomeAttacher", { "file" => "data" })
    described_class.perform_one

    expect(attacher_class).to have_received(:from_data).with(
      { "file" => "data" }
    )
  end

  it "re-raises errors to allow Sidekiq retries" do
    attacher_class = class_double("SomeAttacher")
    stub_const("SomeAttacher", attacher_class)
    allow(attacher_class).to receive(:from_data).and_raise(
      StandardError,
      "boom"
    )

    described_class.perform_async("SomeAttacher", {})
    expect { described_class.perform_one }.to raise_error(StandardError, "boom")
  end
end
