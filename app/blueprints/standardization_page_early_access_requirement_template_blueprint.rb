class StandardizationPageEarlyAccessRequirementTemplateBlueprint < Blueprinter::Base
  identifier :id
  fields :nickname, :description
  field :is_available_for_adoption do |template|
    template.has_live_published_version?
  end
  field :activity_category do |template|
    template.activity.category
  end
end
