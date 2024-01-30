class Api::PermitClassificationsController < Api::ApplicationController
  def index
    @permit_classifications = policy_scope(PermitClassification)
    render_success @permit_classifications, nil, { blueprint: PermitClassificationBlueprint }
  end
end
