module Reports
  module Registry
    REPORTS = {
      "application_growth" => "Reports::ApplicationGrowth",
      "step_code_part_9" => "Reports::StepCodePart9",
      "step_code_part_3" => "Reports::StepCodePart3",
      "step_code_part_9_submissions" => "Reports::StepCodePart9Submissions",
      "step_code_part_3_submissions" => "Reports::StepCodePart3Submissions",
      "jurisdiction_enablement" => "Reports::JurisdictionEnablement",
      "jurisdiction_volume" => "Reports::JurisdictionVolume",
      "template_usage" => "Reports::TemplateUsage",
      "template_stall" => "Reports::TemplateStall",
      "accounts" => "Reports::Accounts",
      "submitter_adoption" => "Reports::SubmitterAdoption",
      "draft_completion" => "Reports::DraftCompletion",
      "review_process" => "Reports::ReviewProcess",
      "platform_health" => "Reports::PlatformHealth",
      "storage_footprint" => "Reports::StorageFootprint"
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

    def build(key, range, subject: nil)
      fetch!(key).new(range: range, subject: subject)
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
