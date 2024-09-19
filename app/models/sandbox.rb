class Sandbox < ApplicationRecord
  belongs_to :jurisdiction
  validates :name, presence: true, uniqueness: { scope: :jurisdiction_id }

  private
end
