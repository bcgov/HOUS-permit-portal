class StepCode::InitializeFromHot2000
  attr_reader :xml, :step_code

  def initialize(xml:, step_code: nil)
    @xml = xml
    @step_code = step_code || StepCode.new
  end

  def call
    mapper = StepCode::DataEntryHot2000Mapper.new(xml:)
    step_code.data_entries.build(mapper.mappings)
    step_code.save!
    return self
  end
end
