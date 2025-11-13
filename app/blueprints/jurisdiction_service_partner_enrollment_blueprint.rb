class JurisdictionServicePartnerEnrollmentBlueprint < Blueprinter::Base
  identifier :id

  fields :service_partner, :enabled, :created_at, :updated_at

  field :jurisdiction_id do |enrollment|
    enrollment.jurisdiction.id
  end

  field :jurisdiction_qualified_name do |enrollment|
    enrollment.jurisdiction.qualified_name
  end
end
