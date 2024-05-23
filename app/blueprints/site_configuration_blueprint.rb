class SiteConfigurationBlueprint < Blueprinter::Base
  fields :display_sitewide_message, :sitewide_message

  field :help_link_items do |site_configuration, _options|
    HelpLinkItemsBlueprint.render_as_hash(site_configuration.help_link_items)
  end
end
