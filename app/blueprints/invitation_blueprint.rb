class InvitationBlueprint < Blueprinter::Base
  field :invited do |hash, _options|
    UserBlueprint.render_as_hash(hash[:invited])
  end

  field :email_taken do |hash, _options|
    UserBlueprint.render_as_hash(hash[:email_taken])
  end
end
