# frozen_string_literal: true

class PopulateLinkResources < ActiveRecord::Migration[7.2]
  def up
    # Track created resources to avoid duplicates
    created_resources = {}

    # Find all customizations that have help_link set
    JurisdictionTemplateVersionCustomization.find_each do |customization|
      next if customization.customizations.blank?
      next if customization.customizations["requirement_block_changes"].blank?

      jurisdiction_id = customization.jurisdiction_id

      customization.customizations[
        "requirement_block_changes"
      ].each do |block_id, changes|
        help_link = changes["help_link"]
        next if help_link.blank?

        # Create a unique key to avoid creating duplicate resources for the same jurisdiction+URL
        resource_key = "#{jurisdiction_id}:#{help_link}"
        next if created_resources[resource_key]

        # Get requirement block name for better title
        requirement_block = RequirementBlock.find_by(id: block_id)
        block_name =
          requirement_block&.display_name || requirement_block&.name ||
            "Requirement Block"

        # Create the resource
        Resource.create!(
          jurisdiction_id: jurisdiction_id,
          category: "additional_resources",
          title: "Link for #{block_name}",
          description: "",
          resource_type: "link",
          link_url: help_link
        )

        created_resources[resource_key] = true

        puts "Created resource for jurisdiction #{jurisdiction_id}: #{help_link}"
      end
    end

    puts "Migration complete. Created #{created_resources.size} link resources."
  end

  def down
    # Remove only the resources that were created by this migration
    Resource.where(
      resource_type: "link",
      description: "Migrated from requirement block customization"
    ).destroy_all
  end
end
