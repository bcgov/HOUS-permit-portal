class UpdateSandboxDescriptions < ActiveRecord::Migration[7.1]
  def up
    Sandbox.where(name: "Published Sandbox").update_all(
      description:
        "Work with application forms that have already been published"
    )
    Sandbox.where(name: "Scheduled Sandbox").update_all(
      description: "Work with application forms scheduled to be published"
    )
  end

  def down
    Sandbox.where(name: "Published Sandbox").update_all(description: nil)
    Sandbox.where(name: "Scheduled Sandbox").update_all(description: nil)
  end
end
