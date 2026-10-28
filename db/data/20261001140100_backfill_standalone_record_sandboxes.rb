# frozen_string_literal: true

class BackfillStandaloneRecordSandboxes < ActiveRecord::Migration[7.2]
  STAFF_ROLES = %w[
    reviewer
    review_manager
    regional_review_manager
    technical_support
  ].freeze

  def up
    Searchkick.callbacks(false) do
      backfill(StepCode.where(permit_application_id: nil, sandbox_id: nil))
      backfill(PreCheck.where(sandbox_id: nil))
      backfill(OverheatingCode.where(sandbox_id: nil))
    end

    StepCode.reindex
    PreCheck.reindex
    OverheatingCode.reindex
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end

  private

  def backfill(relation)
    relation
      .joins(:creator)
      .merge(User.where(role: STAFF_ROLES))
      .where.not(jurisdiction_id: nil)
      .find_each do |record|
        published_sandbox = record.jurisdiction.sandboxes.published.first
        next if published_sandbox.blank?

        record.update_column(:sandbox_id, published_sandbox.id)
      end
  end
end
