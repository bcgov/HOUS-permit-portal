class AddAddressedAtToRequestItems < ActiveRecord::Migration[7.2]
  def change
    add_reference :supporting_documents,
                  :revision_request,
                  type: :uuid,
                  foreign_key: true
  end
end
