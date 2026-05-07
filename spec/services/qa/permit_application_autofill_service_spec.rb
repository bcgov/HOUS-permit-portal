require "rails_helper"

RSpec.describe Qa::PermitApplicationAutofillService do
  let(:user) { instance_double("User", review_staff?: false) }
  let(:permit_application) do
    instance_double(
      "PermitApplication",
      reload: true,
      submitter: user,
      submission_data: nil,
      update: true
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
                  "type" => "textfield",
                  "input" => true
                },
                {
                  "key" =>
                    "section-a.formSubmissionDataRSTsection-a|RBblock-1|count",
                  "type" => "number",
                  "input" => true
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
  end

  it "generates sectioned submission data for fillable form components" do
    described_class.new(
      permit_application: permit_application,
      current_user: user
    ).call

    expect(permit_application).to have_received(:update) do |args|
      expect(
        args.dig(
          :submission_data,
          "data",
          "section-a",
          "section-a.formSubmissionDataRSTsection-a|RBblock-1|text"
        )
      ).to eq("QA test value")
      expect(
        args.dig(
          :submission_data,
          "data",
          "section-a",
          "section-a.formSubmissionDataRSTsection-a|RBblock-1|count"
        )
      ).to eq(1)
    end
  end
end
