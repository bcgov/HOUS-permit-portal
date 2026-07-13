# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Project activity auditing", type: :model do
  include ActiveSupport::Testing::TimeHelpers

  let(:jurisdiction) { create(:sub_district) }
  let(:reviewer) { create(:user, :review_manager, jurisdiction: jurisdiction) }
  let(:owner) { create(:user, :submitter) }
  let!(:project) do
    create(
      :permit_project,
      owner: owner,
      jurisdiction: jurisdiction,
      state: :queued
    )
  end
  let(:review_collaborator) do
    jurisdiction.collaborators.find_by!(user: reviewer)
  end

  before do
    SiteConfiguration.instance.update!(allow_designated_reviewer: true)
    jurisdiction.update!(allow_designated_reviewer: true)
  end

  def project_audits
    ApplicationAudit.for_permit_project(project.id)
  end

  def permit_project_viewed_at_update_audits
    ApplicationAudit
      .where(
        auditable_type: "PermitProject",
        auditable_id: project.id,
        action: "update"
      )
      .where("audited_changes ? 'viewed_at'")
      .order(:created_at)
  end

  def project_meeting_audits
    project_audits.where(auditable_type: "ProjectMeeting").order(
      :created_at,
      :id
    )
  end

  def stub_project_meeting_notifications
    allow(NotificationService).to receive(
      :publish_project_meeting_submitted_event
    )
    allow(NotificationService).to receive(
      :publish_project_meeting_request_received_event
    )
    allow(NotificationService).to receive(
      :publish_property_information_request_received_event
    )
    allow(NotificationService).to receive(
      :publish_project_meeting_scheduled_event
    )
  end

  it "records project state changes" do
    Audited.audit_class.as_user(reviewer) { project.begin_progress! }

    audit =
      project_audits
        .where(
          auditable_type: "PermitProject",
          auditable_id: project.id,
          action: "update"
        )
        .where("audited_changes ? 'state'")
        .last

    expect(audit.audited_changes["state"]).to eq(
      [PermitProject.states["queued"], PermitProject.states["in_progress"]]
    )
    expect(
      ProjectAuditFormatters::PermitProjectFormatter.new(
        audit,
        reviewer
      ).description
    ).to include("changed project state from Queued to In Progress")
  end

  it "records project reviewer assignment and removal" do
    collaboration = nil

    Audited
      .audit_class
      .as_user(reviewer) do
        collaboration =
          project.assign_project_review_collaborator!(review_collaborator.id)
      end

    assign_audit =
      project_audits.find_by(
        auditable_type: "PermitProjectCollaboration",
        auditable_id: collaboration.id,
        action: "create"
      )
    expect(assign_audit).to be_present

    Audited
      .audit_class
      .as_user(reviewer) do
        project.unassign_project_review_collaborator!(review_collaborator.id)
      end

    unassign_audit =
      project_audits.find_by(
        auditable_type: "PermitProjectCollaboration",
        auditable_id: collaboration.id,
        action: "update"
      )
    expect(unassign_audit.audited_changes).to have_key("discarded_at")
  end

  it "records project read and unread transitions" do
    Audited.audit_class.as_user(reviewer) { project.update_viewed_at }

    read_audit = permit_project_viewed_at_update_audits.last
    expect(read_audit.audited_changes["viewed_at"].first).to be_nil
    expect(read_audit.audited_changes["viewed_at"].last).to be_present
    expect(project_audits).to include(read_audit)

    project.reload
    expect do
      Audited.audit_class.as_user(reviewer) { project.mark_as_unviewed }
    end.to change { permit_project_viewed_at_update_audits.count }.by(1)

    unread_audit = permit_project_viewed_at_update_audits.last
    expect(unread_audit.audited_changes["viewed_at"].first).to be_present
    expect(unread_audit.audited_changes["viewed_at"].last).to be_nil
    expect(project_audits).to include(unread_audit)
  end

  it "does not record an audit when marking an already-read project read again" do
    Audited.audit_class.as_user(reviewer) { project.update_viewed_at }

    read_count = permit_project_viewed_at_update_audits.count

    Audited.audit_class.as_user(reviewer) { project.update_viewed_at }

    expect(permit_project_viewed_at_update_audits.count).to eq(read_count)
  end

  context "with a project meeting" do
    let!(:project_meeting) do
      create(:project_meeting, permit_project: project, requested_by: owner)
    end

    before { stub_project_meeting_notifications }

    it "records lifecycle and scheduling actions in order" do
      start_time = Time.zone.local(2026, 1, 1, 9, 0, 0)

      travel_to(start_time) do
        Audited.audit_class.as_user(owner) { project_meeting.submit_request! }
      end

      project_meeting.reload
      travel_to(start_time + 10.minutes) do
        Audited
          .audit_class
          .as_user(reviewer) do
            project_meeting.assign_attributes(
              contact_method: :phone,
              confirmed_date: 1.week.from_now
            )
            project_meeting.schedule!
          end
      end

      project_meeting.reload
      travel_to(start_time + 20.minutes) do
        Audited
          .audit_class
          .as_user(reviewer) do
            project_meeting.update!(confirmed_date: 2.weeks.from_now)
          end
      end

      project_meeting.reload
      travel_to(start_time + 30.minutes) do
        Audited.audit_class.as_user(reviewer) { project_meeting.complete! }
      end

      audits = project_meeting_audits.to_a

      expect(audits.map(&:associated_type)).to all(eq("PermitProject"))
      expect(audits.map(&:associated_id)).to all(eq(project.id))
      expect(audits.map(&:user)).to eq([owner, reviewer, reviewer, reviewer])
      expect(audits.map(&:created_at)).to eq(
        [
          start_time,
          start_time + 10.minutes,
          start_time + 20.minutes,
          start_time + 30.minutes
        ]
      )
      expect(audits.map(&:audited_changes)).to match(
        [
          a_hash_including("status", "submitted_at"),
          a_hash_including("status", "scheduled_at", "confirmed_date"),
          a_hash_including("confirmed_date"),
          a_hash_including("status", "completed_at")
        ]
      )
    end

    it "records withdrawn meeting requests" do
      Audited.audit_class.as_user(owner) { project_meeting.submit_request! }

      project_meeting.reload
      Audited.audit_class.as_user(owner) { project_meeting.withdraw! }

      withdraw_audit =
        project_meeting_audits.where("audited_changes ? 'withdrawn_at'").last

      expect(withdraw_audit).to be_present
      expect(withdraw_audit.audited_changes["status"]).to eq(
        [ProjectMeeting.statuses["open"], ProjectMeeting.statuses["withdrawn"]]
      )
    end

    it "does not record draft edits or read/unread changes" do
      audit_count = project_meeting_audits.count

      Audited
        .audit_class
        .as_user(owner) do
          project_meeting.update!(meeting_notes: "Updated draft notes")
          project_meeting.update_viewed_at
        end

      expect(project_meeting_audits.count).to eq(audit_count)
    end
  end

  context "with a submitted permit application" do
    let!(:permit_application) do
      create(
        :permit_application,
        :newly_submitted,
        permit_project: project,
        submitter: owner,
        jurisdiction: jurisdiction
      )
    end
    let(:submission_version) { permit_application.latest_submission_version }

    def submission_version_viewed_at_audits
      ApplicationAudit
        .where(
          auditable_type: "SubmissionVersion",
          auditable_id: submission_version.id,
          action: "update"
        )
        .where("audited_changes ? 'viewed_at'")
        .order(:created_at)
    end

    it "records application status changes" do
      Audited.audit_class.as_user(reviewer) { permit_application.start_review! }

      audit =
        ApplicationAudit.find_by(
          auditable_type: "PermitApplication",
          auditable_id: permit_application.id,
          action: "update"
        )

      expect(audit.audited_changes["status"]).to eq(
        [
          PermitApplication.statuses["newly_submitted"],
          PermitApplication.statuses["in_review"]
        ]
      )
    end

    it "records application read and unread transitions" do
      Audited
        .audit_class
        .as_user(reviewer) { permit_application.update_viewed_at }

      read_audit = submission_version_viewed_at_audits.last
      expect(read_audit.audited_changes["viewed_at"].first).to be_nil
      expect(read_audit.audited_changes["viewed_at"].last).to be_present
      expect(project_audits).to include(read_audit)

      expect do
        Audited
          .audit_class
          .as_user(reviewer) { permit_application.mark_as_unviewed }
      end.to change { submission_version_viewed_at_audits.count }.by(1)

      unread_audit = submission_version_viewed_at_audits.last
      expect(unread_audit.audited_changes["viewed_at"].first).to be_present
      expect(unread_audit.audited_changes["viewed_at"].last).to be_nil
      expect(project_audits).to include(unread_audit)
    end

    it "does not record an audit when marking an already-read application read again" do
      Audited
        .audit_class
        .as_user(reviewer) { permit_application.update_viewed_at }

      read_count = submission_version_viewed_at_audits.count

      Audited
        .audit_class
        .as_user(reviewer) { permit_application.update_viewed_at }

      expect(submission_version_viewed_at_audits.count).to eq(read_count)
    end

    it "records application reviewer assignment and removal" do
      collaboration = nil

      Audited
        .audit_class
        .as_user(reviewer) do
          collaboration =
            create(
              :permit_collaboration,
              :review,
              :delegatee,
              permit_application: permit_application,
              collaborator: review_collaborator
            )
        end

      expect(
        ApplicationAudit.find_by(
          auditable_type: "PermitCollaboration",
          auditable_id: collaboration.id,
          action: "create"
        )
      ).to be_present

      Audited.audit_class.as_user(reviewer) { collaboration.discard }

      expect(
        ApplicationAudit.find_by(
          auditable_type: "PermitCollaboration",
          auditable_id: collaboration.id,
          action: "update"
        )
      ).to be_present
    end
  end
end
