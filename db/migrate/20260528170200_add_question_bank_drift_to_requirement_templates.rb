class AddQuestionBankDriftToRequirementTemplates < ActiveRecord::Migration[7.2]
  def change
    # Set when a shared QuestionDefinition used by this template is edited, so
    # stewards know the template's canonical content is ahead of its published
    # version. Cleared when the template is (re)published.
    add_column :requirement_templates,
               :question_bank_drift_pending_at,
               :datetime
  end
end
