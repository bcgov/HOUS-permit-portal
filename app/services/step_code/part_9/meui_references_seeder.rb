class StepCode::Part9::MEUIReferencesSeeder
  def self.seed!
    file_name = "#{Rails.root}/db/templates/meui_references.xlsx"
    if File.exist?(file_name)
      xlsx = Roo::Spreadsheet.open(file_name)

      MechanicalEnergyUseIntensityReference.transaction do
        header_row = xlsx.row(1)
        data_rows =
          (2..xlsx.last_row).map do |i|
            xlsx.row(i).map { |cell| MAPPINGS[cell] || cell }
          end

        data_rows.each do |row|
          data_hash = Hash[header_row.zip(row)]
          MechanicalEnergyUseIntensityReference.find_or_create_by!(data_hash)
        end
      end
    end
  end

  MAPPINGS = {
    "4 - Less than 3000" => ..2999,
    "5 - 3000 to 3999" => 3000..3999,
    "6 - 4000 to 4999" => 4000..4999,
    "7A - 5000 to 5999" => 5000..5999,
    "7B - 6000 to 6999" => 6000..6999,
    "8 - More than 6999" => 7000..,
    "Not more than 50%" => ..0.5,
    "More than 50%" => 0.5...,
    "≤ 50" => ..50,
    "51 to 75" => 51..75,
    "76 to 120" => 76..120,
    "121 to 165" => 121..165,
    "166 to 210" => 166..210,
    "> 210" => 210..
  }
end
