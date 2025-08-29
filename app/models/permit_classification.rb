class PermitClassification < ApplicationRecord
  # This class will have a 'type' column for STI.

  validates :code, presence: true, uniqueness: true
  validates :name, presence: true
  validate :code_immutable, on: :update
  validate :type_immutable, on: :update

  before_validation :normalize_category

  scope :enabled, -> { where(enabled: true) }

  enum code: %i[
         low_residential
         medium_residential
         high_residential
         new_construction
         addition_alteration_renovation
         site_alteration
         demolition
         manufactured_home
         mechanical
         plumbing
         electrical
         gas
         solid_fuel_burning_appliance
         fire_alarm
         fire_suppression
         tree_cutting_and_tree_removal
         retaining_wall
         relocation
       ]

  def image_url
    ActionController::Base.helpers.asset_path(
      "images/permit_classifications/#{self.code}.png"
    )
  end

  def category_label
    category&.humanize
  end

  private

  def code_immutable
    if code_changed? && self.persisted? && self.code_was.present?
      errors.add(:code, "cannot be changed once set")
    end
  end

  def type_immutable
    if type_changed? && self.persisted? && self.type_was.present?
      errors.add(:type, "cannot be changed once set")
    end
  end

  def normalize_category
    self.category = category&.to_s&.strip&.underscore&.presence
  end
end
