# This migration comes from spina (originally 17)
class AddCustomUrlsToSpinaNavigationItems < ActiveRecord::Migration[7.0]
  def change
    add_column :spina_navigation_items, :url, :string
    add_column :spina_navigation_items, :url_title, :string
    add_column :spina_navigation_items, :kind, :string, default: "page", null: false

    reversible do |dir|
      dir.up { change_column_null :spina_navigation_items, :page_id, true }

      dir.down do
        Spina::NavigationItem.where(page_id: nil).delete_all
        change_column_null :spina_navigation_items, :page_id, false
      end
    end
  end
end
