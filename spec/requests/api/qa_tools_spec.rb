require "rails_helper"

RSpec.describe "Api::QaTools", type: :request do
  include Devise::Test::IntegrationHelpers

  let(:headers) { { "ACCEPT" => "application/json" } }
  let(:submitter) { create(:user, :submitter) }
  let(:jurisdiction) { create(:sub_district, inbox_enabled: false) }
  let(:review_manager) do
    create(:user, :review_manager, jurisdiction: jurisdiction)
  end
  let(:requirement_template) do
    create(:live_full_requirement_template, available_globally: true)
  end
  let(:template_version) do
    create(
      :template_version,
      requirement_template: requirement_template,
      form_json: form_json,
      status: "published"
    )
  end
  let(:form_json) do
    {
      "components" => [
        {
          "key" => "section-a",
          "components" => [
            {
              "key" => "section-a.formSubmissionDataRSTsection-a|RBblock-1",
              "type" => "panel",
              "input" => false,
              "components" => [
                {
                  "key" =>
                    "section-a.formSubmissionDataRSTsection-a|RBblock-1|email",
                  "type" => "simpleemail",
                  "input" => true
                },
                {
                  "key" =>
                    "section-a.formSubmissionDataRSTsection-a|RBblock-1|owner_contact_block|multi_contact",
                  "type" => "datagrid",
                  "components" => [
                    {
                      "key" =>
                        "section-a.formSubmissionDataRSTsection-a|RBblock-1|owner_contact_block|multi_contact|general_contact|firstName",
                      "type" => "textfield",
                      "input" => true
                    }
                  ]
                },
                {
                  "key" =>
                    "section-a.formSubmissionDataRSTsection-a|RBblock-1|drawing_file",
                  "type" => "simplefile",
                  "input" => true
                }
              ]
            },
            {
              "components" => [
                {
                  "key" =>
                    "section-a.formSubmissionDataRSTsection-a|RBblock-1|name",
                  "type" => "textfield",
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
    SiteConfiguration.instance.update!(qa_tools_enabled: true)
    allow(TemplateVersion).to receive(:cached_published_ids).and_return(
      [template_version.id]
    )
  end

  describe "POST /api/qa_tools/permit_projects/full" do
    it "returns not found when QA mode is disabled" do
      allow(ENV).to receive(:[]).and_call_original
      allow(ENV).to receive(:[]).with("VITE_QA_MODE").and_return(nil)
      sign_in submitter

      post "/api/qa_tools/permit_projects/full",
           params: {
             qa_full_permit_project: {
               jurisdiction_id: jurisdiction.id
             }
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:not_found)
    end

    it "returns not found when the global QA tools flag is disabled" do
      allow(ENV).to receive(:[]).and_call_original
      allow(ENV).to receive(:[]).with("VITE_QA_MODE").and_return("true")
      SiteConfiguration.instance.update!(qa_tools_enabled: false)
      sign_in submitter

      post "/api/qa_tools/permit_projects/full",
           params: {
             qa_full_permit_project: {
               jurisdiction_id: jurisdiction.id
             }
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:not_found)
    end

    it "requires authentication" do
      allow(ENV).to receive(:[]).and_call_original
      allow(ENV).to receive(:[]).with("VITE_QA_MODE").and_return("true")

      post "/api/qa_tools/permit_projects/full",
           params: {
             qa_full_permit_project: {
               jurisdiction_id: jurisdiction.id
             }
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:unauthorized)
    end

    it "creates a project with every available permit for the submitter" do
      allow(ENV).to receive(:[]).and_call_original
      allow(ENV).to receive(:[]).with("VITE_QA_MODE").and_return("true")
      sign_in submitter

      expect do
        post "/api/qa_tools/permit_projects/full",
             params: {
               qa_full_permit_project: {
                 jurisdiction_id: jurisdiction.id
               }
             },
             headers: headers,
             as: :json
      end.to change(PermitProject, :count).by(1).and change(
              PermitApplication,
              :count
            ).by(1)

      expect(response).to have_http_status(:created)
      expect(json_response.dig("data", "jurisdiction", "id")).to eq(
        jurisdiction.id
      )
    end

    it "creates a project for review staff without requiring a sandbox" do
      allow(ENV).to receive(:[]).and_call_original
      allow(ENV).to receive(:[]).with("VITE_QA_MODE").and_return("true")
      sign_in review_manager

      post "/api/qa_tools/permit_projects/full",
           params: {
             qa_full_permit_project: {
               jurisdiction_id: jurisdiction.id
             }
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:created)
    end
  end

  describe "POST /api/qa_tools/permit_applications/:id/autofill" do
    let(:permit_application) do
      create(
        :permit_application,
        submitter: submitter,
        jurisdiction: jurisdiction,
        template_version: template_version
      )
    end

    it "autofills a draft permit application" do
      allow(ENV).to receive(:[]).and_call_original
      allow(ENV).to receive(:[]).with("VITE_QA_MODE").and_return("true")
      sign_in submitter

      post "/api/qa_tools/permit_applications/#{permit_application.id}/autofill",
           headers: headers,
           as: :json

      expect(response).to have_http_status(:ok)
      expect(
        permit_application.reload.submission_data.dig(
          "data",
          "section-a",
          "section-a.formSubmissionDataRSTsection-a|RBblock-1|name"
        )
      ).to eq("QA test value")
      expect(
        permit_application.submission_data.dig(
          "data",
          "section-a",
          "section-a.formSubmissionDataRSTsection-a|RBblock-1|email"
        )
      ).to eq("qa@example.com")
      expect(
        permit_application.submission_data.dig(
          "data",
          "section-a",
          "section-a.formSubmissionDataRSTsection-a|RBblock-1"
        )
      ).to be_nil
      expect(
        permit_application.submission_data.dig(
          "data",
          "section-a",
          "section-a.formSubmissionDataRSTsection-a|RBblock-1|owner_contact_block|multi_contact",
          0,
          "section-a.formSubmissionDataRSTsection-a|RBblock-1|owner_contact_block|multi_contact|general_contact|firstName"
        )
      ).to eq("QA test value")
      expect(
        permit_application.submission_data.dig(
          "data",
          "section-a",
          "section-a.formSubmissionDataRSTsection-a|RBblock-1|drawing_file",
          0,
          "model"
        )
      ).to eq("SupportingDocument")
    end

    it "requires update permission to autofill a draft permit application" do
      allow(ENV).to receive(:[]).and_call_original
      allow(ENV).to receive(:[]).with("VITE_QA_MODE").and_return("true")
      sign_in create(:user, :super_admin)

      post "/api/qa_tools/permit_applications/#{permit_application.id}/autofill",
           headers: headers,
           as: :json

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "POST /api/qa_tools/part_3_step_codes/:id/autofill" do
    let(:jurisdiction) do
      create(:sub_district, heating_degree_days: 4180, inbox_enabled: false)
    end
    let(:permit_application) do
      create(
        :permit_application,
        submitter: submitter,
        jurisdiction: jurisdiction,
        template_version: template_version
      )
    end
    let(:step_code) do
      create(
        :part_3_step_code,
        permit_application: permit_application,
        creator: submitter
      )
    end

    it "returns not found when QA mode is disabled" do
      allow(ENV).to receive(:[]).and_call_original
      allow(ENV).to receive(:[]).with("VITE_QA_MODE").and_return(nil)
      sign_in submitter

      post "/api/qa_tools/part_3_step_codes/#{step_code.id}/autofill",
           headers: headers,
           as: :json

      expect(response).to have_http_status(:not_found)
    end

    it "autofills a Part 3 Step Code checklist" do
      allow(ENV).to receive(:[]).and_call_original
      allow(ENV).to receive(:[]).with("VITE_QA_MODE").and_return("true")
      sign_in submitter

      post "/api/qa_tools/part_3_step_codes/#{step_code.id}/autofill",
           headers: headers,
           as: :json

      expect(response).to have_http_status(:ok)
      checklist = step_code.reload.pre_construction_checklist
      expect(checklist.step_code_occupancies.pluck(:key)).to eq(["residential"])
      expect(checklist.baseline_occupancies.pluck(:key)).to eq(
        ["low_hazard_industrial"]
      )
      expect(
        checklist.section_completion_status.dig(
          "requirements_summary",
          "complete"
        )
      ).to be(true)
      expect(
        checklist.section_completion_status.dig("report", "complete")
      ).to be(false)
      expect(checklist).not_to be_complete
      expect(checklist.status).to eq("draft")
      expect(json_response.dig("data", "id")).to eq(step_code.id)
    end

    it "requires update permission to autofill a Part 3 Step Code" do
      allow(ENV).to receive(:[]).and_call_original
      allow(ENV).to receive(:[]).with("VITE_QA_MODE").and_return("true")
      sign_in create(:user, :super_admin)

      post "/api/qa_tools/part_3_step_codes/#{step_code.id}/autofill",
           headers: headers,
           as: :json

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "POST /api/qa_tools/part_9_step_codes/:id/autofill" do
    let(:jurisdiction) { create(:sub_district, inbox_enabled: false) }
    let(:permit_application) do
      create(
        :permit_application,
        submitter: submitter,
        jurisdiction: jurisdiction,
        template_version: template_version,
        with_fake_plan_document: true
      )
    end
    let(:step_code) do
      create(
        :part_9_step_code,
        permit_application: permit_application,
        creator: submitter
      )
    end
    let!(:step_requirement) do
      JurisdictionStepRequirement.create!(
        jurisdiction: jurisdiction,
        energy_step_required: 3,
        zero_carbon_step_required: 2
      )
    end

    before do
      StepCode::Part9::MEUIReferencesSeeder.seed!
      StepCode::Part9::TEDIReferencesSeeder.seed!
    end

    it "returns not found when QA mode is disabled" do
      allow(ENV).to receive(:[]).and_call_original
      allow(ENV).to receive(:[]).with("VITE_QA_MODE").and_return(nil)
      sign_in submitter

      post "/api/qa_tools/part_9_step_codes/#{step_code.id}/autofill",
           headers: headers,
           as: :json

      expect(response).to have_http_status(:not_found)
    end

    it "autofills a Part 9 Step Code checklist" do
      allow(ENV).to receive(:[]).and_call_original
      allow(ENV).to receive(:[]).with("VITE_QA_MODE").and_return("true")
      sign_in submitter

      post "/api/qa_tools/part_9_step_codes/#{step_code.id}/autofill",
           headers: headers,
           as: :json

      expect(response).to have_http_status(:ok)
      checklist = step_code.reload.pre_construction_checklist
      expect(checklist.data_entries.count).to eq(1)
      expect(checklist.compliance_path).to eq("step_code_ers")
      expect(checklist.step_requirement_id).to eq(step_requirement.id)
      expect(
        checklist.section_completion_status.dig("review", "complete")
      ).to be(true)
      expect(
        checklist.section_completion_status.dig("report", "complete")
      ).to be(false)
      expect(checklist).not_to be_complete
      expect(checklist.status).to eq("draft")
      expect(json_response.dig("data", "id")).to eq(step_code.id)
    end

    it "requires update permission to autofill a Part 9 Step Code" do
      allow(ENV).to receive(:[]).and_call_original
      allow(ENV).to receive(:[]).with("VITE_QA_MODE").and_return("true")
      sign_in create(:user, :super_admin)

      post "/api/qa_tools/part_9_step_codes/#{step_code.id}/autofill",
           headers: headers,
           as: :json

      expect(response).to have_http_status(:forbidden)
    end
  end
end
