class RemoveDesignatedReviewerFromJurisdictions < ActiveRecord::Migration[7.1]
  def up
    if column_exists?(:jurisdictions, :designated_reviewer)
      remove_column :jurisdictions, :designated_reviewer
    end
  end

  def down
    unless column_exists?(:jurisdictions, :designated_reviewer)
      add_column :jurisdictions,
                 :designated_reviewer,
                 :boolean,
                 default: false,
                 null: false
    end
  end
end
