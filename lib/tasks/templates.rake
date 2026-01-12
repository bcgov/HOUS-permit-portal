namespace :templates do
  desc "Export Requirement Templates to a Zip file (NDJSON)"
  task :export, [:output_path] => :environment do |_, args|
    output_path =
      args[:output_path] ||
        Rails.root.join(
          "tmp",
          "templates_export_#{Time.current.strftime("%Y%m%d%H%M%S")}.zip"
        )

    puts "Starting export to #{output_path}..."
    Infrastructure::TemplateExportService.new(output_path).call
    puts "Export finished."
  end

  desc "Import Requirement Templates from a Zip file (NDJSON). Set WIPE=true to clear existing data."
  task :import, [:input_path] => :environment do |_, args|
    input_path = args[:input_path]
    unless input_path && File.exist?(input_path)
      puts "Error: Please provide a valid input path. Usage: rake templates:import[path/to/file.zip]"
      exit 1
    end

    wipe = ENV["WIPE"] == "true"

    puts "please add WIPE=true to the command to continue" unless wipe
    exit 0 unless wipe

    puts "WARNING: You have requested to WIPE existing template data."
    puts "This will destroy PermitApplications, Templates, Step Codes, Blocks, and all other template related data."
    puts "Are you sure? (y/n)"
    input = STDIN.gets.strip.downcase
    unless input == "y"
      puts "Aborted."
      exit 0
    end

    puts "Starting import from #{input_path} (Wipe: #{wipe})..."
    Infrastructure::TemplateImportService.new(input_path).call
    puts "Import finished."
  end
end
