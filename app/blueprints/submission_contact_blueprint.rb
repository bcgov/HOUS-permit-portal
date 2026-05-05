class SubmissionContactBlueprint < Blueprinter::Base
  identifier :id
  fields :email, :title, :confirmed_at, :default, :confirmation_sent_at
end
