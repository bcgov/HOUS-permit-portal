class PhoneValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, value)
    unless Phonelib.valid?(value)
      record.errors.add(
        attribute,
        (options[:message] || "is not a valid phone number")
      )
    end
  end
end
