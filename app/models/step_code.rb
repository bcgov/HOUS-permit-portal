class StepCode < ApplicationRecord
  has_many :data_entries, class_name: "StepCodeDataEntry", dependent: :destroy
  has_many :checklists, class_name: "StepCodeChecklist", dependent: :destroy
  has_one :pre_construction_checklist, -> { where(stage: :pre_construction) }, class_name: "StepCodeChecklist"

  after_create :create_pre_construction_checklist
end
