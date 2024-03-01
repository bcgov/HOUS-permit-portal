class StepCode::BuildingCharacteristics::Line::Base
  include ActiveModel::Validations

  def initialize(attrs)
    (attrs || []).each do |attr, value|
      next unless fields.include?(attr.to_sym)
      send("#{attr}=", value)
    end
  end

  def self.load(arr)
    (arr || []).map { |item| new(item) }
  end

  def self.dump(arr)
    (arr || []).all? { |item| item.is_a?(self.class) } ? (arr || []).map(&:attributes) : arr || []
  end

  def attributes
    fields.inject({}) do |hash, attr|
      hash[attr] = send(attr)
      hash
    end
  end

  def fields
    raise NotImplementedError, "This method #{__method__} is not implemented"
  end
end
