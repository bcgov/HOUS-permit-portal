class WorkType < ApplicationRecord
  has_many :permit_applications

  def self.default_work_type_data
    [
      { name: "New Construction" },
      { name: "Addition / Alteration / Renovation" },
      { name: "Site Alterations / Landscaping" },
      { name: "Demolition of Existing Buildings" },
    ]
  end
end
