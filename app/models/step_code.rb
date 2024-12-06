class StepCode < ApplicationRecord
  belongs_to :permit_application, optional: true

  delegate :number, to: :permit_application, prefix: :building_permit
  delegate :submitter,
           :jurisdiction_name,
           :full_address,
           :pid,
           to: :permit_application,
           allow_nil: true

  def builder
    "" #replace with a config on permit application
  end
end
