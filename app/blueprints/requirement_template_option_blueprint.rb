class RequirementTemplateOptionBlueprint < OptionBlueprint
  field :value do |record, _options|
    record.id
  end

  field :label do |record, _options|
    record.nickname
  end

  field :group_id do |record, _options|
    record.template_category_id
  end

  field :group_label do |record, _options|
    record.template_category&.label
  end

  field :group_sort_order do |record, _options|
    record.template_category&.sort_order
  end
end
