class AdditionalPermitRequestBlueprint < Blueprinter::Base
  identifier :id

  view :base do
    fields :requirement_template_id,
           :name_snapshot,
           :comment,
           :created_at,
           :addressed_at
    field :sibling_status do |request, _options|
      request.sibling_application&.status
    end
  end

  view :extended do
    include_view :base
    association :user, blueprint: UserBlueprint, view: :minimal
  end
end
