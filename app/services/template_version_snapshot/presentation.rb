# frozen_string_literal: true

module TemplateVersionSnapshot
  class Presentation
    attr_reader :template_version

    def initialize(template_version)
      @template_version = template_version
    end

    def snapshot
      @snapshot ||=
        template_version.snapshot_json.deep_stringify_keys.tap do |value|
          unless value["schema_version"] == Builder::SCHEMA_VERSION
            raise ArgumentError,
                  "Unsupported TemplateVersion snapshot schema: #{value["schema_version"].inspect}"
          end
        end
    end

    def summary
      snapshot.fetch("template").deep_dup
    end

    def blocks(display: false)
      value = snapshot.fetch("blocks").deep_dup
      return value unless display

      value.except(*hidden_block_ids)
    end

    def outline(display: false)
      block_map = blocks(display: display)
      template =
        summary.merge(
          "requirement_template_sections" =>
            snapshot
              .fetch("sections")
              .map do |section|
                {
                  "id" => section.fetch("id"),
                  "name" => section["name"],
                  "position" => section["position"],
                  "template_section_blocks" =>
                    section
                      .fetch("blocks")
                      .filter_map do |section_block|
                        block = block_map[section_block.fetch("block_id")]
                        next if block.blank?

                        {
                          "id" => section_block.fetch("id"),
                          "position" => section_block["position"],
                          "conditional" => section_block["conditional"],
                          "requirement_block" => block
                        }
                      end
                }
              end
        )

      template
    end

    def form_json(display: false)
      value = (template_version.form_json || {}).deep_dup
      return value unless display && hidden_block_ids.any?

      components = value["components"] || value[:components]
      strip_hidden_form_components!(components) if components.is_a?(Array)
      value
    end

    def form_component_index
      @form_component_index ||=
        index_form_components(template_version.form_json)
    end

    def hidden_block_ids
      @hidden_block_ids ||=
        if template_version.draft?
          RequirementBlock
            .where(
              id: snapshot.fetch("blocks").keys,
              hide_in_early_access: true
            )
            .pluck(:id)
            .map(&:to_s)
        else
          []
        end
    end

    private

    def strip_hidden_form_components!(components)
      components.reject! do |component|
        hidden_block_ids.include?((component["id"] || component[:id])&.to_s)
      end

      components.each do |component|
        nested = component["components"] || component[:components]
        strip_hidden_form_components!(nested) if nested.is_a?(Array)
      end
    end

    def index_form_components(value, index = {})
      case value
      when Hash
        id = value["id"] || value[:id]
        index[id.to_s] = value if id.present?
        value.each_value { |child| index_form_components(child, index) }
      when Array
        value.each { |child| index_form_components(child, index) }
      end

      index
    end
  end
end
