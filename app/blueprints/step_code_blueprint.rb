class StepCodeBlueprint < Blueprinter::Base
  identifier :id

  association :checklists,
              blueprint: StepCodeChecklistBlueprint,
              if: ->(_field_name, step_code, _options) do
                step_code.is_a? Part9StepCode
              end
end
