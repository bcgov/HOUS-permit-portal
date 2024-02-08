class PermitApplication < ApplicationRecord
  searchkick searchable: %i[number permit_classifications submitter submitted_at status jurisdiction_id],
             word_start: %i[number permit_classifications submitter submitted_at status jurisdiction_id]

  belongs_to :submitter, class_name: "User"
  belongs_to :jurisdiction

  belongs_to :permit_type
  belongs_to :activity

  has_many :supporting_documents, dependent: :destroy
  accepts_nested_attributes_for :supporting_documents, allow_destroy: true

  # Custom validation

  validate :submitter_must_have_role
  enum status: { draft: 0, submitted: 1, viewed: 2 }, _default: 0

  delegate :name, to: :jurisdiction, prefix: true
  delegate :code, :name, to: :permit_type, prefix: true
  delegate :code, :name, to: :activity, prefix: true

  before_create :assign_unique_number
  before_save :set_submitted_at, if: :status_changed?

  def search_data
    {
      number: number,
      permit_classifications: "#{permit_type.name} #{activity.name}",
      submitter: "#{submitter.name} #{submitter.email}",
      submitted_at: submitted_at,
      status: status,
      jurisdiction_id: jurisdiction.id,
    }
  end

  #stubs for UI
  def nickname
    "#{jurisdiction_name}: #{full_address || pid || pin || id}"
  end

  def requirements
    #TODO: add versioning for requirement templates, etc.  for now just stub the return of the requirement template to use and its form data
    #need to look up jurisidcitional version and enablement as well
    requirement_template = RequirementTemplate.find_by(activity: activity, permit_type: permit_type)
    requirement_template ? requirement_template.to_form_json : nil
  end

  def number_prefix
    jurisdiction.prefix
  end

  def assign_unique_number
    last_number =
      jurisdiction
        .permit_applications
        .where("number LIKE ?", "#{number_prefix}-%")
        .order(Arel.sql("LENGTH(number) DESC"), number: :desc)
        .limit(1)
        .pluck(:number)
        .first

    if last_number
      number_parts = last_number.split("-")
      sequence_part = number_parts[1..-1].join.to_i + 1 # Increment the sequence
      new_number =
        format(
          "%s-%03d-%03d-%03d",
          number_prefix,
          sequence_part / 1_000_000 % 1000,
          sequence_part / 1000 % 1000,
          sequence_part % 1000,
        )
    else
      # Start with the initial number if there are no previous numbers
      new_number = format("%s-001-000-000", number_prefix)
    end

    # Assign the new number to the permit application
    self.number = new_number
    return new_number
  end

  private

  def set_submitted_at
    # Check if the status changed to 'submitted' and `submitted_at` is nil to avoid overwriting the timestamp.
    self.submitted_at = Time.current if submitted? && submitted_at.nil?
  end

  def submitter_must_have_role
    errors.add(:submitter, "must have the submitter role") unless submitter&.submitter?
  end
end
