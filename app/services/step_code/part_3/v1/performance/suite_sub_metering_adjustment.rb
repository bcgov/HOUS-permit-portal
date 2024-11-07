class StepCode::Part3::V1::Performance::SuiteSubMeteringAdjustment
  attr_reader :checklist

  def initialize(checklist:)
    @checklist = checklist
  end

  def call
    { teui: teui, tedi: nil, ghgi: nil }
  end

  private

  def teui
    # if checklist.suite_heating_energy.blank? (e.g. suite is submetered) return 0
    # checklist.suite_heating_energy * 0.15 / total MFA
  end
end
