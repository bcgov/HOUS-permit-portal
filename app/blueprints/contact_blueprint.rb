class ContactBlueprint < Blueprinter::Base
  identifier :id

  fields :first_name,
         :last_name,
         :title,
         :department,
         :phone,
         :email,
         :extension,
         :cell,
         :address,
         :organization,
         :business_name,
         :business_license,
         :professional_association,
         :professional_number,
         :contact_type,
         :created_at,
         :updated_at
end
