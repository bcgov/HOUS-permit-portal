# frozen_string_literal: true

module TemplateVersionSnapshot
  class Builder
    SCHEMA_VERSION = 1

    attr_reader :requirement_template

    def self.call(requirement_template)
      build =
        lambda do
          source = requirement_template.class.find(requirement_template.id)
          new(source).call
        end

      if requirement_template.class.connection.transaction_open?
        build.call
      else
        requirement_template
          .class
          .transaction(isolation: :repeatable_read) { build.call }
      end
    end

    def initialize(requirement_template)
      @requirement_template = requirement_template
    end

    def call
      raw_blocks = {}
      sections = build_sections(raw_blocks)
      snapshot = {
        "schema_version" => SCHEMA_VERSION,
        "template" => template_attributes,
        "sections" => sections,
        "blocks" => strip_generated_fields(raw_blocks)
      }
      form_json = requirement_template.to_form_json

      Validator.call(snapshot_json: snapshot, form_json: form_json)

      { snapshot_json: snapshot, form_json: form_json }
    end

    private

    def build_sections(raw_blocks)
      requirement_template
        .requirement_template_sections
        .includes(
          template_section_blocks: {
            requirement_block: %i[requirements requirement_documents]
          }
        )
        .order(:position)
        .map do |section|
          {
            "id" => section.id,
            "name" => section.name,
            "position" => section.position,
            "blocks" =>
              section.template_section_blocks.map do |section_block|
                block = section_block.requirement_block
                raw_blocks[
                  block.id
                ] ||= RequirementBlockBlueprint.render_as_hash(
                  block,
                  parent_key: section.key
                ).deep_stringify_keys

                {
                  "id" => section_block.id,
                  "block_id" => block.id,
                  "position" => section_block.position,
                  "conditional" => section_block.conditional
                }
              end
          }
        end
    end

    def template_attributes
      {
        "id" => requirement_template.id,
        "nickname" => requirement_template.nickname,
        "description" => requirement_template.description,
        "tags" => requirement_template.tag_list,
        "available_globally" => requirement_template.available_globally,
        "template_category_id" => requirement_template.template_category_id,
        "template_category" => template_category_attributes,
        "sort_order" => requirement_template.sort_order
      }
    end

    def template_category_attributes
      category = requirement_template.template_category
      return if category.blank?

      {
        "id" => category.id,
        "label" => category.label,
        "sort_order" => category.sort_order
      }
    end

    def strip_generated_fields(raw_blocks)
      raw_blocks.transform_values do |raw_block|
        block = raw_block.deep_dup
        block.delete("form_json")
        block.delete("hide_in_early_access")
        block
          .fetch("requirements", [])
          .each { |requirement| requirement.delete("form_json") }
        block
      end
    end
  end
end
