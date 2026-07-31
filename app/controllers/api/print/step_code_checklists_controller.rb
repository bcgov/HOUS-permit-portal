# frozen_string_literal: true

module Api
  module Print
    class StepCodeChecklistsController < Api::ApplicationController
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
        step_code = StepCode.find(@print_claims[:step_code_id])
        permit_application =
          if @print_claims[:permit_application_id].present?
            PermitApplication.find_by(id: @print_claims[:permit_application_id])
          end
        submission_version =
          if @print_claims[:submission_version_id].present?
            SubmissionVersion.find_by(id: @print_claims[:submission_version_id])
          end

        checklist_json =
          if submission_version&.step_code_checklist_json.present?
            submission_version.step_code_checklist_json
          else
            checklist = resolve_checklist(step_code)
            if checklist.blank?
              raise ActiveRecord::RecordNotFound, "checklist missing"
            end

            step_code.checklist_blueprint.render_as_hash(
              checklist,
              view: :extended
            )
          end

        step_code_blueprint =
          (
            if step_code.is_a?(Part3StepCode)
              Part3StepCodeBlueprint
            else
              Part9StepCodeBlueprint
            end
          )

        {
          stepCode: step_code_blueprint.render_as_hash(step_code),
          checklist: checklist_json,
          permitApplication:
            (
              if permit_application
                PermitApplicationBlueprint.render_as_hash(
                  permit_application,
                  view: :extended
                )
              end
            ),
          submissionVersionId: submission_version&.id
        }
      end

      def resolve_checklist(step_code)
        if @print_claims[:checklist_id].present?
          step_code.checklist_for(id: @print_claims[:checklist_id])
        else
          step_code.current_checklist
        end
      end
    end
  end
end
