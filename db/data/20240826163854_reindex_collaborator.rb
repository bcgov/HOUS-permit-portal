# frozen_string_literal: true

class ReindexCollaborator < ActiveRecord::Migration[7.1]
  def up
    Collaborator.reindex
  end

  def down
  end
end
