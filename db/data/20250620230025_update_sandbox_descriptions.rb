# frozen_string_literal: true

class UpdateSandboxDescriptions < ActiveRecord::Migration[7.1]
  # This data migration is not designed to be reversible.
  # It standardizes sandbox names and adds descriptions.
  disable_ddl_transaction!

  def up
    say_with_time "Updating Sandbox names and descriptions" do
      published_renamed_count =
        Sandbox.where(name: "Published Sandbox").update_all(name: "Published")
      scheduled_renamed_count =
        Sandbox.where(name: "Scheduled Sandbox").update_all(name: "Scheduled")

      published_desc_updated_count =
        Sandbox.where(name: "Published").update_all(
          description:
            "Work with application forms that have already been published"
        )
      scheduled_desc_updated_count =
        Sandbox.where(name: "Scheduled").update_all(
          description: "Work with application forms scheduled to be published"
        )

      say "--- Sandbox Update Summary ---"
      say "Renamed 'Published Sandbox' to 'Published': #{published_renamed_count} record(s)."
      say "Renamed 'Scheduled Sandbox' to 'Scheduled': #{scheduled_renamed_count} record(s)."
      say "Updated description for 'Published' sandbox: #{published_desc_updated_count} record(s)."
      say "Updated description for 'Scheduled' sandbox: #{scheduled_desc_updated_count} record(s)."

      (
        published_renamed_count + scheduled_renamed_count +
          published_desc_updated_count + scheduled_desc_updated_count
      )
    end
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
