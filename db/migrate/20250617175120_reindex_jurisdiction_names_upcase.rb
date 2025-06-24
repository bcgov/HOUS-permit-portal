class ReindexJurisdictionNamesUpcase < ActiveRecord::Migration[7.1]
  def change
    Jurisdiction.reindex
  end
end
