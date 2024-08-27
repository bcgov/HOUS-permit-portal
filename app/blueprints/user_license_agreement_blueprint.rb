class UserLicenseAgreementBlueprint < Blueprinter::Base
  identifier :id

  association :agreement, blueprint: EndUserLicenseAgreementBlueprint

  fields :accepted_at
end
