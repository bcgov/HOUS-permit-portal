class StepCode::Part3::V1::Performance::SuiteSubMeteringAdjustment < StepCode::Part3::V1::Performance::Base
  private

  def teui
    super do
      return 0 if checklist.suite_heating_energy.blank?

      checklist.suite_heating_energy * 0.15 / total_mfa
    end
  end

  def tedi
    super {}
  end

  def ghgi
    super {}
  end

  def total_energy
    super {}
  end

  def total_mfa
    @total_mfa ||=
      checklist.occupancy_classifications.baseline_occupancy.sum(
        :modelled_floor_area
      )
  end
end
