namespace :reports do
  desc "Write docs/step-code-question-inventory.md from the Part 9 checklist schema"
  task step_code_question_inventory: :environment do
    path = Reports::StepCodeQuestionInventory.write!
    puts "Wrote #{path}"
  end
end
