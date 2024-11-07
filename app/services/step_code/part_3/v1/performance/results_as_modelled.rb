class StepCode::Part3::V1::Performance::ResultsAsModelled
  def initialize(checklist:, requirements:)
  end

  def call
    # if there are ONLY baseline occupancies, use total energy, otherwise use teui/tedi/ghgi

    # TEUI - total annual energy - total electricity generated onsite / total MFA
    # TEDI - annual thermal energy demand for TEDI / total MFA
    # GHGI - total annual emissions / total MFA
    { teui: teui, tedi: tedi, ghgi: ghgi, total_energy: total_energy }
  end

  private

  def total_energy
    # total annual anergy - total electricty generated onsite
  end

  def teui
    # total annual energy - total electricity generated onsite / total MFA
  end

  def tedi
    # annual thermal energy demand for TEDI / total MFA
  end

  def ghgi
    # total annual emissions / total MFA
  end
end
