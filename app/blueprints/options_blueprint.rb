class OptionsBlueprint < Blueprinter::Base
  identifier :value do |record, _options|
    record.id
  end

  field :label do |record, _options|
    record.label
  end
end
