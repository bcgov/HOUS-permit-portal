class SetDefaultDesignatedReviewerForJurisdictions < ActiveRecord::Migration[
  7.0
]
  def up
    execute "UPDATE jurisdictions SET designated_reviewer = false;"
  end

  def down
    # This data migration is not easily reversible.
  end
end
