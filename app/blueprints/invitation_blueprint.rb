class InvitationBlueprint < Blueprinter::Base
  field :reinvited do |hash, _options|
    UserBlueprint.render_as_hash(hash[:reinvited], view: :base)
  end

  field :invited do |hash, _options|
    UserBlueprint.render_as_hash(hash[:invited], view: :base)
  end

  field :email_taken do |hash, _options|
    UserBlueprint.render_as_hash(hash[:email_taken], view: :base)
  end
end
