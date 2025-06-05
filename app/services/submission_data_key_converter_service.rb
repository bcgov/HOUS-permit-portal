class SubmissionDataKeyConverterService
  KEY_MAP = {
    "original_name" => "originalName",
    "model_id" => "modelId",
    "group_id" => "groupId",
    "group_permissions" => "groupPermissions"
  }.freeze

  def self.call
    new.perform
  end

  def perform
    updated_count = 0
    failed_records = []
    processed_count = 0

    PermitApplication.find_each do |pa|
      processed_count += 1
      original_submission_data = pa.submission_data
      next if original_submission_data.blank?

      changed_in_this_pa = { value: false }

      current_data_for_processing = original_submission_data.deep_dup

      new_submission_data =
        recursive_key_converter(
          current_data_for_processing,
          KEY_MAP,
          changed_in_this_pa
        )

      if changed_in_this_pa[:value]
        pa.submission_data = new_submission_data
        begin
          pa.save!
          updated_count += 1
        rescue ActiveRecord::RecordInvalid => e
          Rails.logger.error "Failed to update PermitApplication ID: #{pa.id}. Errors: #{e.message}"
          failed_records << { id: pa.id, error: e.message }
        end
      end
    end

    {
      processed_count: processed_count,
      updated_count: updated_count,
      failed_records: failed_records
    }
  end

  private

  def file_like_object?(data)
    return false unless data.is_a?(Hash)

    string_keyed_data = data.stringify_keys

    string_keyed_data.key?("storage") && string_keyed_data.key?("id") &&
      string_keyed_data.key?("size") && string_keyed_data.key?("type") &&
      (
        string_keyed_data.key?("filename") ||
          string_keyed_data.key?("original_name") ||
          string_keyed_data.key?("originalName")
      )
  end

  def recursive_key_converter(current_data, key_map, changed_flag_wrapper)
    if current_data.is_a?(Hash)
      current_data_string_keys = current_data.stringify_keys
      new_hash = {}
      current_data_string_keys.each_pair do |key, value|
        new_hash[key] = recursive_key_converter(
          value,
          key_map,
          changed_flag_wrapper
        )
      end
      return new_hash
    elsif current_data.is_a?(Array)
      return(
        current_data.map do |item|
          if file_like_object?(item)
            transformed_item = item.stringify_keys
            item_was_changed = false
            key_map.each do |snake_key, camel_key|
              if transformed_item.key?(snake_key)
                if !transformed_item.key?(camel_key) ||
                     transformed_item[snake_key] != transformed_item[camel_key]
                  transformed_item[camel_key] = transformed_item.delete(
                    snake_key
                  )
                  item_was_changed = true
                elsif transformed_item.key?(camel_key) &&
                      transformed_item[snake_key] == transformed_item[camel_key]
                  transformed_item.delete(snake_key)
                  item_was_changed = true
                end
              end
            end
            changed_flag_wrapper[:value] = true if item_was_changed
            transformed_item
          else
            recursive_key_converter(item, key_map, changed_flag_wrapper)
          end
        end
      )
    else
      return current_data
    end
  end
end
