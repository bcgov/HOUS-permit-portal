module ExternalApi
  class ApplyRevisionRequests
    class Error < StandardError
    end

    SYNTHETIC_BLOCK_CODE = "energy_step_code_tool"
    REQUIRED_ITEM_KEYS = %w[
      requirement_block_code
      requirement_code
      reason_code
      comment
    ].freeze
    FINALIZABLE_STATUSES = %w[newly_submitted resubmitted in_review].freeze
    MAX_COMMENT_LENGTH = 350

    def initialize(permit_application, items)
      @permit_application = permit_application
      @items = items
    end

    def call
      unless FINALIZABLE_STATUSES.include?(@permit_application.status)
        raise Error,
              "Cannot transition status from '#{@permit_application.status}' to 'revisions_requested'. Allowed partner status codes: #{partner_writable_statuses}."
      end

      version = @permit_application.latest_submission_version
      if version.blank?
        raise Error,
              "Cannot request revisions because this application has no submission version."
      end

      snapshots = normalize_items!.map { |item| resolve_item(item) }

      version.revision_requests.destroy_all
      snapshots.each { |attrs| version.revision_requests.create!(attrs) }
    end

    private

    def normalize_items!
      unless @items.is_a?(Array) && @items.any?
        raise Error,
              "revision_requests must be a non-empty array when status is 'revisions_requested'."
      end

      normalized = @items.map { |item| stringify_item(item) }

      missing =
        normalized.each_with_index.filter_map do |item, index|
          blank_keys =
            REQUIRED_ITEM_KEYS.select { |key| item[key].to_s.strip.blank? }
          next if blank_keys.empty?

          "revision_requests[#{index}] is missing #{blank_keys.join(", ")}"
        end
      raise Error, missing.join("; ") if missing.any?

      too_long =
        normalized.each_with_index.filter_map do |item, index|
          next if item["comment"].to_s.length <= MAX_COMMENT_LENGTH

          "revision_requests[#{index}] comment exceeds #{MAX_COMMENT_LENGTH} characters"
        end
      raise Error, too_long.join("; ") if too_long.any?

      pairs =
        normalized.map do |item|
          [item["requirement_block_code"], item["requirement_code"]]
        end
      if pairs.uniq.length != pairs.length
        raise Error,
              "revision_requests contains duplicate requirement_block_code and requirement_code pairs."
      end

      normalized
    end

    def stringify_item(item)
      hash =
        if item.respond_to?(:to_unsafe_h)
          item.to_unsafe_h
        elsif item.is_a?(Hash)
          item
        else
          raise Error, "Each revision request must be an object."
        end

      hash.stringify_keys
    end

    def resolve_item(item)
      block_code = item["requirement_block_code"].to_s
      requirement_code = item["requirement_code"].to_s
      reason_code = item["reason_code"].to_s
      comment = item["comment"].to_s

      if block_code == SYNTHETIC_BLOCK_CODE
        raise Error, "Unknown requirement_block_code '#{block_code}'."
      end

      unless RevisionReason.kept.exists?(reason_code: reason_code)
        raise Error, "Unknown reason_code '#{reason_code}'."
      end

      requirement = find_requirement(block_code, requirement_code)
      form_json = requirement["form_json"]
      unless form_json.is_a?(Hash)
        raise Error,
              "Could not snapshot requirement '#{block_code}' / '#{requirement_code}'."
      end

      {
        reason_code: reason_code,
        comment: comment,
        requirement_json: form_json,
        submission_data: snapshot_submission_data(form_json["key"])
      }
    end

    def find_requirement(block_code, requirement_code)
      blocks = @permit_application.template_version.requirement_blocks_json
      unless blocks.is_a?(Hash)
        raise Error, "Unknown requirement_block_code '#{block_code}'."
      end

      block =
        blocks.values.find do |candidate|
          candidate.is_a?(Hash) && candidate["sku"] == block_code
        end

      unless block
        raise Error, "Unknown requirement_block_code '#{block_code}'."
      end

      requirement =
        Array(block["requirements"]).find do |candidate|
          candidate.is_a?(Hash) &&
            candidate["requirement_code"] == requirement_code
        end

      unless requirement
        raise Error,
              "Unknown requirement_code '#{requirement_code}' for requirement_block_code '#{block_code}'."
      end

      requirement
    end

    def snapshot_submission_data(requirement_key)
      return {} if requirement_key.blank?

      sections =
        @permit_application.latest_submission_version.submission_data&.dig(
          "data"
        )
      return {} unless sections.is_a?(Hash)

      ending = requirement_key.to_s.split("|RB").last
      sections.each_value do |section|
        next unless section.is_a?(Hash)

        if section.key?(requirement_key)
          return { "data" => { requirement_key => section[requirement_key] } }
        end

        match =
          section.find { |key, _value| key.to_s.split("|RB").last == ending }
        return { "data" => { match[0] => match[1] } } if match
      end

      {}
    end

    def partner_writable_statuses
      Constants::ExternalApi::PARTNER_WRITABLE_APPLICATION_STATUSES.join(", ")
    end
  end
end
