class Api::PermitApplicationsController < Api::ApplicationController
  def index
    @permit_applications = policy_scope(PermitApplication)
    render_success @permit_applications, nil, { blueprint: PermitApplicationBlueprint }
  end

  def show
  end

  def create
    #base this on jurisdiction
  end

  def update
  end
end
