# frozen_string_literal: true

module Api
  module Print
    class PermitApplicationsController < Api::ApplicationController
      skip_before_action :authenticate_user!
      skip_before_action :require_confirmation
      skip_before_action :verify_authenticity_token
      skip_after_action :verify_authorized
      skip_after_action :verify_policy_scoped

      before_action :authenticate_print_token!

      def show
        render json: { data: print_payload, meta: { print: true } }
      end

      private

      def authenticate_print_token!
        token =
          params[:print_token].presence || request.headers["X-Print-Token"]
        @print_claims = PrintTokenService.verify!(token)
      rescue ActiveSupport::MessageVerifier::InvalidSignature,
             ArgumentError => e
        render json: {
                 error: "invalid_print_token",
                 message: e.message
               },
               status: :unauthorized
      end

      def print_payload
        permit_application =
          PermitApplication.find(@print_claims[:permit_application_id])
        submission_version =
          if @print_claims[:submission_version_id].present?
            permit_application.submission_versions.find(
              @print_claims[:submission_version_id]
            )
          else
            permit_application.latest_submission_version
          end

        PermitApplicationBlueprint.render_as_hash(
          permit_application,
          view: :pdf_generation,
          form_json: submission_version&.form_json,
          submission_data: submission_version&.formatted_submission_data,
          submitted_at: submission_version&.created_at
        ).merge(submission_version_id: submission_version&.id)
      end
    end
  end
end
