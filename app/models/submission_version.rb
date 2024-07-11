class SubmissionVersion < ApplicationRecord
  belongs_to :permit_application

  has_many :revision_requests, dependent: :destroy

  accepts_nested_attributes_for :revision_requests, allow_destroy: true
end
