# ponytail: default 1-hour duration; add duration field if meetings vary
# METHOD:REQUEST + stable UID + rising SEQUENCE so reschedule emails replace
# the existing calendar item (PUBLISH is ignored as an update by most clients)
class ProjectMeetingIcsGenerator
  DEFAULT_DURATION = 1.hour
  TIME_ZONE = "America/Vancouver"
  PRODID = "-//Building Permit Hub//Project Meeting//EN"
  ORGANIZER_CN = "Building Permit Hub"

  def initialize(project_meeting, hub_meeting_url:, attendee_email:)
    @project_meeting = project_meeting
    @hub_meeting_url = hub_meeting_url
    @attendee_email = attendee_email
  end

  def filename
    number =
      @project_meeting.permit_project&.number.to_s.gsub(/[^a-zA-Z0-9_-]/, "-")
    label = number.presence || @project_meeting.id
    "project-meeting-#{label}.ics"
  end

  def generate
    [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:#{PRODID}",
      "CALSCALE:GREGORIAN",
      "METHOD:REQUEST",
      event_block,
      "END:VCALENDAR"
    ].join("\r\n")
  end

  private

  attr_reader :project_meeting, :hub_meeting_url, :attendee_email

  def event_block
    start_at = project_meeting.confirmed_date.in_time_zone(TIME_ZONE)
    end_at = start_at + DEFAULT_DURATION

    lines = [
      "BEGIN:VEVENT",
      "UID:#{uid}",
      "DTSTAMP:#{utc_timestamp(Time.current)}",
      "DTSTART;TZID=#{TIME_ZONE}:#{local_timestamp(start_at)}",
      "DTEND;TZID=#{TIME_ZONE}:#{local_timestamp(end_at)}",
      "SUMMARY:#{escape(summary)}",
      "DESCRIPTION:#{escape(description)}",
      "ORGANIZER;CN=#{escape(ORGANIZER_CN)}:mailto:#{organizer_email}",
      "ATTENDEE;CN=#{escape(attendee_email)};RSVP=FALSE:mailto:#{attendee_email}",
      "SEQUENCE:#{project_meeting.updated_at.to_i}",
      "STATUS:CONFIRMED"
    ]
    lines << "LOCATION:#{escape(location)}" if location.present?
    if project_meeting.meeting_url.present?
      lines << "URL:#{escape(project_meeting.meeting_url)}"
    end
    lines.concat(["END:VEVENT"])
    lines.join("\r\n")
  end

  def uid
    "project-meeting-#{project_meeting.id}@#{calendar_host}"
  end

  def calendar_host
    Addressable::URI.parse(FrontendUrlHelper.root_url).host ||
      "buildingpermithub.gov.bc.ca"
  end

  def organizer_email
    ENV["FROM_EMAIL"].presence || "no-reply@#{calendar_host}"
  end

  def summary
    number = project_meeting.permit_project&.number
    "Project meeting#{number.present? ? " (#{number})" : ""}"
  end

  def description
    permit_project = project_meeting.permit_project
    parts = []
    if permit_project&.title.present?
      parts << "Project: #{permit_project.title}"
    end
    if permit_project&.number.present?
      parts << "Project number: #{permit_project.number}"
    end
    parts << "Contact method: #{contact_method_label}"
    if project_meeting.meeting_url.present?
      parts << "Meeting link: #{project_meeting.meeting_url}"
    end
    if hub_meeting_url.present?
      parts << "View in Building Permit Hub: #{hub_meeting_url}"
    end
    parts.join("\\n")
  end

  def location
    case project_meeting.contact_method
    when "videoconference"
      project_meeting.meeting_url.presence || "Videoconference"
    when "in_person"
      project_meeting.permit_project&.full_address
    when "phone"
      project_meeting.contact_phone_number.presence || "Phone call"
    end
  end

  def contact_method_label
    case project_meeting.contact_method
    when "phone"
      "Phone"
    when "in_person"
      "In-person meeting"
    when "videoconference"
      "Videoconference"
    else
      project_meeting.contact_method.to_s.humanize
    end
  end

  def escape(value)
    value
      .to_s
      .gsub("\\", "\\\\")
      .gsub(";", "\\;")
      .gsub(",", "\\,")
      .gsub("\n", "\\n")
      .gsub("\r", "")
  end

  def utc_timestamp(time)
    time.utc.strftime("%Y%m%dT%H%M%SZ")
  end

  def local_timestamp(time)
    time.strftime("%Y%m%dT%H%M%S")
  end
end
