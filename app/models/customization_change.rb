class CustomizationChange < ApplicationRecord
  belongs_to :jurisdiction_template_version_customization

  def highlight_component_ids
    component_ids(enabled_components) + component_ids(optional_components)
  end

  def field_labels
    (enabled_components + optional_components + disabled_components)
      .filter_map { |component| component["label"].presence }
      .uniq
  end

  def component_ids(components)
    Array(components).filter_map do |component|
      component.is_a?(Hash) ? component["id"]&.to_s : nil
    end
  end
end
