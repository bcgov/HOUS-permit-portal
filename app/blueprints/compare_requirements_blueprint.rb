class CompareRequirementsBlueprint < Blueprinter::Base
  field :added do |comparison|
    comparison[:added]
  end

  field :removed do |comparison|
    comparison[:removed]
  end

  field :changed do |comparison|
    comparison[:changed]
  end
end
