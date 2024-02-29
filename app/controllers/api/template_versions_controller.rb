class Api::TemplateVersionsController < Api::ApplicationController
  before_action :set_template_version, only: :show

  def index
    @template_versions =
      if params[:activity_id].present?
        policy_scope(TemplateVersion).where(activities: { id: params[:activity_id] })
      else
        policy_scope(TemplateVersion)
      end

    render_success @template_version
  end

  def show
    authorize @template_version

    render_success @template_version, nil, { blueprint: TemplateVersionBlueprint, blueprint_opts: { view: :extended } }
  end

  private

  def set_template_version
    @template_version = TemplateVersion.find(params[:id])
  end
end
