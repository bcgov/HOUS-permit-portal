namespace :submission_data do
  desc "Converts snake_case keys to camelCase for file objects in PermitApplication.submission_data"
  task fix_file_object_keys: :environment do
    puts "Starting conversion of snake_case keys in submission_data file objects..."

    result = SubmissionDataKeyConverterService.call

    puts "--- Key Conversion Summary ---"
    puts "Total PermitApplications processed: #{result[:processed_count]}"
    puts "Total PermitApplications updated: #{result[:updated_count]}"
    if result[:failed_records].any?
      puts "Failed to update the following PermitApplication IDs:"
      result[:failed_records].each do |failure|
        puts "  ID: #{failure[:id]}, Error: #{failure[:error]}"
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
