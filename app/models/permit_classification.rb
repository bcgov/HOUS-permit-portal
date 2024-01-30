class PermitClassification < ApplicationRecord
  # This class will have a 'type' column for STI.

  validates :code, presence: true, uniqueness: :true
  validates :name, presence: true

  def image_url
    ActionController::Base.helpers.asset_path("images/permit_classifications/#{self.code}.png")
  end
end
