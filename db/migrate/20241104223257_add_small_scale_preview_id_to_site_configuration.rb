class AddSmallScalePreviewIdToSiteConfiguration < ActiveRecord::Migration[7.1]
  def change
    add_reference :site_configurations,
                  :small_scale_requirement_template,
                  foreign_key: {
                    to_table: :requirement_templates
                  },
                  type: :uuid
  end
end
