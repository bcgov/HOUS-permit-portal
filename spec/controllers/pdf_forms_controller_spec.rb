require "rails_helper"

RSpec.describe Api::PdfFormsController, type: :controller do
  describe "POST #create" do
    let(:submitter) { create(:user, :submitter) }

    let(:form_data) do
      {
        "name" => "John Doe",
        "email" => "john@example.com",
        "address" => {
          "street" => "123 Main St",
          "city" => "Toronto",
          "province" => "ON"
        }
      }
    end

    context "with valid parameters" do
      before { sign_in submitter }
      it "creates a new PdfForm record with the form data" do
        expect {
          post :create,
               params: {
                 pdf_form: {
                   form_json: form_data,
                   form_type: "single_zone_cooling_heating_tool",
                   status: true
                 }
               },
               as: :json
        }.to change(PdfForm, :count).by(1)

        expect(response).to have_http_status(:created)

        pdf_form = PdfForm.find(JSON.parse(response.body)["data"]["id"])
        expect(pdf_form.user_id).to eq(submitter.id)
        expect(pdf_form.form_json).to eq(form_data)
        expect(pdf_form.form_type).to eq("single_zone_cooling_heating_tool")
        expect(pdf_form.status).to be_truthy
      end
    end

    context "with invalid parameters" do
      before { sign_in submitter }
      it "does not create a PdfForm and returns unprocessable_entity" do
        post :create, params: { pdf_form: { form_json: nil } }, as: :json

        expect(response).to have_http_status(422)
        expect(PdfForm.count).to eq(0)
      end
    end
  end
end
