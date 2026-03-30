class AddReviewDelegateeToPermitProjects < ActiveRecord::Migration[7.1]
  def change
    add_reference :permit_projects,
                  :review_delegatee,
                  foreign_key: {
                    to_table: :collaborators
                  },
                  null: true,
                  type: :uuid
  end
end
