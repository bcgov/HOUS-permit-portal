require "rails_helper"

RSpec.describe SupportingDocument, type: :model do
  it { should belong_to(:permit_application) }
end
