class Api::PermitClassificationsController < Api::ApplicationController
  before_action :set_permit_classification, only: %i[update destroy]
  def index
    # By default, only return enabled classifications unless explicitly requested otherwise
    only_enabled =
      ActiveModel::Type::Boolean.new.cast(index_params[:only_enabled])
    scope = policy_scope(PermitClassification)
    scope = scope.where(enabled: true) if only_enabled != false
    @permit_classifications = scope
    render_success @permit_classifications,
                   nil,
                   { blueprint: PermitClassificationBlueprint }
  end

  def permit_classification_options
    authorize :permit_classification, :permit_classification_options?
    begin
      permit_classifications =
        if classification_option_params[:published].present?
          query =
            LiveRequirementTemplate
              .for_sandbox(current_sandbox)
              .joins(:permit_type)
              .joins(:activity)
              .where(permit_classifications: { enabled: true })

          if classification_option_params[:jurisdiction_id].present? &&
               current_sandbox.blank?
            jurisdiction =
              Jurisdiction.find(classification_option_params[:jurisdiction_id])
            permit_type_ids =
              jurisdiction.permit_type_submission_contacts.pluck(
                :permit_type_id
              )
            query = query.where(permit_type_id: permit_type_ids)

            # Filter by jurisdiction availability (globally available or explicitly enabled)

            query =
              query.left_joins(:jurisdiction_requirement_templates).where(
                "requirement_templates.available_globally = ? OR jurisdiction_requirement_templates.jurisdiction_id = ?",
                true,
                jurisdiction.id
              )
          end

          query =
            query.where(
              permit_type_id: classification_option_params[:permit_type_id]
            ) if classification_option_params[:permit_type_id].present?

          query =
            query.where(
              activity_id: classification_option_params[:activity_id]
            ) if classification_option_params[:activity_id].present?
          query =
            query.where(
              first_nations: classification_option_params[:first_nations]
            ) if !classification_option_params[:first_nations].nil?

          # &:activities or &:permit_types
          query.map(&classification_option_params[:type].underscore.to_sym).uniq
        else
          PermitClassification.where(
            type: classification_option_params[:type],
            enabled: true
          )
        end

      options =
        permit_classifications.map { |pc| { label: pc.name, value: pc } }

      render_success options,
                     nil,
                     { blueprint: PermitClassificationOptionBlueprint }
    rescue StandardError => e
      render_error "permit_classification.options_error", {}, e and return
    end
  end

  def create
    authorize :permit_classification, :create?
    begin
      permit_classification =
        PermitClassification.new(permit_classification_params)
      if permit_classification.save
        render_success permit_classification,
                       nil,
                       { blueprint: PermitClassificationBlueprint }
      else
        render_error "permit_classification.create_error",
                     {
                       message_opts: {
                         error_message:
                           permit_classification.errors.full_messages.join(", ")
                       }
                     }
      end
    rescue StandardError => e
      render_error "permit_classification.create_error", {}, e
    end
  end

  def update
    authorize :permit_classification, :update?

    begin
      if @permit_classification.update(permit_classification_params)
        render_success @permit_classification,
                       nil,
                       { blueprint: PermitClassificationBlueprint }
      else
        render_error "permit_classification.update_error",
                     { errors: @permit_classification.errors.full_messages }
      end
    rescue StandardError => e
      render_error "permit_classification.update_error", {}, e
    end
  end

  def destroy
    authorize :permit_classification, :destroy?
    begin
      @permit_classification.destroy!
      render_success @permit_classification,
                     nil,
                     { blueprint: PermitClassificationBlueprint }
    rescue ActiveRecord::InvalidForeignKey => e
      render_error("permit_classification.in_use_error", { status: 400 }, e)
    rescue StandardError => e
      render_error(
        "permit_classification.destroy_error",
        { message_opts: { error_message: e.message } },
        e
      )
    end
  end

  private

  def index_params
    params.permit(:only_enabled)
  end

  def classification_option_params
    params.permit(
      %i[
        type
        pid
        published
        permit_type_id
        activity_id
        jurisdiction_id
        first_nations
      ]
    )
  end

  def permit_classification_params
    params.require(:permit_classification).permit(
      :name,
      :code,
      :description_html,
      :enabled,
      :type,
      :category
    )
  end

  def set_permit_classification
    @permit_classification = PermitClassification.find(params[:id])
  rescue ActiveRecord::RecordNotFound => e
    render_error "misc.not_found_error", { status: 404 }, e
  end
end
