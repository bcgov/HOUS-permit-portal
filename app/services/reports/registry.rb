module Reports
  module Registry
    REPORTS = {
      "application_growth" => "Reports::ApplicationGrowth",
      "step_code_part_9" => "Reports::StepCodePart9"
    }.freeze

    module_function

    def registered?(key)
      REPORTS.key?(key.to_s)
    end

    def fetch!(key)
      class_name =
        REPORTS.fetch(key.to_s) { raise KeyError, "Unknown report #{key}" }
      class_name.constantize
    end

    def build(key, range)
      fetch!(key).new(range: range)
    end

    def summaries
      REPORTS.map do |key, class_name|
        klass = class_name.constantize
        { key: key, title: klass.title, description: klass.description }
      end
    end

    def keys
      REPORTS.keys
    end
  end
end
