class SubmissionContactBlueprint < Blueprinter::Base
  identifier :id
  fields :email, :title, :confirmed_at, :confirmation_sent_at, :type
end
