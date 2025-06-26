class AddDesignatedReviewerToJurisdictions < ActiveRecord::Migration[7.1]
  def up
    unless column_exists?(:jurisdictions, :allow_designated_reviewer)
      add_column :jurisdictions,
                 :allow_designated_reviewer,
                 :boolean,
                 default: false,
                 null: false
    end
  end

  def down
    if column_exists?(:jurisdictions, :allow_designated_reviewer)
      remove_column :jurisdictions, :allow_designated_reviewer
    end
  end
end
