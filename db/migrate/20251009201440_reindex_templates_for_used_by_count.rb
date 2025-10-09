class ReindexTemplatesForUsedByCount < ActiveRecord::Migration[7.2]
  def change
    RequirementTemplate.reindex
  end
end
