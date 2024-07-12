class RevisionReason < ApplicationRecord
  include Discard::Model
  belongs_to :site_configuration

  has_many :revision_requests, foreign_key: :revision_code, primary_key: :reason_code

  def self.all_with_discarded
    self.with_discarded.map { |record| record.attributes.merge(discarded: record.discarded?) }
  end
end
