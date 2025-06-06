require "rails_helper"

RSpec.describe SubmissionDataKeyConverterService,
               type: :service,
               search: true do
  describe ".call" do
    # Ensure necessary base data for factories if they rely on `first` records
    let!(:jurisdiction) { FactoryBot.create(:sub_district) }
    let!(:permit_type) do
      PermitType.first ||
        FactoryBot.create(:permit_type, code: :low_residential)
    end
    let!(:activity) do
      Activity.first || FactoryBot.create(:activity, code: :new_construction)
    end
    let!(:template_version) { FactoryBot.create(:template_version) }

    let!(:file_data_snake_case) do
      {
        "id" => "file1.pdf",
        "size" => 12_345,
        "type" => "application/pdf",
        "storage" => "s3custom",
        "filename" => "file1-uuid.pdf",
        "original_name" => "original_file1.pdf",
        "model_id" => "model-uuid-1",
        "group_id" => "group-uuid-1",
        "group_permissions" => "read_only"
      }.stringify_keys # Ensure string keys as they would be from DB/JSON
    end

    let!(:file_data_camel_case) do
      {
        "id" => "file2.pdf",
        "size" => 67_890,
        "type" => "application/pdf",
        "storage" => "s3custom",
        "filename" => "file2-uuid.pdf",
        "originalName" => "original_file2.pdf",
        "modelId" => "model-uuid-2",
        "groupId" => "group-uuid-2",
        "groupPermissions" => "read_write"
      }.stringify_keys
    end

    let!(:file_data_mixed_case) do
      {
        "id" => "file3.pdf",
        "size" => 11_223,
        "type" => "application/pdf",
        "storage" => "s3custom",
        "filename" => "file3-uuid.pdf",
        "original_name" => "original_file3.pdf", # snake
        "modelId" => "model-uuid-3", # camel
        "group_id" => "group-uuid-3", # snake
        "groupPermissions" => "execute" # camel
      }.stringify_keys
    end

    let!(:non_file_data) { { "some_other_key" => "some_value" }.stringify_keys }

    let!(:submission_data_with_snake) do
      {
        "data" => {
          "sectionA" => {
            "file_upload_field" => [file_data_snake_case.deep_dup]
          },
          "sectionB" => {
            "nested_array" => [
              {
                "another_file_field" => [
                  file_data_snake_case.deep_dup,
                  file_data_camel_case.deep_dup
                ]
              },
              non_file_data.deep_dup
            ]
          }
        }
      }.deep_stringify_keys # Ensure all keys are strings
    end

    let!(:submission_data_with_mixed) do
      {
        "data" => {
          "sectionMix" => {
            "mixed_file_upload" => [file_data_mixed_case.deep_dup]
          }
        }
      }.deep_stringify_keys
    end

    let!(:submission_data_all_camel) do
      {
        "data" => {
          "sectionC" => {
            "file_upload_field_camel" => [file_data_camel_case.deep_dup]
          }
        }
      }.deep_stringify_keys
    end

    # Clean database before running full suite of tests in this describe block
    before(:all) do
      # Consider DatabaseCleaner or similar for more robust test DB management
      PermitApplication.destroy_all
      # Ensure base records for factories if they are not created by let!
      FactoryBot.create(:sub_district) unless SubDistrict.exists?
      unless PermitType.exists?(code: :low_residential)
        FactoryBot.create(:permit_type, code: :low_residential)
      end
      unless Activity.exists?(code: :new_construction)
        FactoryBot.create(:activity, code: :new_construction)
      end
      FactoryBot.create(:template_version) unless TemplateVersion.exists?
    end

    # Recreate records for each test to ensure isolation
    let!(:pa_with_snake_keys) do
      # Create the record first, which may trigger a callback that initializes/resets submission_data.
      pa =
        FactoryBot.create(
          :permit_application,
          submitter: FactoryBot.create(:user, role: "submitter"),
          jurisdiction: jurisdiction,
          permit_type: permit_type,
          activity: activity,
          template_version: template_version
        )
      # Then, update it with the specific data needed for the test.
      # This bypasses potential `before_create` hooks that overwrite the data.
      pa.update!(submission_data: submission_data_with_snake)
      pa
    end

    let!(:pa_with_mixed_keys) do
      pa =
        FactoryBot.create(
          :permit_application,
          submitter: FactoryBot.create(:user, role: "submitter"),
          jurisdiction: jurisdiction,
          permit_type: permit_type,
          activity: activity,
          template_version: template_version
        )
      pa.update!(submission_data: submission_data_with_mixed)
      pa
    end

    let!(:pa_with_camel_keys) do
      pa =
        FactoryBot.create(
          :permit_application,
          submitter: FactoryBot.create(:user, role: "submitter"),
          jurisdiction: jurisdiction,
          permit_type: permit_type,
          activity: activity,
          template_version: template_version
        )
      pa.update!(submission_data: submission_data_all_camel)
      pa
    end

    let!(:pa_with_no_submission_data) do
      pa =
        FactoryBot.create(
          :permit_application,
          submitter: FactoryBot.create(:user, role: "submitter"),
          jurisdiction: jurisdiction,
          permit_type: permit_type,
          activity: activity,
          template_version: template_version
        )
      pa.update!(submission_data: nil)
      pa
    end

    let!(:pa_with_empty_submission_data) do
      pa =
        FactoryBot.create(
          :permit_application,
          submitter: FactoryBot.create(:user, role: "submitter"),
          jurisdiction: jurisdiction,
          permit_type: permit_type,
          activity: activity,
          template_version: template_version
        )
      pa.update!(submission_data: {})
      pa
    end

    it "correctly converts snake_case keys to camelCase in file objects" do
      SubmissionDataKeyConverterService.call

      pa_with_snake_keys.reload
      updated_file1 =
        pa_with_snake_keys.submission_data["data"]["sectionA"][
          "file_upload_field"
        ][
          0
        ]
      expect(updated_file1).to include(
        "originalName" => "original_file1.pdf",
        "modelId" => "model-uuid-1",
        "groupId" => "group-uuid-1",
        "groupPermissions" => "read_only"
      )
      expect(updated_file1).not_to include(
        "original_name",
        "model_id",
        "group_id",
        "group_permissions"
      )

      updated_nested_file1 =
        pa_with_snake_keys.submission_data["data"]["sectionB"]["nested_array"][
          0
        ][
          "another_file_field"
        ][
          0
        ]
      expect(updated_nested_file1).to include(
        "originalName" => "original_file1.pdf"
      )
      expect(updated_nested_file1).not_to include("original_name")
    end

    it "correctly converts mixed_case keys to camelCase in file objects" do
      SubmissionDataKeyConverterService.call

      pa_with_mixed_keys.reload
      updated_file_mixed =
        pa_with_mixed_keys.submission_data["data"]["sectionMix"][
          "mixed_file_upload"
        ][
          0
        ]
      expect(updated_file_mixed).to include(
        "originalName" => "original_file3.pdf",
        "modelId" => "model-uuid-3",
        "groupId" => "group-uuid-3",
        "groupPermissions" => "execute"
      )
      expect(updated_file_mixed).not_to include("original_name", "group_id")

      # Check that all keys are now the expected camelCase keys and no snake_case keys remain for transformed fields
      expected_keys_after_mixed_transform = file_data_camel_case.keys # Base set of expected camelCase keys
      expect(updated_file_mixed.keys.sort).to eq(
        expected_keys_after_mixed_transform.sort
      )
    end

    it "does not modify already camelCased file objects" do
      original_data_for_camel_pa = pa_with_camel_keys.submission_data.deep_dup
      SubmissionDataKeyConverterService.call

      pa_with_camel_keys.reload
      expect(pa_with_camel_keys.submission_data).to eq(
        original_data_for_camel_pa
      )
    end

    it "does not modify non-file object data" do
      original_non_file_part =
        pa_with_snake_keys.submission_data["data"]["sectionB"]["nested_array"][
          1
        ].deep_dup
      SubmissionDataKeyConverterService.call

      pa_with_snake_keys.reload
      non_file_part_after_call =
        pa_with_snake_keys.submission_data["data"]["sectionB"]["nested_array"][
          1
        ]
      expect(non_file_part_after_call).to eq(original_non_file_part)
    end

    it "handles permit applications with no submission_data or empty submission_data" do
      # Ensure no errors are raised during processing these PAs
      expect { SubmissionDataKeyConverterService.call }.not_to raise_error

      pa_with_no_submission_data.reload
      expect(pa_with_no_submission_data.submission_data).to be_nil

      pa_with_empty_submission_data.reload
      expect(pa_with_empty_submission_data.submission_data).to eq({})
    end

    it "is idempotent" do
      SubmissionDataKeyConverterService.call # First call
      data_after_first_call = pa_with_snake_keys.reload.submission_data.deep_dup

      SubmissionDataKeyConverterService.call # Second call
      expect(pa_with_snake_keys.reload.submission_data).to eq(
        data_after_first_call
      )
    end

    context "with SubmissionVersion records" do
      let!(:submission_version_with_snake_keys) do
        sv =
          FactoryBot.create(
            :submission_version,
            permit_application: pa_with_snake_keys
          )
        sv.update!(submission_data: submission_data_with_snake)
        sv
      end

      let!(:submission_version_with_camel_keys) do
        sv =
          FactoryBot.create(
            :submission_version,
            permit_application: pa_with_camel_keys
          )
        sv.update!(submission_data: submission_data_all_camel)
        sv
      end

      it "correctly converts snake_case keys for SubmissionVersion" do
        SubmissionDataKeyConverterService.call

        submission_version_with_snake_keys.reload
        updated_file =
          submission_version_with_snake_keys.submission_data["data"][
            "sectionA"
          ][
            "file_upload_field"
          ][
            0
          ]
        expect(updated_file).to include("originalName" => "original_file1.pdf")
        expect(updated_file).not_to include("original_name")
      end

      it "does not modify already camelCased data for SubmissionVersion" do
        original_data =
          submission_version_with_camel_keys.submission_data.deep_dup
        SubmissionDataKeyConverterService.call

        submission_version_with_camel_keys.reload
        expect(submission_version_with_camel_keys.submission_data).to eq(
          original_data
        )
      end
    end

    context "summary reporting" do
      before do
        # Clear and set up specific PAs for summary count verification
        PermitApplication.destroy_all
        @pa_to_update =
          FactoryBot.create(
            :permit_application,
            submitter: FactoryBot.create(:user, role: "submitter"),
            jurisdiction: jurisdiction,
            permit_type: permit_type,
            activity: activity,
            template_version: template_version
          )
        @pa_to_update.update!(submission_data: submission_data_with_snake)

        @pa_no_update_needed =
          FactoryBot.create(
            :permit_application,
            submitter: FactoryBot.create(:user, role: "submitter"),
            jurisdiction: jurisdiction,
            permit_type: permit_type,
            activity: activity,
            template_version: template_version
          )
        @pa_no_update_needed.update!(submission_data: submission_data_all_camel)

        @pa_nil_data =
          FactoryBot.create(
            :permit_application,
            submitter: FactoryBot.create(:user, role: "submitter"),
            jurisdiction: jurisdiction,
            permit_type: permit_type,
            activity: activity,
            template_version: template_version
          )
        @pa_nil_data.update!(submission_data: nil)
      end

      it "returns a correct summary" do
        result = SubmissionDataKeyConverterService.call
        # Total PAs in the DB for this context
        expect(result[:processed_count]).to eq(3)
        expect(result[:updated_count]).to eq(1) # Only @pa_to_update should be updated
        expect(result[:failed_records]).to be_empty
      end
    end

    context "when saving a record fails" do
      let!(:pa_that_will_fail_save) do
        pa =
          FactoryBot.create(
            :permit_application,
            submitter: FactoryBot.create(:user, role: "submitter"),
            jurisdiction: jurisdiction,
            permit_type: permit_type,
            activity: activity,
            template_version: template_version
          )
        pa.update!(submission_data: submission_data_with_snake)
        pa
      end

      before do
        # Stub save! on the specific instance that should fail
        allow(pa_that_will_fail_save).to receive(:save!).and_raise(
          ActiveRecord::RecordInvalid.new(pa_that_will_fail_save)
        )
        # Ensure other PAs (if any) can save normally, by only stubbing the one instance
        # This requires careful management of which PAs are present during this test context.
        # For true isolation, this context might run with only pa_that_will_fail_save existing.
      end

      it "logs an error and includes the ID in failed_records" do
        # To ensure only pa_that_will_fail_save is processed for this test's specific check on failure handling:
        allow(PermitApplication).to receive(:find_each).and_yield(
          pa_that_will_fail_save
        )

        expect(Rails.logger).to receive(:error).with(
          /Failed to update PermitApplication ID: #{pa_that_will_fail_save.id}/
        ).at_least(:once)
        result = SubmissionDataKeyConverterService.call

        expect(result[:updated_count]).to eq(0)
        expect(result[:failed_records].size).to eq(1)
        expect(result[:failed_records][0][:id]).to eq(pa_that_will_fail_save.id)
        expect(result[:failed_records][0][:error]).to be_a(String)
      end

      it "logs an error for a failed SubmissionVersion save" do
        sv_that_will_fail =
          FactoryBot.create(
            :submission_version,
            permit_application: pa_with_snake_keys
          )
        sv_that_will_fail.update!(submission_data: submission_data_with_snake)

        allow(sv_that_will_fail).to receive(:save!).and_raise(
          ActiveRecord::RecordInvalid.new(sv_that_will_fail)
        )
        allow(SubmissionVersion).to receive(:find_each).and_yield(
          sv_that_will_fail
        )
        # Prevent PermitApplication from being processed in this specific test
        allow(PermitApplication).to receive(:find_each)

        expect(Rails.logger).to receive(:error).with(
          /Failed to update SubmissionVersion ID: #{sv_that_will_fail.id}/
        ).at_least(:once)

        result = SubmissionDataKeyConverterService.call

        failed_record =
          result[:failed_records].find { |r| r[:model] == "SubmissionVersion" }
        expect(failed_record).not_to be_nil
        expect(failed_record[:id]).to eq(sv_that_will_fail.id)
      end
    end
  end
end
