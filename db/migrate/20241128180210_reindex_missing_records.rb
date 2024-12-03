class ReindexMissingRecords < ActiveRecord::Migration[7.1]
  def change
    User.reindex
    RequirementBlock.reindex
    RequirementTemplate.reindex
  end
end
