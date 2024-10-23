class RemoveJurisdictionReferenceFromUsers < ActiveRecord::Migration[7.1]
  def change
    remove_reference :users,
                     :jurisdiction,
                     null: true,
                     foreign_key: true,
                     type: :uuid
  end
end
