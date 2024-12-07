class StepCode::Part3::V0::Seeders::JurisdictionHDD
  def self.seed!
    file_name = "#{Rails.root}/db/templates/jurisdiction_hdd_references.xlsx"
    if File.exist?(file_name)
      xlsx = Roo::Spreadsheet.open(file_name)

      header_row = xlsx.row(1)
      header_mapping = header_row.each_with_index.to_h

      (2..xlsx.last_row).map do |i|
        row = xlsx.row(i)
        jurisdiction_id = row[header_mapping["jurisdiction_id"]]
        next unless jurisdiction_id

        hdd = row[header_mapping["BCBC 2018 HDD"]]
        j = Jurisdiction.find(jurisdiction_id)
        j.update!(heating_degree_days: hdd)
      end
    end
  end
end
