class AddDesignatedReviewerToJurisdictions < ActiveRecord::Migration[7.0]
  def up
    unless column_exists?(:jurisdictions, :designated_reviewer)
      add_column :jurisdictions,
                 :designated_reviewer,
                 :boolean,
                 default: false,
                 null: false
    end
  end

  def down
    if column_exists?(:jurisdictions, :designated_reviewer)
      remove_column :jurisdictions, :designated_reviewer
    end
  end
end
