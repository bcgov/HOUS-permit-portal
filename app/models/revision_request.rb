class RevisionRequest < ApplicationRecord
  belongs_to :permit_application

  enum reason_code: {
         non_compliant: 0,
         conflicting_inaccurate: 1,
         insufficient_detail: 2,
         incorrect_format: 3,
         missing_documentation: 4,
         outdated: 5,
         inapplicable: 6,
         missing_signatures: 7,
         incorrect_calculations: 8,
         other: 9,
       },
       _default: 0
end
