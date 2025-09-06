class PdfFormBlueprint < Blueprinter::Base
  identifier :id

  fields :form_type, :status, :created_at

  field :form_json do |pdf_form, _options|
    pdf_form.form_json
  end

  field :user_id do |pdf_form, _options|
    pdf_form.user_id
  end

  view :pdf_generation do
    fields :id, :form_type, :status, :created_at, :user_id

    field :form_json do |pdf_form, _options|
      pdf_form.form_json
    end
  end
end
