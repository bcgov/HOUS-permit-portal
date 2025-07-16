class ChangeSiteConfigurationRequirementTemplateRelationship < ActiveRecord::Migration[
  7.0
]
  def up
    add_reference :requirement_templates,
                  :site_configuration,
                  type: :uuid,
                  foreign_key: true

    # Data migration
    if defined?(SiteConfiguration) && SiteConfiguration.respond_to?(:instance)
      site_config = SiteConfiguration.instance
      if site_config && site_config.small_scale_requirement_template_id
        if defined?(RequirementTemplate) &&
             RequirementTemplate.exists?(
               site_config.small_scale_requirement_template_id
             )
          template =
            RequirementTemplate.find(
              site_config.small_scale_requirement_template_id
            )
          template.update_column(:site_configuration_id, site_config.id)
        end
      end
    end

    remove_reference :site_configurations,
                     :small_scale_requirement_template,
                     type: :uuid
  end

  def down
    add_reference :site_configurations,
                  :small_scale_requirement_template,
                  type: :uuid,
                  foreign_key: {
                    to_table: :requirement_templates
                  }

    # Data migration
    if defined?(SiteConfiguration) &&
         SiteConfiguration.respond_to?(:instance) &&
         defined?(RequirementTemplate)
      site_config = SiteConfiguration.instance
      if site_config
        template =
          RequirementTemplate.where(site_configuration_id: site_config.id).first
        if template
          site_config.update_column(
            :small_scale_requirement_template_id,
            template.id
          )
        end
      end
    end

    remove_reference :requirement_templates,
                     :site_configuration,
                     type: :uuid,
                     foreign_key: true
  end
end
