require "rails_helper"

RSpec.describe OverheatingTool, type: :model do
  it { should belong_to(:user) }
  it { should validate_presence_of(:user_id) }
  it { should validate_presence_of(:form_json) }
  it { should have_many(:overheating_documents).dependent(:destroy) }
end
