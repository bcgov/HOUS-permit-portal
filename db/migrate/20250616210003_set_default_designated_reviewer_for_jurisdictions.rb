class SetDefaultDesignatedReviewerForJurisdictions < ActiveRecord::Migration[
  7.1
]
  def up
    execute "UPDATE jurisdictions SET allow_designated_reviewer = false;"
  end

  def down
    # This data migration is not easily reversible.
  end
end
