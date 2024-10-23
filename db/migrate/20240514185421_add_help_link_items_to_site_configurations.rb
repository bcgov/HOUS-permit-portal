class AddHelpLinkItemsToSiteConfigurations < ActiveRecord::Migration[7.1]
  def change
    default_link_items = {
      get_started_link_item: {
        href: "",
        title: "Get started on Building Permit Hub",
        description:
          "How to submit a building permit application through a streamlined and standardized approach across BC",
        show: false
      },
      best_practices_link_item: {
        href: "",
        title: "Best practices",
        description:
          "How to use the Building Permit Hub efficiently for application submission",
        show: false
      },
      dictionary_link_item: {
        href: "",
        title: "Dictionary of terms",
        description:
          "See detailed explanations of terms that appear on building permits",
        show: false
      },
      user_guide_link_item: {
        href: "",
        title: "User and role guides",
        description:
          "Step-by-step instructions on how to make the most out of the platform",
        show: false
      }
    }

    add_column :site_configurations,
               :help_link_items,
               :jsonb,
               default: default_link_items,
               null: false
  end
end
