class ReindexJurisdictions < ActiveRecord::Migration[7.2]
  def change
    Jurisdiction.reindex
  end
end
