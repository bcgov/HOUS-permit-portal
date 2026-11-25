require "rails_helper"

RSpec.describe PrintReports::Data do
  let(:user) { create(:user, :submitter) }

  it "refuses historical reconstruction instead of reading live settings" do
    application = create(:permit_application)
    version = create(:submission_version, permit_application: application)
    expect {
      described_class.for_generation.application(application, version.id)
    }.to raise_error(
      PrintReports::Data::Unavailable,
      PrintReports::Snapshot::UNAVAILABLE
    )
  end

  it "requires an explicit version owned by the application" do
    application = create(:permit_application)
    other = create(:submission_version, :with_report_snapshot)
    expect {
      described_class.for_generation.application(application)
    }.to raise_error(ArgumentError)
    expect {
      described_class.for_generation.application(application, other.id)
    }.to raise_error(ActiveRecord::RecordNotFound)
  end

  it "serializes standalone Part 9 without writes or generation" do
    step = create(:part_9_step_code, creator: user)
    snapshots = [
      step.reload.attributes,
      step.current_checklist.reload.attributes
    ]
    result =
      described_class.for_generation.step_code(step, step.current_checklist.id)
    expect(result[:kind]).to eq("part9")
    expect(result[:identity][:checklist_id]).to eq(step.current_checklist.id)
    expect(
      [step.reload.attributes, step.current_checklist.reload.attributes]
    ).to eq(snapshots)
  end

  it "serializes standalone Part 3 without writes or generation" do
    step = create(:part_3_step_code, creator: user)
    snapshots = [
      step.reload.attributes,
      step.current_checklist.reload.attributes
    ]
    result =
      described_class.for_generation.step_code(step, step.current_checklist.id)
    expect(result[:kind]).to eq("part3")
    expect(result[:identity][:checklist_id]).to eq(step.current_checklist.id)
    expect(
      [step.reload.attributes, step.current_checklist.reload.attributes]
    ).to eq(snapshots)
  end
end
