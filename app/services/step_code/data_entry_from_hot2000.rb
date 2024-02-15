class StepCode::DataEntryFromHot2000
  attr_reader :xml, :data_entry

  def initialize(xml:, data_entry:)
    @xml = xml
    @data_entry = data_entry
  end

  def call
    mapper = StepCode::DataEntryHot2000Mapper.new(xml:)
    data_entry.update!(mapper.mappings)
    return self
  end
end
