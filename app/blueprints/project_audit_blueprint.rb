class ProjectAuditBlueprint < Blueprinter::Base
  identifier :id

  view :base do
    field :description do |audit, options|
      ProjectAuditPresenter.new(audit, options[:viewer]).format_description
    end
    field :created_at do |audit, _options|
      audit.created_at
    end
    field :permit_application_id do |audit, _options|
      ProjectAuditPresenter.new(audit).resolve_permit_application_id
    end
    field :permit_name do |audit, _options|
      ProjectAuditPresenter.new(audit).resolve_permit_name
    end
  end
end
