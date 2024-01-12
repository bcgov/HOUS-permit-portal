class PermitApplication < ApplicationRecord
  belongs_to :submitter, class_name: "User"
  belongs_to :jurisdiction

  belongs_to :permit_type
  belongs_to :activity

  # Custom validation
  validate :submitter_must_have_role
  enum status: { draft: 0, submitted: 1, viewed: 2 }, _default: 0

  delegate :name, to: :jurisdiction, prefix: true
  delegate :code, :name, to: :permit_type, prefix: true
  delegate :code, :name, to: :activity, prefix: true

  #stubs for UI
  alias number id
  def nickname
    "#{jurisdiction_name} - #{id}"
  end

  def requirements
    #TODO: add versioning for requirement templates, etc.  for now just stub the return of the requirement template to use and its form data
    #need to look up jurisidcitional version and enablement as well
    requirement_template = RequirementTemplate.find_by(activity: activity, permit_type: permit_type)
    requirement_template ? requirement_template.to_form_json : nil
  end

  private

  def submitter_must_have_role
    errors.add(:submitter, "must have the submitter role") unless submitter&.submitter?
  end
end
