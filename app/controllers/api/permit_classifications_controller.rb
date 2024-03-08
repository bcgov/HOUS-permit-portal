class Api::PermitClassificationsController < Api::ApplicationController
  def index
    @permit_classifications = policy_scope(PermitClassification)
    render_success @permit_classifications, nil, { blueprint: PermitClassificationBlueprint }
  end

  def permit_classification_options
    authorize :permit_classification, :permit_classification_options?
    begin
      permit_classifications =
        if classification_option_params[:published].present?
          query = RequirementTemplate.with_published_version.includes(:permit_type).includes(:activity)

          query =
            query.where(permit_type_id: classification_option_params[:permit_type_id]) if classification_option_params[
            :permit_type_id
          ].present?

          query = query.where(activity_id: classification_option_params[:activity_id]) if classification_option_params[
            :activity_id
          ].present?

          # &:activities or &:permit_types
          query.map(&classification_option_params[:type].underscore.to_sym).uniq
        else
          PermitClassification.where(type: classification_option_params[:type])
        end

      options = permit_classifications.map { |pc| { label: pc.name, value: pc } }

      render_success options, nil, { blueprint: PermitClassificationOptionBlueprint }
    rescue StandardError => e
      render_error "permit_classification.options_error", {}, e and return
    end
  end

  private

  def classification_option_params
    params.permit(%i[type pid published permit_type_id activity_id])
  end
end
