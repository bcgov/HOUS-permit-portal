class EnforceSingleKeptProjectReviewCollaborator < ActiveRecord::Migration[7.1]
  disable_ddl_transaction!

  INDEX_NAME = "index_project_collabs_unique_kept_per_project"

  # Lightweight inline model so the migration doesn't depend on the app model,
  # which may change shape over time.
  class Collab < ActiveRecord::Base
    self.table_name = "permit_project_collaborations"
  end

  def up
    # Clean up any pre-existing duplicate kept collaborations before the unique
    # partial index is built, otherwise its creation will fail. The product is
    # early enough in development that hard-deleting extras is acceptable; we
    # keep the oldest kept row per project as the canonical reviewer.
    duplicate_project_ids =
      Collab
        .where(discarded_at: nil)
        .group(:permit_project_id)
        .having("COUNT(*) > 1")
        .pluck(:permit_project_id)

    duplicate_project_ids.each do |project_id|
      Collab
        .where(discarded_at: nil, permit_project_id: project_id)
        .order(:created_at, :id)
        .offset(1)
        .each(&:delete)
    end

    add_index :permit_project_collaborations,
              :permit_project_id,
              unique: true,
              where: "discarded_at IS NULL",
              name: INDEX_NAME,
              algorithm: :concurrently
  end

  def down
    remove_index :permit_project_collaborations,
                 name: INDEX_NAME,
                 algorithm: :concurrently
  end
end
