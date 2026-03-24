# frozen_string_literal: true

require "rails_helper"

RSpec.describe ProjectAuditPolicy do
  describe "Scope#resolve" do
    let(:jurisdiction) { create(:sub_district) }
    let(:owner) { create(:user, :submitter) }
    let(:project) do
      create(:permit_project, owner: owner, jurisdiction: jurisdiction)
    end

    let(:scope_relation) { ApplicationAudit.for_permit_project(project.id) }

    def resolved_scope_for(user, sandbox: nil)
      user_context = UserContext.new(user, sandbox)
      described_class::Scope.new(user_context, scope_relation).resolve
    end

    context "when user is a submitter (project owner)" do
      let(:user) { owner }

      it "includes project and permit application audits" do
        create(
          :permit_application,
          permit_project: project,
          submitter: owner,
          jurisdiction: jurisdiction
        )
        result = resolved_scope_for(user).to_a
        project_audit =
          ApplicationAudit.find_by(
            auditable_type: "PermitProject",
            auditable_id: project.id
          )
        pa_audit =
          ApplicationAudit.find_by(
            auditable_type: "PermitApplication",
            auditable_id: project.permit_applications.first.id
          )
        expect(result).to include(project_audit, pa_audit)
      end

      it "includes submission collaboration audits" do
        pa =
          create(
            :permit_application,
            permit_project: project,
            submitter: owner,
            jurisdiction: jurisdiction
          )
        collab =
          create(:collaborator, user: create(:user), collaboratorable: owner)
        submission_collab =
          create(
            :permit_collaboration,
            permit_application: pa,
            collaborator: collab,
            collaboration_type: :submission
          )
        result = resolved_scope_for(user)
        audit =
          ApplicationAudit.find_by(
            auditable_type: "PermitCollaboration",
            auditable_id: submission_collab.id
          )
        expect(audit).to be_present
        expect(result).to include(audit)
      end

      it "excludes review collaboration audits" do
        submitted_pa =
          create(
            :permit_application,
            :newly_submitted,
            permit_project: project,
            submitter: owner,
            jurisdiction: jurisdiction
          )
        review_user = create(:user, :review_manager, jurisdiction: jurisdiction)
        review_collab = jurisdiction.collaborators.find_by!(user: review_user)
        review_permit_collab =
          create(
            :permit_collaboration,
            :review,
            permit_application: submitted_pa,
            collaborator: review_collab
          )
        result = resolved_scope_for(user)
        audit =
          ApplicationAudit.find_by(
            auditable_type: "PermitCollaboration",
            auditable_id: review_permit_collab.id
          )
        expect(audit).to be_present
        expect(result).not_to include(audit)
      end

      it "includes permit block status audits" do
        pa =
          create(
            :permit_application,
            permit_project: project,
            submitter: owner,
            jurisdiction: jurisdiction
          )
        block_status = create(:permit_block_status, permit_application: pa)
        result = resolved_scope_for(user)
        audit =
          ApplicationAudit.find_by(
            auditable_type: "PermitBlockStatus",
            auditable_id: block_status.id
          )
        expect(audit).to be_present
        expect(result).to include(audit)
      end
    end

    context "when user is review staff" do
      let(:user) { create(:user, :review_manager, jurisdiction: jurisdiction) }

      before do
        # Give review staff access to the project's audits via a submitted app
        # (they see the project's activity in reviewer context)
        create(
          :permit_application,
          :newly_submitted,
          permit_project: project,
          submitter: owner,
          jurisdiction: jurisdiction
        )
        review_collab = jurisdiction.collaborators.find_by!(user: user)
        create(
          :permit_collaboration,
          :review,
          permit_application: project.permit_applications.submitted.last,
          collaborator: review_collab
        )
      end

      it "includes project and permit application audits" do
        result = resolved_scope_for(user).to_a
        project_audit =
          ApplicationAudit.find_by(
            auditable_type: "PermitProject",
            auditable_id: project.id
          )
        pa_audit =
          ApplicationAudit.find_by(
            auditable_type: "PermitApplication",
            auditable_id: project.permit_applications.submitted.last.id
          )
        expect(result).to include(project_audit, pa_audit)
      end

      it "includes review collaboration audits" do
        result = resolved_scope_for(user)
        review_audit =
          ApplicationAudit.find_by(
            auditable_type: "PermitCollaboration",
            auditable_id:
              PermitCollaboration.where(collaboration_type: :review).pick(:id)
          )
        expect(review_audit).to be_present
        expect(result).to include(review_audit)
      end

      it "excludes submission collaboration audits" do
        pa =
          create(
            :permit_application,
            permit_project: project,
            submitter: owner,
            jurisdiction: jurisdiction,
            template_version:
              create(
                :template_version,
                requirement_blocks_json: {
                  "block-1" => {
                    "name" => "Foundation"
                  }
                }
              )
          )
        collab =
          create(:collaborator, user: create(:user), collaboratorable: owner)
        submission_collab =
          create(
            :permit_collaboration,
            :assignee,
            permit_application: pa,
            collaborator: collab,
            collaborator_type: :assignee,
            collaboration_type: :submission,
            assigned_requirement_block_id: "block-1"
          )
        result = resolved_scope_for(user)
        audit =
          ApplicationAudit.find_by(
            auditable_type: "PermitCollaboration",
            auditable_id: submission_collab.id
          )
        expect(audit).to be_present
        expect(result).not_to include(audit)
      end

      it "includes designated submitter (delegatee) submission collaboration audits" do
        pa =
          create(
            :permit_application,
            permit_project: project,
            submitter: owner,
            jurisdiction: jurisdiction
          )
        collab =
          create(:collaborator, user: create(:user), collaboratorable: owner)
        submission_collab =
          create(
            :permit_collaboration,
            permit_application: pa,
            collaborator: collab,
            collaboration_type: :submission,
            collaborator_type: :delegatee
          )

        result = resolved_scope_for(user)

        audit =
          ApplicationAudit.find_by(
            auditable_type: "PermitCollaboration",
            auditable_id: submission_collab.id
          )
        expect(audit).to be_present
        expect(result).to include(audit)
      end

      it "excludes permit block status audits" do
        pa =
          create(
            :permit_application,
            permit_project: project,
            submitter: owner,
            jurisdiction: jurisdiction
          )
        block_status = create(:permit_block_status, permit_application: pa)
        result = resolved_scope_for(user)
        audit =
          ApplicationAudit.find_by(
            auditable_type: "PermitBlockStatus",
            auditable_id: block_status.id
          )
        expect(audit).to be_present
        expect(result).not_to include(audit)
      end
    end

    context "when user has neither submitter nor review_staff role but has project access" do
      %i[technical_support super_admin].each do |role|
        it "includes designated submitter collaborations for #{role} (excludes other collaborations and block status)" do
          other_role_user = create(:user, role: role)
          other_project =
            create(
              :permit_project,
              owner: other_role_user,
              jurisdiction: jurisdiction
            )

          pa =
            create(
              :permit_application,
              permit_project: other_project,
              submitter: create(:user, :submitter),
              jurisdiction: jurisdiction
            )

          submission_collaborator_user = create(:user, :submitter)
          collab =
            create(
              :collaborator,
              user: submission_collaborator_user,
              collaboratorable: other_role_user
            )
          create(
            :permit_collaboration,
            permit_application: pa,
            collaborator: collab,
            collaboration_type: :submission
          )
          create(:permit_block_status, permit_application: pa)

          scope = ApplicationAudit.for_permit_project(other_project.id)
          user_context = UserContext.new(other_role_user, nil)
          result = described_class::Scope.new(user_context, scope).resolve

          audit_types = result.map(&:auditable_type).uniq
          expect(audit_types).to include(
            "PermitProject",
            "PermitApplication",
            "PermitCollaboration"
          )

          expect(result.map(&:auditable_type)).not_to include(
            "PermitBlockStatus"
          )
        end
      end
    end
  end
end
