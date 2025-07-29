namespace :db do
  desc "Export Step Code data to JSON backup"
  task :export_step_code, [:permit_id] => :environment do |t, args|
    require "json"

    permit_id =
      args[:permit_id] || PermitApplication.order(updated_at: :desc).first&.id
    unless permit_id
      puts "No PermitApplications found in the database. Aborting."
      exit(1)
    end

    begin
      pa = PermitApplication.find(permit_id)
      step_code = pa.step_code
      unless step_code
        puts "No StepCode found for PermitApplication #{permit_id}. Aborting."
        exit(1)
      end
      checklist = step_code.checklist
      unless checklist
        puts "No Checklist found for StepCode #{step_code.id}. Aborting."
        exit(1)
      end

      # Collect all referenced fuel type IDs
      referenced_fuel_type_ids = []
      referenced_fuel_type_ids += checklist.fuel_types.pluck(:id)
      referenced_fuel_type_ids +=
        checklist.make_up_air_fuels.pluck(:fuel_type_id)
      referenced_fuel_type_ids +=
        checklist.reference_energy_outputs.pluck(:fuel_type_id)
      referenced_fuel_type_ids +=
        checklist.modelled_energy_outputs.pluck(:fuel_type_id)

      all_fuel_types =
        Part3StepCode::FuelType.where(
          id: referenced_fuel_type_ids.uniq.compact
        ).as_json

      checklist_json =
        checklist.as_json(
          include: %i[
            occupancy_classifications
            make_up_air_fuels
            document_references
            reference_energy_outputs
            modelled_energy_outputs
          ]
        )
      checklist_json["fuel_types"] = all_fuel_types

      data = { step_code: step_code.as_json, checklist: checklist_json }

      file_path = Rails.root.join("tmp/step_code_data_backup.json")
      File.write(file_path, data.to_json)
      puts "Exported Step Code data to #{file_path}"
    rescue ActiveRecord::RecordNotFound => e
      puts "Error: PermitApplication with ID #{permit_id} not found."
      exit(1)
    rescue StandardError => e
      puts "Error during export: #{e.message}"
      puts e.backtrace
      exit(1)
    end
  end

  desc "Restore Step Code data from JSON backup to an existing PermitApplication"
  task :restore_step_code, [:permit_id] => :environment do |t, args|
    require "json"

    permit_id =
      args[:permit_id] || PermitApplication.order(updated_at: :desc).first&.id
    unless permit_id
      puts "No PermitApplications found in the database. Aborting."
      exit(1)
    end

    file_path = Rails.root.join("tmp/step_code_data_backup.json")
    unless File.exist?(file_path)
      puts "Backup file not found at #{file_path}. Aborting."
      exit(1)
    end

    data = JSON.parse(File.read(file_path))

    begin
      ActiveRecord::Base.transaction do
        pa = PermitApplication.find(permit_id)
        puts "Using existing PermitApplication: #{pa.id}"

        if pa.step_code.present?
          # Explicitly destroy the checklist first to avoid foreign key violations
          pa.step_code.primary_checklist&.destroy
          pa.step_code.destroy
        end
        puts "Destroyed existing StepCode and its checklist if present"

        # Create new StepCode attached to the existing PermitApplication
        step_code_data = data["step_code"]
        step_code =
          StepCode.create!(
            step_code_data.except(
              "id",
              "created_at",
              "updated_at",
              "permit_application_id",
              "checklist_id"
            ).merge(permit_application: pa)
          )
        step_code.update_columns(
          type: "Part3StepCode",
          created_at: step_code_data["created_at"],
          updated_at: step_code_data["updated_at"]
        ) # Set timestamps manually
        puts "Created new StepCode: #{step_code.id}"

        # Create new Checklist attached to the new StepCode
        checklist_data = data["checklist"]
        checklist =
          Part3StepCode::Checklist.create!(
            checklist_data.except(
              "id",
              "created_at",
              "updated_at",
              "step_code_id",
              "occupancy_classifications",
              "baseline_occupancies",
              "step_code_occupancies",
              "fuel_types",
              "make_up_air_fuels",
              "document_references",
              "reference_energy_outputs",
              "modelled_energy_outputs"
            ).merge(step_code: step_code)
          )
        checklist.update_columns(
          created_at: checklist_data["created_at"],
          updated_at: checklist_data["updated_at"]
        )
        puts "Created new Checklist: #{checklist.id}"

        # Create new nested associations attached to the new Checklist
        model_classes = {
          "occupancy_classifications" =>
            "Part3StepCode::OccupancyClassification",
          "fuel_types" => "Part3StepCode::FuelType",
          "make_up_air_fuels" => "Part3StepCode::MakeUpAirFuel",
          "document_references" => "Part3StepCode::DocumentReference",
          "reference_energy_outputs" => "Part3StepCode::EnergyOutput",
          "modelled_energy_outputs" => "Part3StepCode::EnergyOutput"
        }
        fuel_type_id_map = {}
        model_classes.each do |assoc, class_name|
          next unless checklist_data[assoc]

          model_class = class_name.constantize
          checklist_data[assoc].each do |item_data|
            if assoc == "fuel_types"
              if item_data["checklist_id"].nil?
                # This is a global/default fuel type
                new_ft =
                  Part3StepCode::FuelType.find_or_create_by!(
                    key: item_data["key"]
                  ) do |ft|
                    ft.emissions_factor = item_data["emissions_factor"]
                    ft.description = item_data["description"]
                    ft.source = item_data["source"]
                  end
              else
                # This is a checklist-specific fuel type
                create_params =
                  item_data.except(
                    "id",
                    "created_at",
                    "updated_at",
                    "checklist_id"
                  ).merge(checklist: checklist)
                new_ft = model_class.create!(create_params)
              end
              new_ft.update_columns(
                created_at: item_data["created_at"],
                updated_at: item_data["updated_at"]
              )
              fuel_type_id_map[item_data["id"]] = new_ft.id
              puts "Restored fuel_type: #{new_ft.id}"
            else
              create_params =
                item_data.except(
                  "id",
                  "created_at",
                  "updated_at",
                  "checklist_id"
                ).merge(checklist: checklist)
              if %w[
                   make_up_air_fuels
                   reference_energy_outputs
                   modelled_energy_outputs
                 ].include?(assoc) && item_data["fuel_type_id"]
                create_params["fuel_type_id"] = fuel_type_id_map[
                  item_data["fuel_type_id"]
                ]
              end
              item = model_class.create!(create_params)
              item.update_columns(
                created_at: item_data["created_at"],
                updated_at: item_data["updated_at"]
              )
              puts "Created new #{assoc}: #{item.id}"
            end
          end
        end

        puts "Restoration complete! Data attached to PermitApplication #{pa.id}."
      end
    rescue ActiveRecord::RecordNotFound => e
      puts "Error: PermitApplication with ID #{permit_id} not found."
      raise
    rescue StandardError => e
      puts "Error during restoration: #{e.message}"
      puts e.backtrace
      raise # Re-raise to rollback transaction
    end
  end
end
