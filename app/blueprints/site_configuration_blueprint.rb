class SiteConfigurationBlueprint < Blueprinter::Base
  fields :display_sitewide_message,
         :sitewide_message,
         :inbox_enabled,
         :allow_designated_reviewer

  field :help_link_items do |site_configuration, _options|
    HelpLinkItemsBlueprint.render_as_hash(site_configuration.help_link_items)
  end

  association :revision_reasons, blueprint: RevisionReasonBlueprint
  association :landing_page_early_access_requirement_templates,
              blueprint: LandingPageEarlyAccessRequirementTemplateBlueprint
end
