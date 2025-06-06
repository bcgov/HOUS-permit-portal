class AddCreatedByTestToRequirementTemplates < ActiveRecord::Migration[7.1]
  def change
    add_column :requirement_templates, :created_by_test, :string
  end
end
