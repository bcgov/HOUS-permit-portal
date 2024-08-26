# frozen_string_literal: true

class ReindexPermitApplicationForResubmittedDate < ActiveRecord::Migration[7.1]
  def up
    PermitApplication.reindex
  end

  def down
  end
end
