class AddAuditsIndexesForActivityFeed < ActiveRecord::Migration[7.2]
  # This migration should be run AFTER `rails generate audited:install` creates
  # the audits table. These composite indexes optimize the project-scoped
  # activity feed queries in ProjectActivityService.
  #
  # [AUDITED VIBES TODO]: Uncomment and run after audited:install migration exists.
  # If audited:install already added some of these indexes, remove the duplicates.
  def change
    # [AUDITED VIBES TODO]: Uncomment these once the audits table exists
    # add_index :audits, %i[auditable_type auditable_id created_at],
    #           name: "index_audits_on_auditable_and_created_at"
    # add_index :audits, %i[associated_type associated_id created_at],
    #           name: "index_audits_on_associated_and_created_at"
  end
end
