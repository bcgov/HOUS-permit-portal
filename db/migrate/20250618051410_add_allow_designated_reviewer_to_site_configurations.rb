class AddAllowDesignatedReviewerToSiteConfigurations < ActiveRecord::Migration[
  7.1
]
  def up
    unless column_exists?(:site_configurations, :allow_designated_reviewer)
      add_column :site_configurations,
                 :allow_designated_reviewer,
                 :boolean,
                 default: false,
                 null: false
    end
  end

  def down
    if column_exists?(:site_configurations, :allow_designated_reviewer)
      remove_column :site_configurations, :allow_designated_reviewer
    end
  end
end
