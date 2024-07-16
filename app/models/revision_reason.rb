class RevisionReason < ApplicationRecord
  include Discard::Model
  belongs_to :site_configuration

  has_many :revision_requests, foreign_key: :reason_code, primary_key: :reason_code
end
