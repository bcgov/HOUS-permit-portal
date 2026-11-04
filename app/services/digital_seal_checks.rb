# Readiness and report results for the exact uploads referenced by saved answers.
# Never match by filename or include another application's supporting documents.
class DigitalSealChecks
  class Pending < StandardError
  end

  Entry = Struct.new(:field_key, :upload, :document, keyword_init: true)

  def initialize(application, submission_data: application.submission_data)
    @application = application
    @submission_data = submission_data
  end

  def entries
    @entries ||=
      begin
        keys =
          @application.automated_compliance_requirements_for_module(
            "DigitalSealValidator"
          ).keys
        documents = @application.supporting_documents.where(data_key: keys).to_a
        uploads = []
        collect_uploads(@submission_data&.dig("data"), keys, uploads)
        uploads.map do |key, upload|
          model_id = upload["model_id"] || upload["modelId"]
          document =
            documents.find do |candidate|
              candidate.data_key == key &&
                (model_id.blank? || candidate.id == model_id) &&
                self.class.same_file?(upload["id"], candidate.file_id)
            end
          Entry.new(field_key: key, upload: upload, document: document)
        end
      end
  end

  def self.same_file?(upload_id, stored_id)
    return false unless upload_id.is_a?(String) && stored_id.is_a?(String)
    return false if upload_id.blank? || stored_id.blank?
    upload_id = upload_id.delete_prefix("cache/")
    stored_id = stored_id.delete_prefix("cache/")
    upload_id == stored_id ||
      (!upload_id.include?("/") && upload_id == File.basename(stored_id))
  end

  def self.finished?(document)
    return false unless document
    data = document.compliance_data || {}
    if data["file_id"].present? &&
         !same_file?(data["file_id"], document.file_id)
      return false
    end
    data["status"] == "failed" ||
      (
        data["status"] == "success" && data["result"].is_a?(Array) &&
          data["result"].all? { |signer| signer.is_a?(Hash) }
      )
  end

  def pending_entries
    entries.reject { |entry| self.class.finished?(entry.document) }
  end

  def pending_documents
    pending_entries.filter_map(&:document).uniq(&:id)
  end

  def summary
    {
      pending_count: pending_entries.length,
      failed_count:
        entries.count do |entry|
          self.class.finished?(entry.document) &&
            entry.document.compliance_data["status"] == "failed"
        end
    }
  end

  def snapshot
    if pending_entries.any?
      raise Pending, "Digital seal checks are still running"
    end
    entries
      .group_by(&:field_key)
      .transform_values do |field_entries|
        field_entries.map do |entry|
          document = entry.document
          failed = document.compliance_data["status"] == "failed"
          signers =
            failed ? [] : document.compliance_message_view.fetch("signers")
          {
            "file_id" => entry.upload["id"],
            "model_id" => entry.upload["model_id"] || entry.upload["modelId"],
            "status" =>
              failed ? "failed" : (signers.any? ? "found" : "not_found"),
            "signers" => signers
          }
        end
      end
  end

  private

  def collect_uploads(value, keys, uploads)
    case value
    when Hash
      value.each do |key, child|
        if keys.include?(key)
          files = child.is_a?(Array) ? child : [child]
          files.each do |file|
            uploads << [key, file] if file.is_a?(Hash) && file.present?
          end
        else
          collect_uploads(child, keys, uploads)
        end
      end
    when Array
      value.each { |child| collect_uploads(child, keys, uploads) }
    end
  end
end
