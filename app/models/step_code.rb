class StepCode < ApplicationRecord
  has_many :data_entries, class_name: "StepCodeDataEntry"
end
