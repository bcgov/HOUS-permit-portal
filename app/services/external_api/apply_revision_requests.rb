module ExternalApi
  class ApplyRevisionRequests
    class Error < StandardError
    end

    SYNTHETIC_BLOCK_CODE = "energy_step_code_tool"
    FIELD_ITEM_KEYS = %w[requirement_block_code requirement_code].freeze
    REQUIRED_ITEM_KEYS = %w[
      requirement_block_code
      requirement_code
      reason_code
      comment
    ].freeze
    REQUIRED_DOCUMENT_KEYS = %w[
      name
      reason_code
      comment
      reference_document_ids
    ].freeze
    FINALIZABLE_STATUSES = %w[newly_submitted resubmitted in_review].freeze
    MAX_COMMENT_LENGTH = 350
    CACHE_ID_FORMAT =
      /\A[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[^\/]+\z/i

    def initialize(permit_application, items, applicant_note: nil)
      @permit_application = permit_application
      @items = items
      @applicant_note = applicant_note
    end

    def call
      unless FINALIZABLE_STATUSES.include?(@permit_application.status)
        raise Error,
              "Cannot transition status from '#{@permit_application.status}' to 'revisions_requested'. Available statuses: #{available_status_list}."
      end

      version = @permit_application.latest_submission_version
      if version.blank?
        raise Error,
              "Cannot request revisions because this application has no submission version."
      end

      snapshots =
        normalize_items!.each_with_index.map do |item, index|
          resolve_item(item, index)
        end
      validate_applicant_note!

      version.revision_requests.destroy_all
      snapshots.each { |attrs| version.revision_requests.create!(attrs) }
      Note.upsert_revision_message!(
        submission_version: version,
        kind: :applicant_message,
        body: @applicant_note,
        user: nil
      )
    end

    private

    def validate_applicant_note!
      return if @applicant_note.nil? || @applicant_note.is_a?(String)

      raise Error, "applicant_note must be a string."
    end

    def normalize_items!
      unless @items.is_a?(Array) && @items.any?
        raise Error,
              "revision_requests must be a non-empty array when status is 'revisions_requested'."
      end

      normalized = @items.map { |item| stringify_item(item) }

      mixed =
        normalized.each_with_index.filter_map do |item, index|
          next unless document_request?(item) && field_revision?(item)

          "revision_requests[#{index}] cannot include both field and document request fields"
        end
      raise Error, mixed.join("; ") if mixed.any?

      missing =
        normalized.each_with_index.filter_map do |item, index|
          blank_keys = missing_keys(item)
          next if blank_keys.empty?

          "revision_requests[#{index}] is missing #{blank_keys.join(", ")}"
        end
      raise Error, missing.join("; ") if missing.any?

      too_long =
        normalized.each_with_index.filter_map do |item, index|
          next if document_request?(item)
          next if item["comment"].to_s.length <= MAX_COMMENT_LENGTH

          "revision_requests[#{index}] comment exceeds #{MAX_COMMENT_LENGTH} characters"
        end
      raise Error, too_long.join("; ") if too_long.any?

      pairs =
        normalized.filter_map do |item|
          next if document_request?(item)

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

    def document_request?(item)
      item["name"].to_s.strip.present? || item.key?("reference_document_ids")
    end

    def field_revision?(item)
      FIELD_ITEM_KEYS.any? { |key| item[key].to_s.strip.present? }
    end

    def missing_keys(item)
      if document_request?(item)
        REQUIRED_DOCUMENT_KEYS.select { |key| blank_document_value?(item, key) }
      else
        REQUIRED_ITEM_KEYS.select { |key| item[key].to_s.strip.blank? }
      end
    end

    def blank_document_value?(item, key)
      if key == "reference_document_ids"
        ids = item[key]
        return true unless ids.is_a?(Array)

        ids.empty? || ids.any? { |id| id.to_s.strip.blank? }
      else
        item[key].to_s.strip.blank?
      end
    end

    def resolve_item(item, index)
      return resolve_document_request(item, index) if document_request?(item)

      resolve_field_revision(item)
    end

    def resolve_document_request(item, index)
      reason_code = item["reason_code"].to_s
      unless RevisionReason.kept.exists?(reason_code: reason_code)
        raise Error, "Unknown reason_code '#{reason_code}'."
      end

      ids = item["reference_document_ids"].map(&:to_s).uniq
      files = ids.map { |cache_id| cached_file_data(cache_id, index) }

      {
        type: "SupportingDocumentRevisionRequest",
        title: item["name"].to_s.strip,
        reason_code: reason_code,
        comment: item["comment"].to_s,
        revision_reference_documents_attributes:
          files.map { |file| { file: file } }
      }
    end

    # ponytail: cache ids are unguessable but not bound to the API key.
    # Upgrade: a table with external_api_key_id if a key must not attach another key's upload.
    def cached_file_data(cache_id, index)
      filename = File.basename(cache_id)
      unless cache_id.match?(CACHE_ID_FORMAT) && !filename.start_with?(".") &&
               !FileUploader::BLOCKED_EXTENSIONS.include?(
                 File.extname(filename).delete_prefix(".").downcase
               )
        raise Error, missing_reference_message(index)
      end

      storage = Shrine.storages[:cache]
      unless storage.exists?(cache_id)
        raise Error, missing_reference_message(index)
      end

      io = storage.open(cache_id)
      size = io.respond_to?(:size) ? io.size : io.read.bytesize
      io.rewind if io.respond_to?(:rewind)
      mime = FileUploader.determine_mime_type(io)

      {
        "id" => cache_id,
        "storage" => "cache",
        "metadata" => {
          "filename" => filename,
          "size" => size,
          "mime_type" => mime
        }
      }
    rescue Error
      raise
    rescue StandardError
      raise Error, missing_reference_message(index)
    ensure
      io&.close
    end

    def missing_reference_message(index)
      "revision_requests[#{index}] is missing reference_document_ids"
    end

    def resolve_field_revision(item)
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
        type: "FieldRevisionRequest",
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

    def available_status_list
      Constants::ExternalApi.available_statuses_for(@permit_application).join(
        ", "
      )
    end
  end
end
