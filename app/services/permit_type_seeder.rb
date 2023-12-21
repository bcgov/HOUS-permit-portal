class PermitTypeSeeder
  def self.run
    LowResidentialBuildingType.default_building_type_data.each do |type|
      LowResidentialBuildingType.find_or_create_by!(name: type[:name]) do |building_type|
        building_type.description = type[:description]
      end
    end

    WorkType.default_work_type_data.each { |type| WorkType.find_or_create_by!(name: type[:name]) }
  end
end
