require "rails_helper"

RSpec.describe Qa::PermitApplicationAutofillService do
  let(:user) { instance_double("User", review_staff?: false) }
  let(:permit_application) do
    instance_double("PermitApplication", reload: true, submitter: user)
  end
  let(:submission_data_service) do
    instance_double(
      PermitApplication::SubmissionDataService,
      update_with_submission_data_merge: true
    )
  end

  let(:form_json) do
    {
      "components" => [
        {
          "key" => "section-a",
          "components" => [
            {
              "components" => [
                {
                  "key" =>
                    "section-a.formSubmissionDataRSTsection-a|RBblock-1|text",
                  "type" => "textfield"
                },
                {
                  "key" =>
                    "section-a.formSubmissionDataRSTsection-a|RBblock-1|count",
                  "type" => "number"
                }
              ]
            }
          ]
        }
      ]
    }
  end

  before do
    allow(permit_application).to receive(:form_json).with(
      current_user: user
    ).and_return(form_json)
    allow(PermitApplication::SubmissionDataService).to receive(:new).with(
      permit_application
    ).and_return(submission_data_service)
  end

  it "generates sectioned submission data for fillable form components" do
    described_class.new(
      permit_application: permit_application,
      current_user: user
    ).call

    expect(submission_data_service).to have_received(
      :update_with_submission_data_merge
    ) do |args|
      expect(args[:current_user]).to eq(user)
      expect(
        args.dig(
          :permit_application_params,
          :submission_data,
          "data",
          "section-a",
          "section-a.formSubmissionDataRSTsection-a|RBblock-1|text"
        )
      ).to eq("QA test value")
      expect(
        args.dig(
          :permit_application_params,
          :submission_data,
          "data",
          "section-a",
          "section-a.formSubmissionDataRSTsection-a|RBblock-1|count"
        )
      ).to eq(1)
    end
  end
end
