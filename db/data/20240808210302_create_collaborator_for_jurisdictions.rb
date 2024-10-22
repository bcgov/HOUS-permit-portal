# frozen_string_literal: true

class CreateCollaboratorForJurisdictions < ActiveRecord::Migration[7.1]
  def up
    review_staff_users =
      User.kept.where(role: %w[reviewer review_manager regional_review_manager])

    review_staff_users.each { |u| u.create_jurisdiction_collaborator }
  end

  def down
  end
end
