class StepCode::Part3::V1::Performance::Base
  attr_reader :checklist
  attr_accessor :results

  def initialize(checklist:)
    @checklist = checklist
  end

  def call
    self.results = {
      teui: teui,
      tedi: tedi,
      ghgi: ghgi,
      total_energy: total_energy
    }
    self
  end

  private

  def total_energy
    return unless applicable?(:total_energy)

    yield
  end

  def teui
    return unless applicable?(:teui)

    yield
  end

  def tedi
    return unless applicable?(:tedi)

    yield
  end

  def ghgi
    return unless applicable?(:ghgi)

    yield
  end

  def applicable?(metric)
    compliance_metrics.include?(metric)
  end

  def compliance_metrics
    @compliance_metrics ||= checklist.compliance_metrics
  end
end
