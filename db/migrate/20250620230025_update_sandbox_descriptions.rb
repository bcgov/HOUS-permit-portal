class UpdateSandboxDescriptions < ActiveRecord::Migration[7.1]
  def up
    Sandbox.where(name: "Published Sandbox").update_all(name: "Published")
    Sandbox.where(name: "Scheduled Sandbox").update_all(name: "Scheduled")

    Sandbox.where(name: "Published").update_all(
      description:
        "Work with application forms that have already been published"
    )
    Sandbox.where(name: "Scheduled").update_all(
      description: "Work with application forms scheduled to be published"
    )
  end

  def down
    Sandbox.where(name: "Published").update_all(
      name: "Published Sandbox",
      description: nil
    )
    Sandbox.where(name: "Scheduled").update_all(
      name: "Scheduled Sandbox",
      description: nil
    )
  end
end
