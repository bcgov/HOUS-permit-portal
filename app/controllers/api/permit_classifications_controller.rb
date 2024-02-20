class Api::PermitClassificationsController < Api::ApplicationController
  def index
    @permit_classifications = policy_scope(PermitClassification)
    render_success @permit_classifications, nil, { blueprint: PermitClassificationBlueprint }
  end

  def permit_classification_options
    authorize :permit_classification, :permit_classification_options?
    begin
      permit_classifications =
        if activity_option_params[:published].present?
          query =
            if activity_option_params[:pid].present?
              attributes =
                Integrations::LtsaParcelMapBc.new.get_feature_attributes_by_pid(pid: permit_application_params[:pid])

              jurisdiction = Jurisdiction.fuzzy_find_by_ltsa_feature_attributes(attributes)

              jurisdiction.permit_templates
            else
              RequirementTemplate
            end.includes(:permit_type).includes(:activity)

          query = query.where(permit_type_id: activity_option_params[:permit_type_id]) if activity_option_params[
            :permit_type_id
          ].present?

          query = query.where(activity_id: activity_option_params[:activity_id]) if activity_option_params[
            :activity_id
          ].present?

          # &:activities or &:permit_types
          query.map(&activity_option_params[:type].underscore.to_sym).uniq
        else
          PermitClassification.where(type: activity_option_params[:type])
        end

      options = permit_classifications.map { |pc| { label: pc.name, value: pc } }

      render_success options, nil, { blueprint: PermitClassificationOptionBlueprint }
    rescue StandardError => e
      render_error "permit_classification.options_error" and return
    end
  end

  private

  def activity_option_params
    params.permit(%i[type pid published permit_type_id activity_id])
  end
end
