# Handles the blast-radius bookkeeping when a shared QuestionDefinition's
# content changes (Phase 5).
#
# Editing a definition updates the canonical Requirement rows immediately
# (authoring layer) but MUST NOT touch live published TemplateVersions. Those
# only change when a new version is published. To make that visible, we mark the
# affected RequirementTemplates as "drift pending"; the change then ships
# per-template through the existing publish flow (produce_diff_hash,
# NotificationService, integration-mapping refresh), and the flag clears on
# (re)publish.
class QuestionBankDriftService
  class << self
    # Re-materialize linked placements and mark every referencing template as
    # drift-pending. Returns the affected RequirementTemplate relation.
    def record_drift!(question_definition)
      question_definition.propagate_to_placements!

      templates = referencing_templates(question_definition)
      now = Time.current
      templates.update_all(question_bank_drift_pending_at: now)

      Rails.logger.info(
        "[QuestionBankDrift] definition=#{question_definition.id} marked #{templates.size} template(s) drift-pending"
      )

      templates
    end

    # Clears the drift flag for a template once its content has shipped via a
    # publish. Safe to call unconditionally.
    def clear_drift!(requirement_template)
      return if requirement_template.blank?
      return if requirement_template.question_bank_drift_pending_at.blank?

      requirement_template.update_columns(question_bank_drift_pending_at: nil)
    end

    def referencing_templates(question_definition)
      RequirementTemplate
        .joins(:requirements)
        .where(requirements: { question_definition_id: question_definition.id })
        .distinct
    end
  end
end
