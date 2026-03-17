require "rails_helper"
require "sidekiq/testing"

RSpec.describe ModelCallbackJob, type: :job do
  before { Sidekiq::Testing.fake! }

  it "has a uniqueness lock configured" do
    opts = described_class.get_sidekiq_options
    expect((opts["lock"] || opts[:lock]).to_s).to eq(
      "until_and_while_executing"
    )
    expect((opts["queue"] || opts[:queue]).to_s).to eq("model_callbacks")
  end

  it "invokes the callback on the model when found" do
    model = instance_double("SomeModel")
    allow(model).to receive(:do_it)

    model_class = class_double("SomeModel", find_by_id: model)
    stub_const("SomeModel", model_class)

    described_class.new.perform("SomeModel", "id-1", "do_it")

    expect(model).to have_received(:do_it)
  end

  it "no-ops when the model cannot be found" do
    model_class = class_double("SomeModel", find_by_id: nil)
    stub_const("SomeModel", model_class)

    expect {
      described_class.new.perform("SomeModel", "missing", "do_it")
    }.not_to raise_error
  end
end
