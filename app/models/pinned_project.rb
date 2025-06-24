class PinnedProject < ApplicationRecord
  belongs_to :user
  belongs_to :permit_project
end
