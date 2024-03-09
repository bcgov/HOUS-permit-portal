class StepCode::BuildingCharacteristics::Base
  include ActiveModel::Model

  def initialize(attrs)
    (attrs || []).each do |attr, value|
      next unless fields.include?(attr.to_sym)
      send("#{attr}=", value)
    end
  end

  def self.load(obj)
    new(obj)
  end

  def self.dump(obj)
    obj.is_a?(self.class) ? obj.attributes : obj
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
