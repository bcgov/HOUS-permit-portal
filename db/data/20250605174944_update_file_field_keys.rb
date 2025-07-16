# frozen_string_literal: true

class UpdateFileFieldKeys < ActiveRecord::Migration[7.1]
  # This migration is not reversible as we are correcting data to a new standard format.
  # The original snake_case keys are being removed.
  disable_ddl_transaction!

  def up
    say_with_time "Converting snake_case keys for file objects in PermitApplication and SubmissionVersion submission_data" do
      # In some environments (especially when running migrations), autoloading might not be configured.
      # This ensures the service class is loaded before we try to use it.
      require_dependency Rails.root.join(
                           "app",
                           "services",
                           "submission_data_key_converter_service.rb"
                         )

      result = SubmissionDataKeyConverterService.call

      say "--- Key Conversion Summary ---"
      say "Total records processed: #{result[:processed_count]}"
      say "Total records updated: #{result[:updated_count]}"

      if result[:failed_records].any?
        say "The following records failed to update. Check logs for details:"
        result[:failed_records].each do |failure|
          say "  - Model: #{failure[:model]}, ID: #{failure[:id]}, Error: #{failure[:error]}"
        end
      else
        say "No failures encountered." if result[:updated_count].positive?
        if result[:updated_count].zero? && result[:processed_count].positive?
          say "No records required updating."
        end
      end
      say "--- Key conversion process finished. ---"

      # Returning the number of updated records is a convention that can be useful for logging.
      result[:updated_count]
    end
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
