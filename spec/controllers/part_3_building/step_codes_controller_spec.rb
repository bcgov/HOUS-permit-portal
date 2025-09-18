require "rails_helper"

RSpec.describe Api::Part3Building::StepCodesController, type: :controller do
  render_views

  let(:submitter) { create(:user, :submitter) }
  let(:jurisdiction) { create(:sub_district) }
  let(:permit_application) do
    create(
      :permit_application,
      submitter: submitter,
      jurisdiction: jurisdiction
    )
  end

  before do
    sign_in submitter
    request.headers["ACCEPT"] = "application/json"
  end

  describe "POST #create" do
    context "when permit_application_id is provided (find or create)" do
      it "finds the existing Part3StepCode for the permit application" do
        existing =
          Part3StepCode.create!(
            permit_application: permit_application,
            creator: submitter
          )

        post :create,
             params: {
               step_code: {
                 permit_application_id: permit_application.id,
                 checklist_attributes: {
                   section_completion_status: {
                   }
                 }
               }
             },
             as: :json

        expect(response).to have_http_status(:success)
        expect(JSON.parse(response.body).dig("data", "id")).to eq(existing.id)
      end

      it "creates a new Part3StepCode for the permit application when none exists" do
        expect {
          post :create,
               params: {
                 step_code: {
                   permit_application_id: permit_application.id,
                   checklist_attributes: {
                     section_completion_status: {
                     }
                   }
                 }
               },
               as: :json
        }.to change(Part3StepCode, :count).by(1)

        expect(response).to have_http_status(:success)
      end
    end

    context "when creating standalone (no permit_application_id)" do
      it "creates and returns success" do
        expect {
          post :create,
               params: {
                 step_code: {
                   checklist_attributes: {
                     section_completion_status: {
                     }
                   }
                 }
               },
               as: :json
        }.to change(Part3StepCode, :count).by(1)

        expect(response).to have_http_status(:success)
      end

      it "renders error when model raises validation error" do
        allow(Part3StepCode).to receive(:create!).and_raise(
          ActiveRecord::RecordInvalid.new(
            Part3StepCode.new.tap { |r| r.errors.add(:base, "boom") }
          )
        )

        post :create,
             params: {
               step_code: {
                 checklist_attributes: {
                   section_completion_status: {
                   }
                 }
               }
             },
             as: :json

        expect(response.status).to satisfy { |s| [200, 400].include?(s) }
        body = JSON.parse(response.body)
        expect(body.dig("meta", "message", "message")).to include("boom")
      end
    end
  end
end
