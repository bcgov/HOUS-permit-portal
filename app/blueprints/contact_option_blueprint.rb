class ContactOptionBlueprint < OptionBlueprint
  fields :label

  association :value, blueprint: ContactBlueprint
end
