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
    permit_application = create(:permit_application)
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

    old_application = create(:permit_application)
    old =
      create_file_doc(
        old_application,
        data_key:
          "formSubmissionDataRSTsection1|RB1|energy_step_code_report_file"
      )
    old.update_column(:created_at, 2.years.ago)
    attach_current_files(old_application, old)

    names =
      zip_names(
        described_class.new(range: Reports::Range.parse("12_months")).zip
      )

    expect(names.length).to eq(2)
    expect(names).to include(in_range.standardized_filename)
    expect(names).not_to include(old.standardized_filename)
  end

  it "omits files that were removed from the Step Code block" do
    permit_application = create(:permit_application)
    data_key = "formSubmissionDataRSTsection1|RB1|energy_step_code_report_file"
    removed = create_file_doc(permit_application, data_key: data_key)
    current = create_file_doc(permit_application, data_key: data_key)
    attach_current_files(permit_application, current)

    names =
      zip_names(
        described_class.new(range: Reports::Range.parse("all_time")).zip
      )

    expect(names).to eq([current.standardized_filename])
    expect(names).not_to include(removed.standardized_filename)
  end
end
