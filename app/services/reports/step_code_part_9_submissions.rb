module Reports
  class StepCodePart9Submissions < StepCodePart9
    include StepCodeSubmissions

    def step_code_class
      Part9StepCode
    end

    def checklist_includes
      { checklists: :data_entries }
    end
  end
end
