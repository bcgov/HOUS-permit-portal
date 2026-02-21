class JurisdictionRequirementTemplate < ApplicationRecord
  belongs_to :jurisdiction
  belongs_to :requirement_template
end
