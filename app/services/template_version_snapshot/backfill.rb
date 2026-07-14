# frozen_string_literal: true

module TemplateVersionSnapshot
  class Backfill
    Result = Data.define(:backfilled, :verified)

    def self.call(scope: TemplateVersion.all)
      new(scope: scope).call
    end

    def initialize(scope:)
      @scope = scope
    end

    def call
      backfilled = 0

      @scope.find_each do |template_version|
        if template_version.snapshot_json.present?
          Validator.call(
            snapshot_json: template_version.snapshot_json,
            form_json: template_version.form_json
          )
          next
        end

        snapshot = convert(template_version)
        Validator.call(
          snapshot_json: snapshot,
          form_json: template_version.form_json
        )
        template_version.update_columns(snapshot_json: snapshot)
        backfilled += 1
      rescue StandardError => e
        raise e.class,
              "Unable to backfill TemplateVersion #{template_version.id}: #{e.message}"
      end

      Result.new(backfilled: backfilled, verified: @scope.count)
    end

    private

    def convert(template_version)
      LegacyConverter.call(
        denormalized_template_json: template_version.denormalized_template_json,
        requirement_blocks_json: template_version.requirement_blocks_json
      )
    end
  end
end
