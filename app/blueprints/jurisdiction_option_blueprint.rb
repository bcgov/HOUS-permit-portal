class JurisdictionOptionBlueprint < OptionBlueprint
  fields :label

  association :value, blueprint: JurisdictionBlueprint
end
