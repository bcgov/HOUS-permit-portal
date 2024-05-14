class ReindexContacts < ActiveRecord::Migration[7.1]
  def change
    Contact.reindex
  end
end
