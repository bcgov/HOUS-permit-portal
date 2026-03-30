class ProjectAuditPresenter
  FORMATTERS = {
    "PermitProject" => ProjectAuditFormatters::PermitProjectFormatter,
    "PermitApplication" => ProjectAuditFormatters::PermitApplicationFormatter,
    "PermitCollaboration" =>
      ProjectAuditFormatters::PermitCollaborationFormatter,
    "PermitBlockStatus" => ProjectAuditFormatters::PermitBlockStatusFormatter
  }.freeze

  attr_reader :audit, :viewer

  def initialize(audit, viewer = nil)
    @audit = audit
    @viewer = viewer
  end

  def format_description
    formatter.description
  end

  def resolve_permit_application_id
    formatter.permit_application_id
  end

  def resolve_permit_name
    formatter.permit_application&.nickname
  end

  def resolve_permit_application_number
    formatter.permit_application&.number
  end

  def resolve_jurisdiction_name
    formatter.resolve_jurisdiction&.qualified_name
  end

  def resolve_requirement_block_id
    formatter.requirement_block_id
  end

  private

  def formatter
    @formatter ||= formatter_class.new(audit, viewer)
  end

  def formatter_class
    FORMATTERS.fetch(
      audit.auditable_type,
      ProjectAuditFormatters::BaseFormatter
    )
  end
end
