require "rails_helper"

RSpec.describe ArchistarController, type: :controller do
  describe "POST #webhook" do
    let(:pre_check) { create(:pre_check, certificate_no: "TEST123") }
    let(:webhook_payload) do
      {
        "certificate_no" => "TEST123",
        "status" => "completed",
        "submission_id" => "sub_123",
        "results" => {
          "compliance_score" => 85
        }
      }
    end

    before do
      # Mock the pre-check to be in processing state
      allow_any_instance_of(PreCheck).to receive(:processing?).and_return(true)

      # Set up authentication headers for valid requests
      request.headers["X-Archistar-API-Key"] = "test-api-key"
      allow(ENV).to receive(:[]).with("ARCHISTAR_WEBHOOK_API_KEY").and_return(
        "test-api-key"
      )
    end

    context "with valid webhook payload" do
      it "processes the webhook successfully" do
        expect(pre_check).to receive(:mark_complete!).once

        post :webhook, params: webhook_payload, as: :json

        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body)).to eq(
          {
            "status" => "success",
            "message" => "Webhook processed successfully"
          }
        )
      end

      it "logs request metadata" do
        request.headers["X-Request-ID"] = "req-123"
        request.headers["X-Webhook-Version"] = "1.0"
        request.headers["User-Agent"] = "Archistar-Webhook/1.0"

        expect(Rails.logger).to receive(:info).with(/Webhook request metadata/)

        post :webhook, params: webhook_payload, as: :json
      end
    end

    context "with invalid JSON" do
      it "returns bad request" do
        post :webhook, body: "invalid json", as: :json

        expect(response).to have_http_status(:bad_request)
        expect(JSON.parse(response.body)["status"]).to eq("error")
      end
    end

    context "when pre-check is not found" do
      let(:webhook_payload) do
        { "certificate_no" => "NONEXISTENT", "status" => "completed" }
      end

      it "logs warning and returns success" do
        expect(Rails.logger).to receive(:warn).with(
          "No pre-check found for certificate number: NONEXISTENT"
        )

        post :webhook, params: webhook_payload, as: :json

        expect(response).to have_http_status(:ok)
      end
    end

    context "when certificate number is missing" do
      let(:webhook_payload) { { "status" => "completed" } }

      it "logs warning and returns success" do
        expect(Rails.logger).to receive(:warn).with(
          "No certificate number found in webhook payload"
        )

        post :webhook, params: webhook_payload, as: :json

        expect(response).to have_http_status(:ok)
      end
    end

    context "content type validation" do
      context "with invalid content type" do
        before { request.headers["Content-Type"] = "text/plain" }

        it "returns bad request" do
          post :webhook, params: webhook_payload, as: :json

          expect(response).to have_http_status(:bad_request)
          expect(JSON.parse(response.body)["status"]).to eq("error")
        end
      end

      context "with missing content type" do
        before { request.headers.delete("Content-Type") }

        it "returns bad request" do
          post :webhook, params: webhook_payload, as: :json

          expect(response).to have_http_status(:bad_request)
          expect(JSON.parse(response.body)["status"]).to eq("error")
        end
      end
    end

    context "authentication" do
      context "with invalid API key" do
        before { request.headers["X-Archistar-API-Key"] = "wrong-key" }

        it "returns unauthorized" do
          post :webhook, params: webhook_payload, as: :json

          expect(response).to have_http_status(:unauthorized)
          expect(JSON.parse(response.body)["status"]).to eq("error")
        end
      end

      context "with missing API key" do
        before { request.headers.delete("X-Archistar-API-Key") }

        it "returns unauthorized" do
          post :webhook, params: webhook_payload, as: :json

          expect(response).to have_http_status(:unauthorized)
          expect(JSON.parse(response.body)["status"]).to eq("error")
        end
      end

      context "with IP whitelist enabled" do
        before do
          allow(ENV).to receive(:[]).with(
            "ARCHISTAR_WEBHOOK_IP_WHITELIST"
          ).and_return("192.168.1.1,10.0.0.1")
          allow(request).to receive(:remote_ip).and_return("192.168.1.100")
        end

        it "returns forbidden for non-whitelisted IP" do
          post :webhook, params: webhook_payload, as: :json

          expect(response).to have_http_status(:forbidden)
          expect(JSON.parse(response.body)["status"]).to eq("error")
        end
      end

      context "with valid IP whitelist" do
        before do
          allow(ENV).to receive(:[]).with(
            "ARCHISTAR_WEBHOOK_IP_WHITELIST"
          ).and_return("192.168.1.1,10.0.0.1")
          allow(request).to receive(:remote_ip).and_return("192.168.1.1")
        end

        it "processes the webhook successfully" do
          expect(pre_check).to receive(:mark_complete!).once

          post :webhook, params: webhook_payload, as: :json

          expect(response).to have_http_status(:ok)
        end
      end
    end
  end
end
