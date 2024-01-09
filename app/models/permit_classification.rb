class PermitClassification < ApplicationRecord
  # This class will have a 'type' column for STI.

  validates :code, presence: true, uniqueness: :true
  validates :name, presence: true
end
