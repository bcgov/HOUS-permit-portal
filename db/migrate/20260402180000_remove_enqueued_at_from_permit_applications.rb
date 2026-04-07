# frozen_string_literal: true

class RemoveEnqueuedAtFromPermitApplications < ActiveRecord::Migration[7.2]
  def change
    remove_column :permit_applications, :enqueued_at, :datetime
    PermitApplication.reindex
    PermitProject.reindex
  end
end
