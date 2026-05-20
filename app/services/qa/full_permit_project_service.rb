class Qa::FullPermitProjectService
  def initialize(current_user:, current_sandbox:, jurisdiction_id:, title: nil)
    @current_user = current_user
    @current_sandbox = current_sandbox
    @jurisdiction = Jurisdiction.find(jurisdiction_id)
    @title =
      title.presence || "QA Project #{Time.current.strftime("%Y-%m-%d %H:%M")}"
  end

  def call
    PermitProject.transaction do
      project =
        PermitProject.create!(
          title: @title,
          jurisdiction: @jurisdiction,
          owner: @current_user,
          sandbox: @current_sandbox
        )

      template_versions = available_template_versions
      permit_applications =
        template_versions.map do |template_version|
          PermitApplication.create!(
            submitter: @current_user,
            permit_project: project,
            template_version_id: template_version.id,
            jurisdiction: @jurisdiction
          )
        end

      { project: project, permit_applications: permit_applications }
    end
  end

  private

  def available_template_versions
    status = @current_sandbox&.template_version_status_scope || :published

    query =
      TemplateVersion
        .where(status: status)
        .joins(:requirement_template)
        .left_joins(requirement_template: :jurisdiction_requirement_templates)
        .where(requirement_templates: { discarded_at: nil })
        .where(
          "requirement_templates.available_globally = ? OR jurisdiction_requirement_templates.jurisdiction_id = ?",
          true,
          @jurisdiction.id
        )

    disabled_template_version_ids =
      JurisdictionTemplateVersionCustomization.where(
        jurisdiction_id: @jurisdiction.id,
        sandbox_id: @current_sandbox&.id,
        disabled: true
      ).pluck(:template_version_id)

    if disabled_template_version_ids.any?
      query = query.where.not(id: disabled_template_version_ids)
    end

    query.includes(:requirement_template).to_a.uniq(&:id)
  end
end
