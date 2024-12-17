# frozen_string_literal: true

class EnableInboxes < ActiveRecord::Migration[7.1]
  def up
    Jurisdiction.find_each do |jurisdiction|
      # To optimize, check if inbox_enabled is already true
      next if jurisdiction.inbox_enabled

      # Evaluate the computed method
      if jurisdiction.submission_inbox_set_up
        # Update inbox_enabled to true
        if jurisdiction.update(inbox_enabled: true)
          puts "✅ Enabled inbox for Jurisdiction: #{jurisdiction.id} - #{jurisdiction.qualified_name}"
        else
          puts "❌ Failed to enable inbox for Jurisdiction ID: #{jurisdiction.id} - #{jurisdiction.qualified_name} - Errors: #{jurisdiction.errors.full_messages.join(", ")}"
        end
      end
    end
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
