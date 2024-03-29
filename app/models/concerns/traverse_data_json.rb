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
          value.each { |item| find_file_fields_and_transform!(item, files, &block) if item.is_a?(Hash) }
        else
          # do nothing for remaining
        end
      end
    end
    files
  end

  #used to take a hash, deeply search and map results back into a key hash
  #block expects a value to be there
  def find_file_fields_and_transform_hash!(hash, files_hash, &block)
    return {} unless hash.present?

    hash.each do |key, value|
      if key.ends_with?("_file")
        files_hash[key] = block.call(key, value) if value.present?
      else
        case value
        when Hash
          # Recursive call if the value is a hash
          find_file_fields_and_transform_hash!(value, files_hash, &block)
        when Array
          # If the value is an array, iterate through its elements
          value.each { |item| find_file_fields_and_transform_hash!(item, files_hash, &block) if item.is_a?(Hash) }
        else
          # do nothing for remaining
        end
      end
    end
    files_hash
  end
end
