# frozen_string_literal: true

# Drops the STI discriminator from requirement_templates now that
# LiveRequirementTemplate has been collapsed into the base RequirementTemplate
# class. Uses if_exists guards so it is a no-op on environments where the
# CleanupEarlyAccessLegacyColumns data migration already removed the column.
class DropTypeFromRequirementTemplates < ActiveRecord::Migration[7.2]
  def up
    if index_exists?(
         :requirement_templates,
         :type,
         name: "index_requirement_templates_on_type"
       )
      remove_index :requirement_templates,
                   name: "index_requirement_templates_on_type"
    end

    if column_exists?(:requirement_templates, :type)
      remove_column :requirement_templates, :type
    end
  end

  def down
    add_column :requirement_templates, :type, :string
    add_index :requirement_templates,
              :type,
              name: "index_requirement_templates_on_type"
  end
end
