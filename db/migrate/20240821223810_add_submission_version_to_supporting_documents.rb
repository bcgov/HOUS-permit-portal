class AddSubmissionVersionToSupportingDocuments < ActiveRecord::Migration[7.1]
  def change
    add_reference :supporting_documents,
                  :submission_version,
                  null: true,
                  foreign_key: true,
                  type: :uuid
  end
end
