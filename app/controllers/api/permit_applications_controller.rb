class Api::PermitApplicationsController < Api::ApplicationController
  include Api::Concerns::Search::PermitApplications

  before_action :set_permit_application,
                only: %i[
                  show
                  update
                  submit
                  upload_supporting_document
                  finalize_revision_requests
                  mark_as_viewed
                  update_version
                  generate_missing_pdfs
                  update_revision_requests
                  create_permit_collaboration
                  invite_new_collaborator
                  remove_collaborator_collaborations
                  create_or_update_permit_block_status
                ]
  skip_after_action :verify_policy_scoped, only: [:index]

  def index
    perform_permit_application_search
    authorized_results =
      apply_search_authorization(@permit_application_search.results)
    render_success authorized_results,
                   nil,
                   {
                     meta: {
                       total_pages: @permit_application_search.total_pages,
                       total_count: @permit_application_search.total_count,
                       current_page: @permit_application_search.current_page
                     },
                     blueprint: PermitApplicationBlueprint,
                     blueprint_opts: {
                       view: :base
                     }
                   }
  end

  def mark_as_viewed
    authorize @permit_application
    @permit_application.update_viewed_at
    render_success @permit_application,
                   nil,
                   { blueprint_opts: { view: :jurisdiction_review_extended } }
  end

  def show
    authorize @permit_application
    render_success @permit_application,
                   nil,
                   {
                     blueprint: PermitApplicationBlueprint,
                     blueprint_opts: {
                       view: show_blueprint_view_for(current_user),
                       current_user: current_user
                     }
                   }
  end

  def update
    authorize @permit_application

    # always reset the submission section keys until actual submission
    submission_section =
      permit_application_params.dig(
        "submission_data",
        "data",
        "section-completion-key"
      )
    submission_section&.each { |key, value| submission_section[key] = nil }

    is_current_user_submitter =
      current_user.id == @permit_application.submitter_id

    if @permit_application.draft? &&
         @permit_application.update_with_submission_data_merge(
           permit_application_params:
             (
               if is_current_user_submitter
                 permit_application_params
               else
                 submission_collaborator_permit_application_params
               end
             ),
           current_user: current_user
         )
      if !Rails.env.development? || ENV["RUN_COMPLIANCE_ON_SAVE"] == "true"
        AutomatedCompliance::AutopopulateJob.perform_async(
          @permit_application.id
        )
      end
      render_success @permit_application,
                     ("permit_application.save_draft_success"),
                     {
                       blueprint: PermitApplicationBlueprint,
                       blueprint_opts: {
                         view: :extended,
                         current_user: current_user
                       }
                     }
    elsif @permit_application.submitted? &&
          @permit_application.update(submitted_permit_application_params)
      render_success @permit_application,
                     ("permit_application.save_success"),
                     {
                       blueprint: PermitApplicationBlueprint,
                       blueprint_opts: {
                         view: show_blueprint_view_for(current_user),
                         current_user: current_user
                       }
                     }
    else
      render_error "permit_application.update_error",
                   message_opts: {
                     error_message:
                       @permit_application.errors.full_messages.join(", ")
                   }
    end
  end

  def update_revision_requests
    authorize @permit_application
    if @permit_application.submitted? &&
         @permit_application.latest_submission_version&.update(
           revision_request_params
         )
      render_success @permit_application,
                     ("permit_application.save_success"),
                     {
                       blueprint: PermitApplicationBlueprint,
                       blueprint_opts: {
                         view: :jurisdiction_review_extended
                       }
                     }
    else
      render_error "permit_application.update_error",
                   message_opts: {
                     error_message:
                       @permit_application.errors.full_messages.join(", ")
                   }
    end
  end

  def update_version
    authorize @permit_application

    if TemplateVersioningService.update_draft_permit_with_new_template_version(
         @permit_application
       )
      render_success @permit_application,
                     ("permit_application.update_version_succes"),
                     {
                       blueprint: PermitApplicationBlueprint,
                       blueprint_opts: {
                         view: :extended,
                         current_user: current_user
                       }
                     }
    else
      render_error "permit_application.update_error",
                   message_opts: {
                     error_message:
                       @permit_application.errors.full_messages.join(", ")
                   }
    end
  end

  def upload_supporting_document
    authorize @permit_application
    success = @permit_application.update(supporting_document_params)
    if success
      regex_pattern =
        "(#{supporting_document_params["supporting_documents_attributes"].map { |spd| spd.dig("file", "id") }.compact.join("|")})$"
      render_success @permit_application.supporting_documents.file_ids_with_regex(
                       regex_pattern
                     ),
                     nil,
                     {
                       blueprint: SupportingDocumentBlueprint,
                       blueprint_opts: {
                         view: :form_io_details
                       }
                     }
    else
      render_error "permit_application.update_error",
                   message_opts: {
                     error_message:
                       @permit_application.errors.full_messages.join(", ")
                   }
    end
  end

  def submit
    authorize @permit_application
    # for submissions, we do not run the automated compliance as that should have already been complete
    #
    if !@permit_application.using_current_template_version
      render_error "permit_application.outdated_error", message_opts: {} and
        return
    end

    is_current_user_submitter =
      current_user.id == @permit_application.submitter_id

    if @permit_application.update(
         (
           if is_current_user_submitter
             permit_application_params
           else
             submission_collaborator_permit_application_params
           end
         )
       ) && @permit_application.submit!
      render_success @permit_application,
                     nil,
                     {
                       blueprint: PermitApplicationBlueprint,
                       blueprint_opts: {
                         view: :extended,
                         current_user: current_user
                       }
                     }
    else
      render_error "permit_application.submit_error",
                   message_opts: {
                     error_message:
                       @permit_application.errors.full_messages.join(", ")
                   }
    end
  rescue AASM::InvalidTransition
    render_error "permit_application.submit_state_error", message_opts: {}
  end

  def create
    @permit_application =
      PermitApplication.build(
        permit_application_params.to_h.merge(
          submitter: current_user,
          sandbox: current_sandbox
        )
      )
    authorize @permit_application
    if @permit_application.save
      if !Rails.env.development? || ENV["RUN_COMPLIANCE_ON_SAVE"] == "true"
        AutomatedCompliance::AutopopulateJob.perform_async(
          @permit_application.id
        )
      end
      render_success @permit_application,
                     "permit_application.create_success",
                     {
                       blueprint: PermitApplicationBlueprint,
                       blueprint_opts: {
                         view: :extended,
                         current_user: current_user
                       }
                     }
    else
      render_error "permit_application.create_error",
                   message_opts: {
                     error_message:
                       @permit_application.errors.full_messages.join(", ")
                   }
    end
  end

  def create_permit_collaboration
    begin
      @permit_collaboration =
        PermitCollaboration::CollaborationManagementService.new(
          @permit_application
        ).assign_collaborator!(
          authorize_collaboration: ->(permit_collaboration) do
            authorize permit_collaboration,
                      policy_class: PermitApplicationPolicy
          end,
          collaborator_id: permit_collaboration_params[:collaborator_id],
          collaborator_type: permit_collaboration_params[:collaborator_type],
          assigned_requirement_block_id:
            permit_collaboration_params[:assigned_requirement_block_id]
        )

      render_success @permit_collaboration,
                     "permit_application.assign_collaborator_success",
                     {
                       blueprint: PermitCollaborationBlueprint,
                       blueprint_opts: {
                         view: :base
                       }
                     }
    rescue PermitCollaborationError => e
      render_error "permit_application.assign_collaborator_error",
                   message_opts: {
                     error_message: e.message
                   }
    end
  end

  def invite_new_collaborator
    begin
      @permit_collaboration =
        PermitCollaboration::CollaborationManagementService.new(
          @permit_application
        ).invite_new_submission_collaborator!(
          authorize_collaboration: ->(permit_collaboration) do
            authorize permit_collaboration,
                      policy_class: PermitApplicationPolicy
          end,
          user_params: collaborator_invite_params[:user],
          inviter: current_user,
          collaborator_type: collaborator_invite_params[:collaborator_type],
          assigned_requirement_block_id:
            collaborator_invite_params[:assigned_requirement_block_id]
        )

      render_success @permit_collaboration,
                     "permit_application.assign_collaborator_success",
                     {
                       blueprint: PermitCollaborationBlueprint,
                       blueprint_opts: {
                         view: :base
                       }
                     }
    rescue PermitCollaborationError => e
      # The skip_authorization is necessary here as if there are any errors
      # in the invite_new_submission_collaborator! method, before the permit_collaboration
      # is created, the policy will not be able to authorize the permit_collaboration
      skip_authorization
      render_error "permit_application.assign_collaborator_error",
                   message_opts: {
                     error_message: e.message
                   }
    end
  end

  def generate_missing_pdfs
    authorize @permit_application

    ZipfileJob.perform_async(@permit_application.id)

    head :ok
  end

  def finalize_revision_requests
    authorize @permit_application
    if @permit_application.finalize_revision_requests!
      render_success @permit_application,
                     "permit_application.revision_request_finalize_success",
                     {
                       blueprint: PermitApplicationBlueprint,
                       blueprint_opts: {
                         view: :extended,
                         current_user: current_user
                       }
                     }
    else
      render_error "permit_application.revision_request_finalize_error"
    end
  end

  def remove_collaborator_collaborations
    authorize @permit_application

    collaborations_to_remove =
      @permit_application.permit_collaborations.where(
        collaborator_id: params.require(:collaborator_id),
        collaborator_type: params.require(:collaborator_type),
        collaboration_type: params.require(:collaboration_type)
      )

    if collaborations_to_remove.destroy_all
      render_success nil,
                     "permit_application.remove_collaborator_collaborations_success",
                     {
                       blueprint: PermitApplicationBlueprint,
                       blueprint_opts: {
                         view: :extended
                       }
                     }
    else
      render_error "permit_application.remove_collaborator_collaborations_error"
    end
  end

  def create_or_update_permit_block_status
    @permit_block_status =
      @permit_application.permit_block_statuses.find_or_initialize_by(
        requirement_block_id: params.require(:requirement_block_id),
        collaboration_type: params.require(:collaboration_type)
      )

    authorize @permit_block_status, policy_class: PermitApplicationPolicy

    @permit_block_status.set_by_user = current_user

    @permit_block_status.with_lock do
      if @permit_block_status.update(status: params.require(:status))
        render_success @permit_block_status,
                       "permit_application.create_or_update_permit_block_status_success",
                       { blueprint: PermitBlockStatusBlueprint }
      else
        render_error "permit_application.create_or_update_permit_block_status_error",
                     message_opts: {
                       error_message:
                         @permit_block_status.errors.full_messages.join(", ")
                     }
      end
    end
  end

  def download_application_metrics_csv
    authorize :permit_application, :download_application_metrics_csv?

    csv_data = PermitApplicationExportService.new.application_metrics_csv
    send_data csv_data, type: "text/csv"
  end

  private

  def show_blueprint_view_for(user)
    if params[:review] && user.review_staff?
      :jurisdiction_review_extended
    else
      :extended
    end
  end

  def set_permit_application
    @permit_application = PermitApplication.find(params[:id])
  end

  def permit_application_params # params for submitters
    params.require(:permit_application).permit(
      :activity_id,
      :permit_type_id,
      :jurisdiction_id,
      :full_address,
      :nickname,
      :pin,
      :pid,
      :first_nations,
      submission_data: {
      }
    )
  end

  def submission_collaborator_permit_application_params # permit application params collaborators can update if they are a collaborator during submission
    designated_submitter =
      @permit_application.users_by_collaboration_options(
        collaboration_type: :submission,
        collaborator_type: :delegatee
      ).first
    if designated_submitter&.id == current_user.id
      params.require(:permit_application).permit(:nickname, submission_data: {})
    else
      params.require(:permit_application).permit(submission_data: {})
    end
  end

  def permit_collaboration_params
    params.require(:permit_collaboration).permit(
      :collaborator_id,
      :collaborator_type,
      :assigned_requirement_block_id
    )
  end

  def collaborator_invite_params
    params.require(:collaborator_invite).permit(
      :collaborator_type,
      :assigned_requirement_block_id,
      user: %i[email first_name last_name]
    )
  end

  def supporting_document_params
    params.require(:permit_application).permit(
      supporting_documents_attributes: [
        :data_key,
        file: [:id, :storage, metadata: {}]
      ]
    )
  end

  def submitted_permit_application_params # params for submitters
    params.require(:permit_application).permit(:reference_number)
  end

  def revision_request_params # params for submitters
    params.require(:submission_version).permit(
      revision_requests_attributes: [
        :id,
        :user_id,
        :_destroy,
        :reason_code,
        :comment,
        requirement_json: {
        },
        submission_json: {
        }
      ]
    )
  end
end
