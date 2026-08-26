require "rails_helper"

RSpec.describe Note, type: :model do
  describe "associations" do
    it { is_expected.to belong_to(:user) }
    it { is_expected.to belong_to(:permit_project) }
    it { is_expected.to belong_to(:noteable) }
  end

  describe "validations" do
    it { is_expected.to validate_presence_of(:body) }

    it "allows project meetings as noteable records" do
      note = build(:note, noteable: build(:project_meeting, :open))

      expect(note).to be_valid
    end

    it "blocks unsupported noteable types" do
      note = build(:note, noteable: build(:permit_project))

      expect(note).not_to be_valid
      expect(note.errors[:noteable_type]).to be_present
    end
  end

  it "updates the project meeting notes counter" do
    meeting = create(:project_meeting, :open)

    expect { create(:note, noteable: meeting) }.to change {
      meeting.reload.notes_count
    }.from(0).to(1)
  end

  it "captures the permit project from the noteable record" do
    meeting = create(:project_meeting, :open)

    note = create(:note, noteable: meeting)

    expect(note.permit_project).to eq(meeting.permit_project)
  end

  it "requires the permit project to match the noteable record" do
    meeting = create(:project_meeting, :open)
    other_project = create(:permit_project)
    note = build(:note, noteable: meeting, permit_project: other_project)

    expect(note).not_to be_valid
    expect(note.errors[:permit_project]).to be_present
  end
end
