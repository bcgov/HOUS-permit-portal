namespace :submission_data do
  desc "Converts snake_case keys to camelCase for file objects in PermitApplication and SubmissionVersion submission_data"
  task fix_file_object_keys: :environment do
    puts "Starting conversion of snake_case keys in submission_data for PermitApplication and SubmissionVersion..."

    result = SubmissionDataKeyConverterService.call

    puts "--- Key Conversion Summary ---"
    puts "Total records processed: #{result[:processed_count]}"
    puts "Total records updated: #{result[:updated_count]}"
    if result[:failed_records].any?
      puts "Failed to update the following records:"
      result[:failed_records].each do |failure|
        puts "  Model: #{failure[:model]}, ID: #{failure[:id]}, Error: #{failure[:error]}"
      end
    else
      puts "No failures encountered." if result[:updated_count] > 0
      if result[:updated_count] == 0 && result[:processed_count] > 0
        puts "No records required updating."
      end
    end
    puts "Key conversion process finished."
  end
end
