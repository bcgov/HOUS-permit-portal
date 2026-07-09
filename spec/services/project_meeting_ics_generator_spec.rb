require "rails_helper"

RSpec.describe ProjectMeetingIcsGenerator do
  subject(:generator) do
    described_class.new(
      project_meeting,
      hub_meeting_url: "http://example.test/projects/1/meetings/2"
    )
  end

  let(:project_meeting) do
    create(
      :project_meeting,
      :scheduled,
      contact_method: :videoconference,
      confirmed_date: Time.zone.parse("2026-01-20 09:30"),
      meeting_url: "https://example.com/meeting"
    )
  end

  before do
    allow(FrontendUrlHelper).to receive(:root_url).and_return(
      "http://example.test/"
    )
  end

  describe "#filename" do
    it "uses the project number in the filename" do
      expect(generator.filename).to eq(
        "project-meeting-#{project_meeting.permit_project.number}.ics"
      )
    end
  end

  describe "#generate" do
    let(:ics) { generator.generate }

    it "returns a valid iCalendar document" do
      expect(ics).to include("BEGIN:VCALENDAR")
      expect(ics).to include("BEGIN:VEVENT")
      expect(ics).to include("END:VEVENT")
      expect(ics).to include("END:VCALENDAR")
    end

    it "includes the meeting time in Vancouver time" do
      expect(ics).to include("DTSTART;TZID=America/Vancouver:20260120T093000")
      expect(ics).to include("DTEND;TZID=America/Vancouver:20260120T103000")
    end

    it "uses a stable UID for the meeting" do
      expect(ics).to include(
        "UID:project-meeting-#{project_meeting.id}@example.test"
      )
    end

    it "includes the videoconference link as the location" do
      expect(ics).to include("LOCATION:https://example.com/meeting")
    end

    it "includes the hub meeting URL in the description" do
      expect(ics).to include(
        "View in Building Permit Hub: http://example.test/projects/1/meetings/2"
      )
    end
  end
end
