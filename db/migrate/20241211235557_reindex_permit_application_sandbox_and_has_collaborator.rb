class ReindexPermitApplicationSandboxAndHasCollaborator < ActiveRecord::Migration[
  7.1
]
  def change
    PermitApplication.reindex
  end
end
