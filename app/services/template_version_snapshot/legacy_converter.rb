# frozen_string_literal: true

module TemplateVersionSnapshot
  class LegacyConverter
    TEMPLATE_KEYS = %w[
      id
      nickname
      description
      tags
      available_globally
      template_category_id
      template_category
      sort_order
    ].freeze

    def self.call(denormalized_template_json:, requirement_blocks_json:)
      new(
        denormalized_template_json: denormalized_template_json,
        requirement_blocks_json: requirement_blocks_json
      ).call
    end

    def initialize(denormalized_template_json:, requirement_blocks_json:)
      @outline = (denormalized_template_json || {}).deep_stringify_keys
      @blocks = (requirement_blocks_json || {}).deep_stringify_keys
    end

    def call
      snapshot = {
        "schema_version" => Builder::SCHEMA_VERSION,
        "template" => @outline.slice(*TEMPLATE_KEYS),
        "sections" => build_sections,
        "blocks" => strip_generated_fields
      }

      Validator.call(snapshot_json: snapshot)
      snapshot
    end

    private

    def build_sections
      @outline
        .fetch("requirement_template_sections", [])
        .each_with_index
        .map do |section, section_index|
          {
            "id" => section.fetch("id"),
            "name" => section["name"],
            "position" => section_index + 1,
            "blocks" =>
              section
                .fetch("template_section_blocks", [])
                .each_with_index
                .map do |section_block, block_index|
                  requirement_block = section_block.fetch("requirement_block")
                  {
                    "id" => section_block.fetch("id"),
                    "block_id" => requirement_block.fetch("id"),
                    "position" => block_index + 1,
                    "conditional" => section_block["conditional"]
                  }
                end
          }
        end
    end

    def strip_generated_fields
      @blocks.transform_values do |raw_block|
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
