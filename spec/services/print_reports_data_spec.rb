require "rails_helper"

RSpec.describe PrintReports::Data do
  let(:user) { create(:user, :submitter) }

  it "restores current cover metadata for saved application and checklist reports" do
    application = create(:permit_application, submitter: user)
    version =
      create(
        :submission_version,
        permit_application: application,
        form_json: {
          "components" => []
        },
        submission_data: {
          "data" => {
            "answer" => "Saved answer"
          }
        },
        step_code_checklist_json: {
          "step_code_type" => "Part3StepCode"
        }
      )
    application.permit_project.update!(full_address: "42 Current Avenue")
    user.update!(first_name: "Alex", last_name: "Applicant")
    application.template_version.requirement_template.update!(
      nickname: "Housing permit"
    )
    application.requirement_template.update!(tag_list: %w[Residential Addition])
    snapshot = version.reload.attributes

    data = described_class.for_generation
    reports = [
      data.application(application, version.id),
      data.application_step_code(application, version.id)
    ]
    reports.each do |report|
      expect(report[:identity]).to include(
        address: "42 Current Avenue",
        jurisdiction: application.jurisdiction.name,
        applicant: "Alex Applicant",
        tags: %w[Residential Addition],
        template_nickname: "Housing permit",
        submission_version_id: version.id,
        submitted_at: version.created_at
      )
    end
    expect(reports.first[:submission_data].dig("data", "answer")).to eq(
      "Saved answer"
    )
    expect(version.reload.attributes).to eq(snapshot)
  end

  it "renders saved submissions and applies enabled elective semantics without writes" do
    application = create(:permit_application, :newly_submitted, submitter: user)
    schema = {
      "components" => [
        {
          "id" => "block",
          "components" => [
            {
              "id" => "enabled",
              "key" => "a",
              "input" => true,
              "type" => "textfield",
              "elective" => true,
              "customConditional" => "show = true;show = false"
            },
            {
              "id" => "disabled",
              "key" => "b",
              "input" => true,
              "type" => "textfield",
              "elective" => true,
              "customConditional" => "show = true;show = false"
            }
          ]
        }
      ]
    }
    version = application.latest_submission_version
    version.update!(form_json: schema)
    allow(application).to receive(:form_customizations).and_return(
      {
        "requirement_block_changes" => {
          "block" => {
            "enabled_elective_field_ids" => ["enabled"]
          }
        }
      }
    )
    result = described_class.for_generation.application(application, version.id)
    fields = result[:form_json]["components"][0]["components"]
    expect(result[:identity][:status]).to eq("Submitted")
    expect(fields[0]["customConditional"]).to eq("show = true")
    expect(fields[1]["customConditional"]).to end_with(";show = false")
    expect(
      schema["components"][0]["components"][0]["customConditional"]
    ).to end_with(";show = false")
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
