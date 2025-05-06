Rails.application.config.to_prepare { Audited::Audit.include SearchableAudit }
