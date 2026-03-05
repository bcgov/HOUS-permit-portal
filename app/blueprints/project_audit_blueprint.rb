class ProjectAuditBlueprint < Blueprinter::Base
  identifier :id

  view :base do
    field :description do |audit, options|
      ProjectAuditPresenter.format_description(audit, options[:viewer])
    end
    field :timestamp do |audit, _options|
      audit.created_at
    end
    field :permit_application_id do |audit, _options|
      ProjectAuditPresenter.resolve_permit_application_id(audit)
    end
    field :permit_name do |audit, _options|
      ProjectAuditPresenter.resolve_permit_name(audit)
    end
  end
end
