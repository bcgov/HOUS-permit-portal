module AuditDoubleHelpers
  def build_audit_double(attrs = {})
    defaults = {
      user: instance_double(User, name: "Test User", blank?: false),
      auditable_type: "PermitProject",
      auditable_id: "audit-123",
      auditable: nil,
      associated_type: nil,
      associated: nil,
      action: "create",
      audited_changes: {
      }
    }

    instance_double(ApplicationAudit, **defaults.merge(attrs))
  end
end

RSpec.configure { |config| config.include AuditDoubleHelpers }
