# frozen_string_literal: true

module TemplateVersionSnapshot
  class Validator
    FORM_JSON_NOT_PROVIDED = Object.new.freeze

    def self.call(snapshot_json:, form_json: FORM_JSON_NOT_PROVIDED)
      new(snapshot_json: snapshot_json, form_json: form_json).call
    end

    def initialize(snapshot_json:, form_json:)
      @snapshot =
        snapshot_json.is_a?(Hash) ? snapshot_json.deep_stringify_keys : {}
      @form_json = form_json
    end

    def call
      validate_shape!
      validate_references!
      validate_ids!
      validate_compiled_form! unless @form_json.equal?(FORM_JSON_NOT_PROVIDED)
      true
    end

    private

    def validate_shape!
      unless @snapshot["schema_version"] == Builder::SCHEMA_VERSION
        raise ArgumentError,
              "Unsupported snapshot schema: #{@snapshot["schema_version"].inspect}"
      end
      unless @snapshot["template"].is_a?(Hash) &&
               @snapshot["sections"].is_a?(Array) &&
               @snapshot["blocks"].is_a?(Hash)
        raise ArgumentError,
              "Snapshot v1 must contain template, sections, and blocks"
      end
    end

    def validate_references!
      placement_block_ids =
        @snapshot
          .fetch("sections")
          .flat_map do |section|
            section.fetch("blocks").map { |block| block.fetch("block_id") }
          end
          .uniq
      missing_block_ids = placement_block_ids - @snapshot.fetch("blocks").keys
      return if missing_block_ids.empty?

      raise ArgumentError,
            "Snapshot placements reference missing blocks: #{missing_block_ids.join(", ")}"
    end

    def validate_ids!
      mismatched_block_ids =
        @snapshot
          .fetch("blocks")
          .filter_map do |block_id, block|
            block_id unless block["id"].to_s == block_id
          end
      if mismatched_block_ids.any?
        raise ArgumentError,
              "Snapshot block map keys do not match block IDs: #{mismatched_block_ids.join(", ")}"
      end

      duplicate_requirement_ids =
        requirement_ids.tally.select { |_id, count| count > 1 }.keys
      return if duplicate_requirement_ids.empty?

      raise ArgumentError,
            "Snapshot contains duplicate requirements: #{duplicate_requirement_ids.join(", ")}"
    end

    def validate_compiled_form!
      unless @form_json.is_a?(Hash)
        raise ArgumentError, "Compiled form must be a JSON object"
      end

      missing_requirement_ids =
        requirement_ids.uniq - collect_component_ids(@form_json)
      return if missing_requirement_ids.empty?

      raise ArgumentError,
            "Compiled form is missing snapshot requirements: #{missing_requirement_ids.join(", ")}"
    end

    def requirement_ids
      @requirement_ids ||=
        @snapshot
          .fetch("blocks")
          .values
          .flat_map do |block|
            block
              .fetch("requirements", [])
              .map { |requirement| requirement.fetch("id") }
          end
    end

    def collect_component_ids(value, ids = [])
      case value
      when Hash
        ids << value["id"] if value["id"].present?
        value.each_value { |child| collect_component_ids(child, ids) }
      when Array
        value.each { |child| collect_component_ids(child, ids) }
      end

      ids
    end
  end
end
