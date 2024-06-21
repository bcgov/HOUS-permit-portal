class JurisdictionMembership < ApplicationRecord
  belongs_to :jurisdiction
  belongs_to :user

  after_commit :reindex_jurisdiction, on: %i[create update destroy]

  private

  def reindex_jurisdiction
    jurisdiction.reindex
  end
end
