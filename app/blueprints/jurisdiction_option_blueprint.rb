class JurisdictionOptionBlueprint < OptionBlueprint
  fields :label

  association :value, blueprint: JurisdictionBlueprint, view: :base
end
