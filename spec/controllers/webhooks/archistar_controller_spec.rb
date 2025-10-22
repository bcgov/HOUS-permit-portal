require "rails_helper"

RSpec.describe Webhooks::ArchistarController, type: :controller do
  describe "POST #receive" do
    let(:creator) { create(:user) }
    let(:jurisdiction) { create(:sub_district) }
    let(:permit_type) { create(:permit_type) }
    let(:pre_check) do
      create(
        :pre_check,
        :processing,
        certificate_no: "BCBC_2024_ESS_uat-TEST123",
        creator: creator,
        jurisdiction: jurisdiction,
        permit_type: permit_type
      )
    end

    let(:webhook_payload) do
      {
        "certificate_no" => "BCBC_2024_ESS_uat-TEST123",
        "created_at" => "2025-10-21T18:16:47.000000Z",
        "metadata" => {
          "certificate" =>
            "British Columbia BC 2024 - Housing and Small Buildings - Essentials",
          "address" => "99999 E Keith Rd, North Vancouver",
          "lot_id" => nil,
          "council" => nil,
          "zone" => [],
          "masterplan_name" => nil,
          "masterplan_version" => nil
        },
        "applicant" => {
          "name" => "Test User",
          "email" => "test@example.com"
        },
        "completed_at" => "2025-10-21T18:18:47.841000Z",
        "status" => "Complete",
        "submission_status" => "Complete",
        "external_status" => "Complete",
        "assessment_result" => "Passed",
        "message" => "All sections have passed.",
        "documents" => [
          {
            "documentName" => "archistar-pre-check-report.pdf",
            "type" => "report",
            "uploadedDateTime" => "2025-10-21T18:17:34.000000Z",
            "documentURL" => "https://example.com/report.pdf"
          }
        ],
        "scope" => "uat"
      }
    end

    before do
      # Set up authentication headers for valid requests
      request.headers["X-Archistar-Webhook-Secret"] = "test-api-key"
      request.headers["Content-Type"] = "application/json"
      allow(ENV).to receive(:[]).and_call_original
      allow(ENV).to receive(:[]).with("ARCHISTAR_WEBHOOK_SECRET").and_return(
        "test-api-key"
      )
    end

    context "with valid webhook payload for passed assessment" do
      before { pre_check } # Force creation

      it "processes the webhook and marks pre-check as complete with passed result" do
        post :receive, body: webhook_payload.to_json

        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body)).to eq(
          {
            "status" => "success",
            "message" => "Webhook processed successfully"
          }
        )

        pre_check.reload
        expect(pre_check.status).to eq("complete")
        expect(pre_check.assessment_result).to eq("passed")
        expect(pre_check.result_message).to eq("All sections have passed.")
        expect(pre_check.completed_at).to be_present
      end

      it "logs the webhook metadata" do
        pre_check # Force creation
        request.headers["X-Request-ID"] = "req-123"
        request.headers["X-Webhook-Version"] = "1.0"
        request.headers["User-Agent"] = "Archistar-Webhook/1.0"

        allow(Rails.logger).to receive(:info).and_call_original
        expect(Rails.logger).to receive(:info).with(
          /Webhook received:/
        ).and_call_original

        post :receive, body: webhook_payload.to_json
      end

      it "sends notification to pre-check creator" do
        expect(NotificationService).to receive(
          :publish_pre_check_completed_event
        ).with(pre_check)

        post :receive, body: webhook_payload.to_json

        expect(response).to have_http_status(:ok)
      end
    end

    context "with failed assessment result" do
      before do
        pre_check # Force creation
        webhook_payload["assessment_result"] = "Failed"
        webhook_payload["message"] = "Assessment failed."
      end

      it "marks pre-check as complete with failed result" do
        post :receive, body: webhook_payload.to_json

        expect(response).to have_http_status(:ok)

        pre_check.reload
        expect(pre_check.status).to eq("complete")
        expect(pre_check.assessment_result).to eq("failed")
        expect(pre_check.result_message).to eq("Assessment failed.")
      end

      it "sends notification to pre-check creator" do
        expect(NotificationService).to receive(
          :publish_pre_check_completed_event
        ).with(pre_check)

        post :receive, body: webhook_payload.to_json

        expect(response).to have_http_status(:ok)
      end
    end

    context "when pre-check is already complete" do
      before do
        pre_check.update_columns(
          status: PreCheck.statuses[:complete],
          assessment_result: PreCheck.assessment_results[:passed]
        )
      end

      it "does not attempt to mark as complete again" do
        expect_any_instance_of(PreCheck).not_to receive(:mark_complete!)

        post :receive, body: webhook_payload.to_json

        expect(response).to have_http_status(:ok)
      end

      it "logs that pre-check is already in complete state" do
        allow(Rails.logger).to receive(:info).and_call_original
        expect(Rails.logger).to receive(:info).with(
          /Pre-check #{pre_check.id} already in complete state/
        ).and_call_original

        post :receive, body: webhook_payload.to_json
      end
    end

    context "with invalid JSON" do
      it "returns bad request" do
        post :receive, body: "invalid json"

        expect(response).to have_http_status(:bad_request)
        expect(JSON.parse(response.body)).to eq(
          { "error" => "Invalid JSON payload" }
        )
      end
    end

    context "when pre-check is not found" do
      before { webhook_payload["certificate_no"] = "NONEXISTENT" }

      it "logs warning and returns success" do
        allow(Rails.logger).to receive(:info).and_call_original
        expect(Rails.logger).to receive(:warn).with(
          "No pre-check found for certificate number: NONEXISTENT"
        ).and_call_original

        post :receive, body: webhook_payload.to_json

        expect(response).to have_http_status(:ok)
      end
    end

    context "when certificate number is missing" do
      before { webhook_payload.delete("certificate_no") }

      it "logs warning and returns success" do
        allow(Rails.logger).to receive(:info).and_call_original
        expect(Rails.logger).to receive(:warn).with(
          /No certificate number found in Archistar webhook payload/
        ).and_call_original

        post :receive, body: webhook_payload.to_json

        expect(response).to have_http_status(:ok)
      end
    end

    context "authentication" do
      context "with invalid API key" do
        before { request.headers["X-Archistar-Webhook-Secret"] = "wrong-key" }

        it "returns unauthorized" do
          post :receive, body: webhook_payload.to_json

          expect(response).to have_http_status(:unauthorized)
          expect(JSON.parse(response.body)).to eq({ "error" => "Unauthorized" })
        end
      end

      context "with missing API key" do
        it "returns unauthorized" do
          # Override the before block and don't set API key
          request.headers["X-Archistar-Webhook-Secret"] = ""

          post :receive, body: webhook_payload.to_json

          expect(response).to have_http_status(:unauthorized)
          expect(JSON.parse(response.body)).to eq({ "error" => "Unauthorized" })
        end
      end

      context "with IP whitelist enabled" do
        before do
          allow(ENV).to receive(:[]).and_call_original
          allow(ENV).to receive(:[]).with(
            "ARCHISTAR_WEBHOOK_SECRET"
          ).and_return("test-api-key")
          allow(ENV).to receive(:[]).with(
            "ARCHISTAR_WEBHOOK_IP_WHITELIST"
          ).and_return("192.168.1.1,10.0.0.1")
          allow_any_instance_of(ActionDispatch::Request).to receive(
            :remote_ip
          ).and_return("192.168.1.100")
        end

        it "returns forbidden for non-whitelisted IP" do
          post :receive, body: webhook_payload.to_json

          expect(response).to have_http_status(:forbidden)
          expect(JSON.parse(response.body)).to eq({ "error" => "Forbidden" })
        end
      end

      context "with valid IP whitelist" do
        before do
          pre_check # Force creation of pre_check
          allow(ENV).to receive(:[]).and_call_original
          allow(ENV).to receive(:[]).with(
            "ARCHISTAR_WEBHOOK_SECRET"
          ).and_return("test-api-key")
          allow(ENV).to receive(:[]).with(
            "ARCHISTAR_WEBHOOK_IP_WHITELIST"
          ).and_return("192.168.1.1,10.0.0.1")
          allow_any_instance_of(ActionDispatch::Request).to receive(
            :remote_ip
          ).and_return("192.168.1.1")
        end

        it "processes the webhook successfully" do
          post :receive, body: webhook_payload.to_json

          expect(response).to have_http_status(:ok)

          pre_check.reload
          expect(pre_check.status).to eq("complete")
        end
      end
    end

    context "with different webhook statuses" do
      context "when status is 'processing'" do
        before do
          pre_check # Force creation
          webhook_payload["status"] = "Processing"
        end

        it "logs processing status and does not mark complete" do
          allow(Rails.logger).to receive(:info).and_call_original
          expect(Rails.logger).to receive(:info).with(
            /Pre-check #{pre_check.id} is still processing/
          ).and_call_original
          expect_any_instance_of(PreCheck).not_to receive(:mark_complete!)

          post :receive, body: webhook_payload.to_json

          expect(response).to have_http_status(:ok)
        end
      end

      context "when status is 'failed'" do
        before do
          pre_check # Force creation
          webhook_payload["status"] = "Failed"
          webhook_payload["message"] = "Submission error"
        end

        it "logs error and does not mark complete" do
          allow(Rails.logger).to receive(:info).and_call_original
          allow(Rails.logger).to receive(:error).and_call_original
          expect(Rails.logger).to receive(:error).with(
            /Archistar submission failed for pre-check #{pre_check.id}/
          ).and_call_original
          expect_any_instance_of(PreCheck).not_to receive(:mark_complete!)

          post :receive, body: webhook_payload.to_json

          expect(response).to have_http_status(:ok)
        end
      end

      context "when status is unknown" do
        before do
          pre_check # Force creation of pre_check
          webhook_payload["status"] = "Unknown"
        end

        it "logs warning" do
          allow(Rails.logger).to receive(:info).and_call_original
          allow(Rails.logger).to receive(:warn).and_call_original
          expect(Rails.logger).to receive(:warn).with(
            /Unknown Archistar webhook status: unknown/
          ).and_call_original

          post :receive, body: webhook_payload.to_json

          expect(response).to have_http_status(:ok)
        end
      end
    end

    context "error handling" do
      context "when database update fails" do
        before do
          pre_check # Force creation
          allow_any_instance_of(PreCheck).to receive(:update!).and_raise(
            ActiveRecord::RecordInvalid.new(pre_check)
          )
        end

        it "returns internal server error" do
          post :receive, body: webhook_payload.to_json

          expect(response).to have_http_status(:internal_server_error)
          expect(JSON.parse(response.body)).to eq(
            { "error" => "Internal server error" }
          )
        end
      end
    end
  end
end
