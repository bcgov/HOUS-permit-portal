class StepCodeBlueprint < StepCodeBaseBlueprint
  field :permit_project_title

  field :stage_completions do |step_code|
    checklists_by_stage = step_code.checklists.index_by(&:stage)

    StepCode::STAGES.map do |stage|
      checklist = checklists_by_stage[stage]

      { stage: stage, complete: checklist.present? && checklist.complete? }
    end
  end
end
