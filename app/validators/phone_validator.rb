class PhoneValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, value)
    record.errors.add(attribute, (options[:message] || "is not a valid phone number")) unless Phonelib.valid?(value)
  end
end
