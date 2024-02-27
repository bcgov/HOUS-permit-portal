class PermitApplication < ApplicationRecord
  searchkick searchable: %i[number nickname permit_classifications submitter status],
             word_start: %i[number nickname permit_classifications submitter status]

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
      nickname: nickname,
      permit_classifications: "#{permit_type.name} #{activity.name}",
      submitter: "#{submitter.name} #{submitter.email}",
      submitted_at: submitted_at,
      status: status,
      jurisdiction_id: jurisdiction.id,
      submitter_id: submitter.id,
    }
  end

  #stubs for UI
  def nickname
    "#{jurisdiction_name}: #{full_address || pid || pin || id}"
  end

  def form_json
    #TODO: add versioning for requirement templates, etc.  for now just stub the return of the requirement template to use and its form data
    #need to look up jurisidcitional version and enablement as well
    jurisdiction.template_form_json(activity, permit_type)
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

    # Notice that the last number comes from the specific jurisdiction

    if last_number
      number_parts = last_number.split("-")
      new_integer = number_parts[1..-1].join.to_i + 1 # Increment the sequence

      # the remainder of dividing any number by 1000 always gives the last 3 digits
      # Removing the last 3 digits (integer division by 1000), then taking the remainder above gives the middle 3
      # Removing the last 6 digits (division), then taking the remainder as above gives the first 3 digits

      # irb(main):008> 123456789 / 1_000
      # => 123456
      # irb(main):010> 123456 % 1000
      # => 456
      # irb(main):009> 123456789 / 1_000_000
      # => 123
      # irb(main):013> 123 % 1000
      # => 123

      # %03d pads with 0s
      new_number =
        format(
          "%s-%03d-%03d-%03d",
          number_prefix,
          new_integer / 1_000_000 % 1000,
          new_integer / 1000 % 1000,
          new_integer % 1000,
        )
    else
      # Start with the initial number if there are no previous numbers
      new_number = format("%s-001-000-000", number_prefix)
    end

    # Assign the new number to the permit application
    self.number = new_number
    return new_number
  end

  def requirements_lookups
    RequirementTemplate.find_by(activity: activity, permit_type: permit_type, status: "published")&.lookup_props
  end

  #TODO: move automated compliance and field empties into concern or service?
  def automated_compliance_requirements
    #check which fields in requirement have custom compliance components
    requirements_lookups.select { |field_id, req| req.computed_compliance? }
  end

  def automated_compliance_unfilled_requirements
    automated_compliance_requirements.select do |field_id, req|
      #TODO: if it is a file field, we check the compliance_data value is set instead
      submission_field_is_empty?(field_id, req)
    end
  end

  def submission_field_is_empty?(field_id, requirement)
    return true if submission_data.blank?
    if requirement.input_options.dig("computed_compliance", "value_on")
      supporting_documents.find_by_id(submission_data.dig("data", field_id, "id"))&.compliance_data.blank?
    else
      submission_data.dig("data", field_id).blank?
    end
  end

  def automated_compliance_unique_unfilled_modules
    automated_compliance_unfilled_requirements
      .values
      .map { |req| req.input_options.dig("computed_compliance", "module") }
      .uniq
  end

  def automated_compliance_requirements_for_module(compliance_module_name)
    automated_compliance_requirements.select do |field_id, req|
      req.input_options.dig("computed_compliance", "module") == compliance_module_name
    end
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
