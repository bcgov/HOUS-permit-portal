class SecondaryType < ApplicationRecord
  belongs_to :primary_type
  has_many :permit_templates
end
