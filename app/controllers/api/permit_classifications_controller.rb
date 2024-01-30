class Api::PermitClassificationsController < Api::ApplicationController
  def index
    @permit_classifications = policy_scope(PermitClassification)
    render_success @permit_classifications, nil, { blueprint: PermitClassificationBlueprint }
  end

  def permit_type_options
    authorize :permit_classification, :permit_type_options?
    options = PermitType.all.map { |pt| { label: pt.name, value: pt.id } }
    render_success options, nil, { blueprint: OptionBlueprint }
  end

  def activity_options
    authorize :permit_classification, :activity_options?
    options = Activity.all.map { |a| { label: a.name, value: a.id } }
    render_success options, nil, { blueprint: OptionBlueprint }
  end
end
