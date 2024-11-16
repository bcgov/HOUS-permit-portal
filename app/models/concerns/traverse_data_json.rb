module TraverseDataJson
  extend ActiveSupport::Concern

  #used to take a hash, deeply search and flatten the results into a file array
  #block expects an array to be returned
  def find_file_fields_and_transform!(hash, files, &block)
    return {} unless hash.present?

    hash.each do |key, value|
      if key.ends_with?("_file")
        files.concat(block.call(key, value)) if value.present?
      else
        case value
        when Hash
          # Recursive call if the value is a hash
          find_file_fields_and_transform!(value, files, &block)
        when Array
          # If the value is an array, iterate through its elements
          value.each do |item|
            if item.is_a?(Hash)
              find_file_fields_and_transform!(item, files, &block)
            end
          end
        else
          # do nothing for remaining
        end
      end
    end
    files
  end

  def flatten_requirements_from_form_hash(data_hash)
    return [] if data_hash.blank? && data_hash&.dig("components").blank?
    #assume the layering is template containing sections, sections containing blocks, blocks contining requirements
    #requirements may have nesting (like general contact, etc),  but in our purpose we skip this
    #TODO: explore performanc edifference to move this straight into jsonb functions

    data_hash["components"]
      .map do |section_json|
        section_json["components"]
          .map { |blocks_json| blocks_json["components"].flatten }
          .flatten
      end
      .flatten
      .reduce({}) do |obj, requirement|
        obj.merge({ requirement["key"] => requirement })
      end
  end
end
