module StepCode::BuildingCharacteristics::WithPerformanceType
  extend ActiveSupport::Concern

  included do
    def performance_type=(value)
      @performance_type = self.class::PERFORMANCE_TYPES[value] || value
    end

    def performance_type
      self.class::PERFORMANCE_TYPES.key(@performance_type) || @performance_type
    end

    validate :valid_performance_type

    def valid_performance_type
      if self.performance_type.blank? ||
           self.class::PERFORMANCE_TYPES.keys.include?(self.performance_type)
        return
      end
      self.errors.add(
        :base,
        I18n.t(
          "step_code_building_characteristics_summary.performance_type.error",
          field_name: self.class.name.demodulize.underscore.humanize,
          accepted_values: self.class::PERFORMANCE_TYPES.keys.join(", ")
        )
      )
    end
  end
end
