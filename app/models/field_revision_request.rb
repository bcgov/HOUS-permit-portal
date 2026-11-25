class FieldRevisionRequest < RevisionRequest
  validates :requirement_json, presence: true
  validates :reason_code, presence: true
  validates :comment, length: { maximum: 350 }, allow_blank: true
end
