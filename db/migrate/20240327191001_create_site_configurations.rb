class CreateSiteConfigurations < ActiveRecord::Migration[7.1]
  def change
    create_table :site_configurations, id: :uuid do |t|
      t.boolean :display_sitewide_message
      t.text :sitewide_message

      t.timestamps
    end
  end
end
