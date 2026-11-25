# frozen_string_literal: true

class PopulateTemplateCategories < ActiveRecord::Migration[7.2]
  def up
    TemplateCategorySeeder.seed!
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
