class RevisionReason < ApplicationRecord
  include Discard::Model
  belongs_to :site_configuration

  has_many :revision_requests, foreign_key: :reason_code, primary_key: :reason_code

  validates :description, presence: true
  validates :reason_code, presence: true, uniqueness: true

  before_validation :normalize_reason_code

  private

  def normalize_reason_code
    self.reason_code = reason_code.parameterize(separator: "_") if reason_code.present?
  end
end
