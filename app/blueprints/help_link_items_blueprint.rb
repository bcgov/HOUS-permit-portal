class HelpLinkItemsBlueprint < Blueprinter::Base
  # List of link keys to be dynamically rendered

  SiteConfiguration::HELP_LINK_KEYS.each do |link_key|
    field link_key.underscore.to_sym do |help_link_items, _options|
      LinkItemBlueprint.render_as_hash(help_link_items[link_key])
    end
  end
end
