require "rails_helper"
require "sidekiq/testing"

RSpec.describe "External API v2 permit applications", type: :request do
  let(:external_api_key) { create(:external_api_key, api_version: "v2") }
  let(:permit_application) do
    create(
      :permit_application,
      :newly_submitted,
      jurisdiction: external_api_key.jurisdiction
    )
  end

  def auth_headers(key = external_api_key)
    {
      "Authorization" => "Bearer #{key.token}",
      "Content-Type" => "application/json"
    }
  end

  def stub_permit_application_search(*records)
    allow(PermitApplication).to receive(:search) do |_query, **kwargs|
      @permit_application_search_kwargs = kwargs
      relation = PermitApplication.where(id: records.map(&:id))
      scoped = kwargs.fetch(:scope_results).call(relation)
      results = scoped.to_a

      double(
        "PermitApplicationSearch",
        results: results,
        total_pages: 1,
        total_count: results.size,
        current_page: 1,
        limit_value: 10
      )
    end
  end

  def update_status(
    status,
    application: permit_application,
    headers: auth_headers,
    **extra
  )
    patch "/external_api/v2/permit_applications/#{application.id}/status",
          params: { status: status, **extra }.to_json,
          headers: headers
  end

  describe "POST /external_api/v2/permit_applications/search" do
    it "returns results scoped by policy (jurisdiction + submitted + sandbox)" do
      allowed = permit_application
      disallowed_draft =
        create(:permit_application, jurisdiction: external_api_key.jurisdiction)
      disallowed_other_jurisdiction =
        create(:permit_application, :newly_submitted)

      stub_permit_application_search(
        allowed,
        disallowed_draft,
        disallowed_other_jurisdiction
      )

      post "/external_api/v2/permit_applications/search",
           params: {}.to_json,
           headers: auth_headers

      expect(response).to have_http_status(:ok)
      expect(@permit_application_search_kwargs[:page]).to eq(1)
      expect(@permit_application_search_kwargs[:per_page]).to eq(
        Kaminari.config.default_per_page
      )
      data = JSON.parse(response.body).fetch("data")
      ids = data.map { |row| row["id"] }
      expect(ids).to contain_exactly(allowed.id)
      expect(data.first["available_statuses"]).to eq(
        %w[in_review withdrawn revisions_requested]
      )
    end
  end

  it "returns 401 without an API key" do
    update_status(
      "in_review",
      headers: {
        "Content-Type" => "application/json"
      }
    )

    expect(response).to have_http_status(:unauthorized)
    expect(permit_application.reload).to be_newly_submitted
  end

  it "rejects API keys from another contract version" do
    v1_key =
      create(
        :external_api_key,
        jurisdiction: external_api_key.jurisdiction,
        api_version: "v1"
      )

    get "/external_api/v2/permit_applications/#{permit_application.id}",
        headers: auth_headers(v1_key)
    expect(response).to have_http_status(:forbidden)

    get "/external_api/v1/permit_applications/#{permit_application.id}",
        headers: auth_headers
    expect(response).to have_http_status(:forbidden)
  end

  describe "GET /external_api/v2/permit_applications/:id" do
    it "returns a slim application with version index and no submission_data" do
      get "/external_api/v2/permit_applications/#{permit_application.id}",
          headers: auth_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body).fetch("data")
      expect(json).not_to have_key("submission_data")
      expect(json).not_to have_key("raw_h2k_files")
      expect(json).to include(
        "id" => permit_application.id,
        "permit_project_id" => permit_application.permit_project_id,
        "number" => permit_application.number,
        "available_statuses" => %w[in_review withdrawn revisions_requested]
      )
      expect(json).not_to have_key("zipfile_url")
      expect(json).not_to have_key("latest_zipfile_url")
      versions = json.fetch("submission_versions")
      expect(versions.length).to eq(1)
      expect(versions.first).to include(
        "id" => permit_application.latest_submission_version.id,
        "version_number" => 1
      )
      expect(versions.first).to have_key("package_ready_at")
    end

    it "returns issued and withdrawn from approved, without revisions_requested" do
      permit_application.update_column(
        :status,
        PermitApplication.statuses[:approved]
      )

      get "/external_api/v2/permit_applications/#{permit_application.id}",
          headers: auth_headers

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body).dig("data", "available_statuses")).to eq(
        %w[issued withdrawn]
      )
    end
  end

  describe "GET /external_api/v2/permit_applications/:id/submission_versions/:submission_version_id" do
    it "returns the frozen version snapshot rather than live form data" do
      version = permit_application.latest_submission_version
      version.update!(
        submission_data: {
          "data" => {
            "s1" => {
              "prefix|RBmissing|field1" => "from-version"
            }
          }
        }
      )
      permit_application.update_columns(
        submission_data: {
          "data" => {
            "s1" => {
              "prefix|RBmissing|field1" => "from-live"
            }
          }
        }
      )

      get "/external_api/v2/permit_applications/#{permit_application.id}/submission_versions/#{version.id}",
          headers: auth_headers

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body).fetch("data")
      expect(json["id"]).to eq(version.id)
      expect(json["permit_application_id"]).to eq(permit_application.id)
      expect(json).to have_key("submission_data")
      expect(json).to have_key("generated_documents")
      expect(json["document_requests"]).to eq([])
      expect(json["fulfillment_documents"]).to eq([])
      expect(json).to have_key("zipfile")
      expect(json).not_to have_key("zipfile_url")
      expect(json).to have_key("raw_h2k_files")
      expect(json["submission_data"]).to eq({})
    end

    it "returns 404 when the version does not belong to the application" do
      other =
        create(
          :permit_application,
          :newly_submitted,
          jurisdiction: external_api_key.jurisdiction
        )

      get "/external_api/v2/permit_applications/#{permit_application.id}/submission_versions/#{other.latest_submission_version.id}",
          headers: auth_headers

      expect(response).to have_http_status(:not_found)
    end
  end

  it "updates an allowed status and attributes the audit to the partner" do
    update_status("in_review")

    expect(response).to have_http_status(:ok)
    expect(permit_application.reload).to be_in_review
    expect(JSON.parse(response.body).dig("data", "status")).to eq("in_review")

    audit =
      ApplicationAudit
        .where(
          auditable_type: "PermitApplication",
          auditable_id: permit_application.id,
          action: "update"
        )
        .where("audited_changes ? 'status'")
        .last
    expect(audit.username).to eq(Constants::ExternalApi::PARTNER_SYSTEM_ACTOR)
    expect(
      ProjectAuditPresenter.new(
        audit,
        permit_application.submitter
      ).format_description
    ).to eq("Partner system marked the application as in review")
  end

  it "treats a repeated write of the current status as an idempotent success" do
    permit_application.start_review!
    audit_count =
      ApplicationAudit
        .where(
          auditable_type: "PermitApplication",
          auditable_id: permit_application.id
        )
        .where("audited_changes ? 'status'")
        .count

    update_status("in_review")

    expect(response).to have_http_status(:ok)
    expect(
      ApplicationAudit
        .where(
          auditable_type: "PermitApplication",
          auditable_id: permit_application.id
        )
        .where("audited_changes ? 'status'")
        .count
    ).to eq(audit_count)
  end

  it "emits one generic status webhook after a partner update" do
    permit_application
    external_api_key.update!(webhook_url: "https://partner.example.com/webhook")
    PermitWebhookJob.clear

    update_status("in_review")

    expect(PermitWebhookJob.jobs.length).to eq(1)
    job = PermitWebhookJob.jobs.first
    expect(job["args"][1]).to eq(
      Constants::Webhooks::Events::PermitApplication::STATUS_CHANGED
    )
    expect(job["args"][2]["status"]).to eq("in_review")
  end

  it "rejects codes outside the statuses available from the current status" do
    %w[newly_submitted not_a_status approved].each do |status|
      update_status(status)

      expect(response).to have_http_status(:unprocessable_content)
      expect(JSON.parse(response.body).dig("meta", "message")).to include(
        "Available statuses: in_review, withdrawn, revisions_requested"
      )
    end
    expect(permit_application.reload).to be_newly_submitted
  end

  it "does not allow a key to update another jurisdiction" do
    other_application = create(:permit_application, :newly_submitted)

    update_status("in_review", application: other_application)

    expect(response).to have_http_status(:forbidden)
    expect(other_application.reload).to be_newly_submitted
  end

  it "does not allow a live key to update a sandbox application" do
    sandbox_application =
      create(
        :permit_application,
        :newly_submitted,
        jurisdiction: external_api_key.jurisdiction,
        sandbox: external_api_key.jurisdiction.sandboxes.first
      )

    update_status("in_review", application: sandbox_application)

    expect(response).to have_http_status(:not_found)
    expect(sandbox_application.reload).to be_newly_submitted
  end

  describe "requesting revisions via PATCH /status" do
    let(:block_id) { "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" }
    let(:requirement_id) { "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb" }
    let(:block_code) { "site_information" }
    let(:requirement_code) { "site_address" }
    let(:form_key) do
      "formSubmissionDataRSTsection1|RB#{block_id}|#{requirement_code}"
    end
    let!(:revision_reason) do
      RevisionReason.find_or_create_by!(
        reason_code: "inaccurate_documentation"
      ) do |reason|
        reason.site_configuration = SiteConfiguration.instance
        reason.description = "Inaccurate documentation"
      end
    end
    let(:revision_item) do
      {
        requirement_block_code: block_code,
        requirement_code: requirement_code,
        reason_code: revision_reason.reason_code,
        comment: "Does not match civic record"
      }
    end

    before do
      permit_application.template_version.update!(
        requirement_blocks_json: {
          block_id => {
            "id" => block_id,
            "sku" => block_code,
            "name" => "Site information",
            "requirements" => [
              {
                "id" => requirement_id,
                "requirement_code" => requirement_code,
                "label" => "Site address",
                "form_json" => {
                  "id" => requirement_id,
                  "key" => form_key,
                  "label" => "Site address",
                  "type" => "simpletextfield"
                }
              }
            ]
          }
        }
      )
      permit_application.latest_submission_version.update!(
        submission_data: {
          "data" => {
            "s1" => {
              form_key => "123 Main St"
            }
          }
        }
      )
    end

    it "creates field-level requests, finalizes, and notifies" do
      expect(NotificationService).to receive(
        :publish_application_revisions_request_event
      ).and_call_original

      update_status("revisions_requested", revision_requests: [revision_item])

      expect(response).to have_http_status(:ok)
      permit_application.reload
      expect(permit_application).to be_revisions_requested
      expect(permit_application.revisions_requested_at).to be_present
      expect(JSON.parse(response.body).dig("data", "status")).to eq(
        "revisions_requested"
      )

      requests = permit_application.latest_submission_version.revision_requests
      expect(requests.count).to eq(1)
      request = requests.first
      expect(request.reason_code).to eq(revision_reason.reason_code)
      expect(request.comment).to eq("Does not match civic record")
      expect(request.user_id).to be_nil
      expect(request.requirement_json["key"]).to eq(form_key)
      expect(request.submission_data).to eq(
        { "data" => { form_key => "123 Main St" } }
      )
      expect(
        permit_application.latest_submission_version.notes.applicant_message
      ).to be_empty
    end

    it "stores and publishes an applicant note" do
      update_status(
        "revisions_requested",
        revision_requests: [revision_item],
        applicant_note: "Please update the address."
      )

      expect(response).to have_http_status(:ok)
      note =
        permit_application
          .reload
          .latest_submission_version
          .notes
          .applicant_message
          .first
      expect(note.body).to eq("<p>Please update the address.</p>")
      expect(note.user_id).to be_nil
      expect(note.published_at).to be_present
    end

    it "does not store a blank applicant note" do
      update_status(
        "revisions_requested",
        revision_requests: [revision_item],
        applicant_note: "  "
      )

      expect(response).to have_http_status(:ok)
      expect(
        permit_application
          .reload
          .latest_submission_version
          .notes
          .applicant_message
      ).to be_empty
    end

    it "treats a repeated write of revisions_requested as an idempotent success" do
      update_status("revisions_requested", revision_requests: [revision_item])
      expect(response).to have_http_status(:ok)
      request_id =
        permit_application.latest_submission_version.revision_requests.first.id

      update_status(
        "revisions_requested",
        revision_requests: [revision_item.merge(comment: "Changed")]
      )

      expect(response).to have_http_status(:ok)
      expect(permit_application.reload).to be_revisions_requested
      expect(
        permit_application
          .latest_submission_version
          .revision_requests
          .reload
          .ids
      ).to eq([request_id])
    end

    it "rejects revisions_requested without items" do
      update_status("revisions_requested")

      expect(response).to have_http_status(:unprocessable_content)
      expect(JSON.parse(response.body).dig("meta", "message")).to include(
        "revision_requests must be a non-empty array"
      )
      expect(permit_application.reload).to be_newly_submitted
    end

    it "rejects revision_requests on a non-revision status write" do
      update_status("in_review", revision_requests: [revision_item])

      expect(response).to have_http_status(:unprocessable_content)
      expect(JSON.parse(response.body).dig("meta", "message")).to include(
        "revision_requests is only accepted when status is 'revisions_requested'"
      )
      expect(permit_application.reload).to be_newly_submitted
    end

    it "rejects applicant_note on a non-revision status write" do
      update_status("in_review", applicant_note: "Please update the address.")

      expect(response).to have_http_status(:unprocessable_content)
      expect(JSON.parse(response.body).dig("meta", "message")).to include(
        "applicant_note is only accepted when status is 'revisions_requested'"
      )
      expect(permit_application.reload).to be_newly_submitted
    end

    it "rejects an unknown requirement code" do
      update_status(
        "revisions_requested",
        revision_requests: [
          revision_item.merge(requirement_code: "not_a_field")
        ]
      )

      expect(response).to have_http_status(:unprocessable_content)
      expect(JSON.parse(response.body).dig("meta", "message")).to include(
        "Unknown requirement_code 'not_a_field'"
      )
      expect(permit_application.reload).to be_newly_submitted
    end

    it "rejects revisions from a status that cannot request them" do
      permit_application.start_review!
      permit_application.approve!

      update_status("revisions_requested", revision_requests: [revision_item])

      expect(response).to have_http_status(:unprocessable_content)
      expect(JSON.parse(response.body).dig("meta", "message")).to include(
        "Cannot transition status from 'approved' to 'revisions_requested'"
      )
      expect(permit_application.reload).to be_approved
    end

    describe "document requests" do
      before { allow(PromoteJob).to receive(:perform_async) }

      def upload_reference_file(filename = "site-plan.pdf")
        post "/external_api/v2/files",
             params: {
               file:
                 Rack::Test::UploadedFile.new(
                   Rails.root.join("spec/support/signed_converted.pdf"),
                   "application/pdf",
                   true,
                   original_filename: filename
                 )
             },
             headers: {
               "Authorization" => "Bearer #{external_api_key.token}"
             }
        JSON.parse(response.body).fetch("data").fetch("id")
      end

      def document_item(cache_id)
        {
          name: "Site plan",
          reason_code: revision_reason.reason_code,
          comment: "Please provide a current site plan.",
          reference_document_ids: [cache_id]
        }
      end

      def version_payload(version)
        get "/external_api/v2/permit_applications/#{permit_application.id}/submission_versions/#{version.id}",
            headers: auth_headers
        JSON.parse(response.body).fetch("data")
      end

      it "stores the request and reference file and returns a new download URL on each GET" do
        cache_id = upload_reference_file
        update_status(
          "revisions_requested",
          revision_requests: [document_item(cache_id)]
        )

        expect(response).to have_http_status(:ok)
        version = permit_application.reload.latest_submission_version
        request = version.revision_requests.sole
        expect(request).to be_a(SupportingDocumentRevisionRequest)
        expect(request.title).to eq("Site plan")
        expect(request.revision_reference_documents.count).to eq(1)

        urls = %w[https://files.example/one https://files.example/two]
        allow_any_instance_of(
          FileUploadAttachment::FilenamePreservingFileUrl
        ).to receive(:file_url).and_return(*urls)

        first = version_payload(version)
        document = first.fetch("document_requests").sole
        reference = document.fetch("reference_documents").sole
        expect(document["name"]).to eq("Site plan")
        expect(reference["id"]).to eq(
          request.revision_reference_documents.sole.id
        )
        expect(reference["name"]).to eq("site-plan.pdf")
        expect(reference["url"]).to eq(urls.first)
        expect(first["fulfillment_documents"]).to eq([])

        second = version_payload(version)
        expect(
          second.dig("document_requests", 0, "reference_documents", 0, "url")
        ).to eq(urls.last)
      end

      it "stores a field revision and a document request from one payload" do
        cache_id = upload_reference_file
        update_status(
          "revisions_requested",
          revision_requests: [revision_item, document_item(cache_id)]
        )

        expect(response).to have_http_status(:ok)
        requests =
          permit_application.reload.latest_submission_version.revision_requests
        expect(requests.map(&:class)).to contain_exactly(
          FieldRevisionRequest,
          SupportingDocumentRevisionRequest
        )
      end

      it "rejects a document request with no resolvable reference file and leaves status unchanged" do
        update_status(
          "revisions_requested",
          revision_requests: [
            document_item("00000000-0000-4000-8000-000000000000/missing.pdf")
          ]
        )

        expect(response).to have_http_status(:unprocessable_content)
        expect(JSON.parse(response.body).dig("meta", "message")).to include(
          "revision_requests[0] is missing reference_document_ids"
        )
        expect(permit_application.reload).to be_newly_submitted
        expect(
          permit_application.latest_submission_version.revision_requests
        ).to be_empty
      end

      it "lists a fulfillment file on the resubmission version and includes it in the zip set" do
        cache_id = upload_reference_file
        update_status(
          "revisions_requested",
          revision_requests: [document_item(cache_id)]
        )
        requested_version = permit_application.reload.latest_submission_version
        document_request = requested_version.revision_requests.sole
        generated =
          create(
            :supporting_document,
            permit_application: permit_application,
            submission_version: requested_version,
            data_key: SupportingDocument::APPLICATION_PDF_DATA_KEY
          )
        fulfillment =
          create(
            :supporting_document,
            permit_application: permit_application,
            revision_request: document_request
          )
        allow_any_instance_of(PermitApplication).to receive(
          :can_submit?
        ).and_return(true)
        allow(ZipfileJob).to receive(:perform_async)
        allow(NotificationService).to receive(
          :publish_application_submission_event
        )
        permit_application.template_version.update!(
          form_json: {
            "components" => []
          }
        )

        permit_application.submit!

        response_version = permit_application.reload.latest_submission_version
        expect(response_version.id).not_to eq(requested_version.id)
        payload = version_payload(response_version)
        expect(
          payload["fulfillment_documents"].map { |file| file["id"] }
        ).to eq([fulfillment.id])
        expect(payload["generated_documents"]).to eq([])
        expect(payload["document_requests"]).to eq([])
        expect(
          version_payload(requested_version).dig("generated_documents", 0, "id")
        ).to eq(generated.id)
        expect(
          SupportingDocumentsZipper
            .new(permit_application.id)
            .send(:documents_to_zip)
            .map(&:id)
        ).to include(fulfillment.id)
      end

      it "lists no fulfillment file when the applicant did not upload one" do
        cache_id = upload_reference_file
        update_status(
          "revisions_requested",
          revision_requests: [document_item(cache_id)]
        )
        allow_any_instance_of(PermitApplication).to receive(
          :can_submit?
        ).and_return(true)
        allow(ZipfileJob).to receive(:perform_async)
        allow(NotificationService).to receive(
          :publish_application_submission_event
        )
        permit_application.template_version.update!(
          form_json: {
            "components" => []
          }
        )

        permit_application.reload.submit!

        payload =
          version_payload(permit_application.reload.latest_submission_version)
        expect(payload["fulfillment_documents"]).to eq([])
      end
    end
  end
end
