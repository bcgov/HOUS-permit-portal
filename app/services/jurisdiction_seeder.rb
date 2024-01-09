require "csv"

class JurisdictionSeeder
  def self.seed
    @current_regional_district = nil
    CSV.foreach("docs/csv/jurisdictions.csv", headers: true, header_converters: :symbol) do |row|
      next unless row[:name].present?
      type = row[:qualifier] == "regional district" ? "RegionalDistrict" : "SubDistrict"
      j = Jurisdiction.find_or_create_by!(name: row[:name], type: type)

      j.qualifier = "The #{row[:qualifier].titleize} Of"
      j.incorporation_date = row[:date_of_incorporation]
      j.postal_address = row[:postal_address]
      j.regional_district = @current_regional_district if row[:regional_district].present? &&
        @current_regional_district.present?
      j.save

      @current_regional_district = j if row[:qualifier] == "regional district"
    end
  end
end
