require "rails_helper"
require "zip"

RSpec.describe StepCodeFileUploadZipService do
  def zip_names(zip_string)
    names = []
    Zip::InputStream.open(StringIO.new(zip_string)) do |io|
      while (entry = io.get_next_entry)
        names << entry.name
      end
    end
    names
  end

  def create_file_doc(permit_application, data_key:, created_at: Time.current)
    create(
      :supporting_document,
      permit_application: permit_application,
      data_key: data_key,
      file_data: TestData.file_data,
      created_at: created_at
    )
  end

  def complete_part_9(permit_application, completed_at: Time.current)
    step_code =
      create(:part_9_step_code, permit_application: permit_application)
    step_code.pre_construction_checklist.update!(
      status: :complete,
      section_completion_status:
        Part9StepCode::Checklist.fully_complete_section_completion_status,
      stage_completed_at: completed_at
    )
    step_code
  end

  def attach_current_files(permit_application, *documents)
    files =
      documents.each_with_object({}) do |document, memo|
        memo[document.data_key] = [{ "modelId" => document.id }]
      end
    permit_application.update!(
      submission_data: {
        "data" => {
          "section1" => files
        }
      }
    )
  end

  it "zips Step Code file-upload documents in the selected range" do
    permit_application =
      create(:permit_application, with_fake_plan_document: true)
    in_range =
      create_file_doc(
        permit_application,
        data_key:
          "formSubmissionDataRSTsection1|RB1|energy_step_code_report_file"
      )
    h2000 =
      create_file_doc(
        permit_application,
        data_key:
          "formSubmissionDataRSTsection1|RB1|energy_step_code_h2000_file"
      )
    create_file_doc(
      permit_application,
      data_key: "formSubmissionDataRSTsection1|RB1|architectural_drawing_file"
    )
    attach_current_files(permit_application, in_range, h2000)
    complete_part_9(permit_application)

    old_application = create(:permit_application, with_fake_plan_document: true)
    old =
      create_file_doc(
        old_application,
        data_key:
          "formSubmissionDataRSTsection1|RB1|energy_step_code_report_file"
      )
    attach_current_files(old_application, old)
    complete_part_9(old_application, completed_at: 2.years.ago)

    names =
      zip_names(
        described_class.new(range: Reports::Range.parse("12_months")).zip
      )

    expect(names.length).to eq(2)
    expect(names).to include(in_range.standardized_filename)
    expect(names).not_to include(old.standardized_filename)
  end

  it "omits files that were removed from the Step Code block" do
    permit_application =
      create(:permit_application, with_fake_plan_document: true)
    data_key = "formSubmissionDataRSTsection1|RB1|energy_step_code_report_file"
    removed = create_file_doc(permit_application, data_key: data_key)
    current = create_file_doc(permit_application, data_key: data_key)
    attach_current_files(permit_application, current)
    complete_part_9(permit_application)

    names =
      zip_names(
        described_class.new(range: Reports::Range.parse("all_time")).zip
      )

    expect(names).to eq([current.standardized_filename])
    expect(names).not_to include(removed.standardized_filename)
  end

  it "excludes files on sandboxed applications" do
    data_key = "formSubmissionDataRSTsection1|RB1|energy_step_code_report_file"
    live_application =
      create(:permit_application, with_fake_plan_document: true)
    live = create_file_doc(live_application, data_key: data_key)
    attach_current_files(live_application, live)
    complete_part_9(live_application)

    jurisdiction = create(:sub_district)
    sandboxed_application =
      create(
        :permit_application,
        jurisdiction: jurisdiction,
        sandbox: published_sandbox(jurisdiction),
        with_fake_plan_document: true
      )
    sandboxed = create_file_doc(sandboxed_application, data_key: data_key)
    attach_current_files(sandboxed_application, sandboxed)
    complete_part_9(sandboxed_application)

    names =
      zip_names(
        described_class.new(range: Reports::Range.parse("all_time")).zip
      )

    expect(names).to eq([live.standardized_filename])
  end

  it "includes a HOT2000 file on a completed standalone checklist and skips a draft" do
    completed = create(:part_9_step_code)
    attach_h2k(completed.pre_construction_checklist, "completed.h2k")
    completed.pre_construction_checklist.update!(
      status: :complete,
      section_completion_status:
        Part9StepCode::Checklist.fully_complete_section_completion_status,
      stage_completed_at: Time.current
    )
    draft = create(:part_9_step_code)
    attach_h2k(draft.pre_construction_checklist, "draft.h2k")

    names =
      zip_names(
        described_class.new(range: Reports::Range.parse("all_time")).zip
      )

    expect(names).to eq(["completed.h2k"])
  end

  def attach_h2k(checklist, filename)
    fixture_path = Rails.root.join("spec/support/Test Model side 1.h2k")
    uploaded_file =
      File.open(fixture_path) do |file|
        H2kFileUploader.upload(file, :store, metadata: false)
      end
    uploaded_file.metadata.merge!(
      "filename" => filename,
      "size" => File.size(fixture_path),
      "mime_type" => "application/octet-stream"
    )
    checklist.data_entries.create!(h2k_file_data: uploaded_file.data)
  end
end
