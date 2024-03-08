class StepCode::BuildingCharacteristics::Validator < ActiveModel::Validator
  def validate(record)
    record.attributes.values.each { |val| validate_attribute(record, val) }
  end

  def validate_attribute(record, val)
    if val.is_a? Array
      val.each { |item| validate_attribute(record, item) }
    elsif val.respond_to? :valid?
      return if val.valid?
      record.errors.merge!(val.errors)
    end
  end
end
