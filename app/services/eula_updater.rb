class EulaUpdater
  def self.run(should_override_existing: true)
    # Define the path where EULA content files are stored
    content_path = Rails.root.join("eulas")

    # Variants we want to process
    variants = EndUserLicenseAgreement.variants.keys

    variants.each do |variant|
      puts "updating #{variant}"
      # Construct the file path for the variant's HTML content
      file_path = content_path.join("#{variant}.html")

      if File.exist?(file_path)
        # Read the HTML content from the file
        html_content = File.read(file_path)

        # Find or initialize the EULA record for the variant
        eula =
          (
            if should_override_existing
              EndUserLicenseAgreement.find_or_initialize_by(
                active: true,
                variant: variant
              )
            else
              EndUserLicenseAgreement.build(active: true, variant: variant)
            end
          )

        # Update the content
        eula.content = html_content.gsub("\u0000", "")

        # Save the record
        if eula.save
          puts "EULA for variant '#{variant}' updated or created successfully."
        else
          puts "Failed to save EULA for variant '#{variant}'. Errors: #{eula.errors.full_messages.join(", ")}"
        end
      else
        puts "Content file for variant '#{variant}' does not exist."
      end
    end
  end
end
