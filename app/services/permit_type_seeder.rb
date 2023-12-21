class PermitTypeSeeder
  def self.run
    WorkType.default_work_type_data.each { |type| WorkType.find_or_create_by!(name: type[:name]) }
  end
end
