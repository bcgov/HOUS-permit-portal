class PermitClassification < ApplicationRecord
  # This class will have a 'type' column for STI.

  validates :code, presence: true, uniqueness: :true
  validates :name, presence: true

  scope :enabled, -> { where(enabled: true) }

  enum code: %i[
         low_residential
         medium_residential
         high_residential
         new_construction
         addition_alteration_renovation
         site_alteration
         demolition
       ]

  def image_url
    ActionController::Base.helpers.asset_path(
      "images/permit_classifications/#{self.code}.png"
    )
  end
end
