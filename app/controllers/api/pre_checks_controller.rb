class Api::PreChecksController < Api::ApplicationController
  include Api::Concerns::Search::PreChecks

  before_action :set_pre_check, only: %i[show update submit mark_viewed]
  skip_after_action :verify_policy_scoped, only: %i[index]

  def index
    perform_pre_check_search
    render_success @pre_check_search.results,
                   nil,
                   {
                     meta:
                       page_meta(@pre_check_search).merge(
                         unviewed_count:
                           PreCheck.unviewed_count_for_user(current_user.id)
                       ),
                     blueprint: PreCheckBlueprint
                   }
  end

  def show
    authorize @pre_check
    render_success @pre_check, nil, { blueprint: PreCheckBlueprint }
  end

  def create
    pre_check = PreCheck.new(pre_check_params.merge(creator: current_user))

    authorize pre_check
    if pre_check.save
      render_success pre_check,
                     "pre_check.create_success",
                     { blueprint: PreCheckBlueprint }
    else
      render_error "pre_check.create_error",
                   message_opts: {
                     error_message: pre_check.errors.full_messages.to_sentence,
                     log_args: {
                       errors: pre_check.errors.full_messages
                     }
                   }
    end
  end

  def update
    authorize @pre_check
    if @pre_check.update(pre_check_params)
      render_success @pre_check,
                     "pre_check.update_success",
                     { blueprint: PreCheckBlueprint }
    else
      render_error "pre_check.update_error",
                   message_opts: {
                     error_message: @pre_check.errors.full_messages.to_sentence
                   }
    end
  end

  def submit
    authorize @pre_check

    if @pre_check.submit
      render_success @pre_check,
                     "pre_check.submit_success",
                     { blueprint: PreCheckBlueprint }
    else
      render_error "pre_check.submit_error",
                   message_opts: {
                     error_message: @pre_check.errors.full_messages.to_sentence
                   }
    end
  end

  def mark_viewed
    authorize @pre_check

    if @pre_check.update(viewed_at: Time.current)
      render_success @pre_check, nil, { blueprint: PreCheckBlueprint }
    else
      render_error "pre_check.update_error",
                   message_opts: {
                     error_message: @pre_check.errors.full_messages.to_sentence
                   }
    end
  end

  private

  def set_pre_check
    @pre_check = PreCheck.find(params[:id])
  end

  def pre_check_params
    params.require(:pre_check).permit(
      :status,
      :full_address,
      :permit_application_id,
      :jurisdiction_id,
      :permit_type_id,
      :service_partner,
      :eula_accepted,
      :consent_to_send_drawings,
      :consent_to_share_with_jurisdiction,
      :consent_to_research_contact,
      design_documents_attributes: [
        :id,
        :_destroy,
        file: [:id, :storage, metadata: %i[size filename mime_type]]
      ]
    )
  end
end
