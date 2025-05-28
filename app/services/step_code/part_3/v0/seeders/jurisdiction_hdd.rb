class StepCode::Part3::V0::Seeders::JurisdictionHDD
  def self.seed!
    file_name = "#{Rails.root}/db/templates/jurisdiction_hdd_references.xlsx"
    if File.exist?(file_name)
      xlsx = Roo::Spreadsheet.open(file_name)

      header_row = xlsx.row(1)
      header_mapping = header_row.each_with_index.to_h

      (2..xlsx.last_row).map do |i|
        row = xlsx.row(i)
        name = row[header_mapping["jurisdiction_name"]]
        locality_type = row[header_mapping["locality_type"]]
        next unless name && locality_type

        hdd = row[header_mapping["BCBC 2018 HDD"]]
        j = Jurisdiction.find_by(name:, locality_type:)
        j&.update!(heating_degree_days: hdd)
      end
    end
  end
end
