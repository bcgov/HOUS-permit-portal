require "csv"

class JurisdictionSeeder
  def self.seed
    @current_regional_district = nil
    CSV.foreach(
      "docs/csv/jurisdictions.csv",
      headers: true,
      header_converters: :symbol
    ) do |row|
      next unless row[:name].present?

      is_rd = row[:locality_type] == "regional district"
      type = is_rd ? "RegionalDistrict" : "SubDistrict"

      if row[:regional_district].present? && is_rd
        raise ActiveRecord::RecordInvalid
      end
      j =
        Jurisdiction.find_or_create_by!(
          name: row[:name],
          locality_type: row[:locality_type],
          type: type
        )
      j.incorporation_date = row[:incorporation_date]
      j.postal_address = row[:postal_address]
      j.regional_district = @current_regional_district if row[
        :regional_district
      ] == @current_regional_district&.name &&
        @current_regional_district.present?
      j.save

      @current_regional_district = j if is_rd
    end

    Jurisdiction.reindex
  end
end
