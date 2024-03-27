class SiteConfiguration < ApplicationRecord
  # Ensures that only one SiteConfiguration record can be created
  before_create :ensure_single_record

  def self.instance
    first_or_create
  end

  private

  # A private method to ensure only one record exists
  def ensure_single_record
    throw :abort if SiteConfiguration.count > 0
  end
end
