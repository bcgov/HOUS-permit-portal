# frozen_string_literal: true

require "rails_helper"

RSpec.describe AuditRoleFilter do
  let(:jurisdiction) { create(:sub_district) }
  let(:owner) { create(:user, :submitter) }
  let(:reviewer) { create(:user, :review_manager, jurisdiction: jurisdiction) }
  let(:project) do
    create(
      :permit_project,
      owner: owner,
      jurisdiction: jurisdiction,
      state: :queued
    )
  end
  let(:base_scope) { ApplicationAudit.for_permit_project(project.id) }

  before do
    SiteConfiguration.instance.update!(allow_designated_reviewer: true)
    jurisdiction.update!(allow_designated_reviewer: true)
  end

  def visible_audits_for(user)
    ApplicationAudit.visible_to_role(base_scope, user)
  end

  describe ".visible_to_role for submitters" do
    it "excludes project state and read/unread changes" do
      Audited.audit_class.as_user(reviewer) { project.begin_progress! }
      Audited.audit_class.as_user(reviewer) { project.update_viewed_at }

      state_audit =
        ApplicationAudit
          .where(
            auditable_type: "PermitProject",
            auditable_id: project.id,
            action: "update"
          )
          .where("audited_changes ? 'state'")
          .last
      read_audit =
        ApplicationAudit
          .where(
            auditable_type: "PermitProject",
            auditable_id: project.id,
            action: "update"
          )
          .where("audited_changes ? 'viewed_at'")
          .last

      result = visible_audits_for(owner)

      expect(state_audit).to be_present
      expect(read_audit).to be_present
      expect(result).not_to include(state_audit, read_audit)
    end

    it "still includes permit project create audits that snapshot state and viewed_at" do
      create_audit =
        ApplicationAudit.find_by(
          auditable_type: "PermitProject",
          auditable_id: project.id,
          action: "create"
        )

      expect(create_audit).to be_present
      expect(create_audit.audited_changes).to include("state", "viewed_at")
      expect(visible_audits_for(owner)).to include(create_audit)
    end

    it "still includes other permit project updates" do
      Audited
        .audit_class
        .as_user(owner) { project.update!(title: "Renamed project") }

      title_audit =
        ApplicationAudit
          .where(auditable_type: "PermitProject", auditable_id: project.id)
          .where("audited_changes ? 'title'")
          .last

      expect(visible_audits_for(owner)).to include(title_audit)
    end

    it "excludes project reviewer assignment audits" do
      review_collaborator = jurisdiction.collaborators.find_by!(user: reviewer)
      collaboration = nil

      Audited
        .audit_class
        .as_user(reviewer) do
          collaboration =
            project.assign_project_review_collaborator!(review_collaborator.id)
        end

      assign_audit =
        ApplicationAudit.find_by(
          auditable_type: "PermitProjectCollaboration",
          auditable_id: collaboration.id
        )

      expect(assign_audit).to be_present
      expect(visible_audits_for(owner)).not_to include(assign_audit)
    end

    it "excludes application read/unread audits" do
      permit_application =
        create(
          :permit_application,
          :newly_submitted,
          permit_project: project,
          submitter: owner,
          jurisdiction: jurisdiction
        )

      Audited
        .audit_class
        .as_user(reviewer) { permit_application.update_viewed_at }

      read_audit =
        ApplicationAudit.find_by(
          auditable_type: "SubmissionVersion",
          action: "update"
        )

      expect(read_audit).to be_present
      expect(visible_audits_for(owner)).not_to include(read_audit)
    end
  end

  describe "excluding_redundant_viewed_at_audits" do
    it "hides viewed_at audits where both before and after are timestamps" do
      audit =
        ApplicationAudit.create!(
          auditable: project,
          auditable_type: "PermitProject",
          action: "update",
          audited_changes: {
            "viewed_at" => [1.hour.ago.iso8601, Time.current.iso8601]
          }
        )

      expect(ApplicationAudit.for_permit_project(project.id)).not_to include(
        audit
      )
    end

    it "keeps viewed_at audits for nil to timestamp transitions" do
      audit =
        ApplicationAudit.create!(
          auditable: project,
          auditable_type: "PermitProject",
          action: "update",
          audited_changes: {
            "viewed_at" => [nil, Time.current.iso8601]
          }
        )

      expect(ApplicationAudit.for_permit_project(project.id)).to include(audit)
    end

    it "keeps viewed_at audits for timestamp to nil transitions" do
      audit =
        ApplicationAudit.create!(
          auditable: project,
          auditable_type: "PermitProject",
          action: "update",
          audited_changes: {
            "viewed_at" => [1.hour.ago.iso8601, nil]
          }
        )

      expect(ApplicationAudit.for_permit_project(project.id)).to include(audit)
    end
  end

  describe ".visible_to_role for review staff" do
    it "includes reviewer-only activity" do
      Audited.audit_class.as_user(reviewer) { project.begin_progress! }

      state_audit =
        ApplicationAudit
          .where(auditable_type: "PermitProject", auditable_id: project.id)
          .where("audited_changes ? 'state'")
          .last

      expect(visible_audits_for(reviewer)).to include(state_audit)
    end
  end
end
