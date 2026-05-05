require "rails_helper"

RSpec.describe PermitApplicationPolicy do
  subject do
    described_class.new(
      UserContext.new(user, sandbox),
      draft_permit_application
    )
  end

  let(:resolved_scope) do
    described_class::Scope.new(
      UserContext.new(user, sandbox),
      PermitApplication.all
    ).resolve
  end

  let!(:user) { FactoryBot.create(:user) }
  let!(:submitter) { FactoryBot.create(:user, :submitter) }
  let!(:jurisdiction) { FactoryBot.create(:sub_district) }
  let!(:sandbox) { jurisdiction.sandboxes.first }

  let!(:draft_permit_application) do
    FactoryBot.create(
      :permit_application,
      submitter: submitter,
      jurisdiction: jurisdiction,
      sandbox: sandbox
    )
  end

  context "for a submitter" do
    let(:user) { submitter }

    it "permits show" do
      expect(subject.show?).to be true
    end

    it "permits create when under a project owned by the submitter" do
      expect(subject.create?).to be true
    end

    it "permits update" do
      expect(subject.update?).to be true
    end

    it "permits submit" do
      expect(subject.submit?).to be true
    end

    it "only includes own permit applications in scope" do
      other_user_application =
        FactoryBot.create(
          :permit_application,
          jurisdiction: jurisdiction,
          sandbox: sandbox
        )
      expect(resolved_scope).to include(draft_permit_application)
      expect(resolved_scope).not_to include(other_user_application)
    end
  end

  describe "additional permissions" do
    let(:user) { submitter }

    it "permits mark_as_viewed? only for review staff" do
      expect(subject.mark_as_viewed?).to be false

      reviewer = create(:user, :review_manager, jurisdiction:)
      policy =
        described_class.new(
          UserContext.new(reviewer, sandbox),
          draft_permit_application
        )
      expect(policy.mark_as_viewed?).to be true
    end

    it "show? permits submission collaborator" do
      record = draft_permit_application
      allow(record).to receive(:collaborator?).and_return(true)
      policy = described_class.new(UserContext.new(user, sandbox), record)
      expect(policy.show?).to be true
    end

    it "show? permits review staff only for non-draft records in same sandbox" do
      reviewer = create(:user, :review_manager, jurisdiction:)
      record =
        double(
          "PermitApplication",
          submitter: submitter,
          collaborator?: false,
          jurisdiction: jurisdiction,
          jurisdiction_id: jurisdiction.id,
          new_draft?: false,
          sandbox: sandbox
        )
      policy = described_class.new(UserContext.new(reviewer, sandbox), record)
      expect(policy.show?).to be true

      record2 =
        double(
          "PermitApplication",
          submitter: submitter,
          collaborator?: false,
          jurisdiction: jurisdiction,
          jurisdiction_id: jurisdiction.id,
          new_draft?: true,
          sandbox: sandbox
        )
      policy2 = described_class.new(UserContext.new(reviewer, sandbox), record2)
      expect(policy2.show?).to be false
    end

    it "update? denies discarded records" do
      record = double("PermitApplication", discarded?: true)
      policy = described_class.new(UserContext.new(user, sandbox), record)
      expect(policy.update?).to be false
    end

    it "update? permits draft when edit permissions present" do
      record =
        double(
          "PermitApplication",
          discarded?: false,
          draft?: true,
          submission_requirement_block_edit_permissions: [:all]
        )
      allow(record).to receive(
        :submission_requirement_block_edit_permissions
      ).with(user_id: user.id).and_return([SecureRandom.uuid])

      policy = described_class.new(UserContext.new(user, sandbox), record)
      expect(policy.update?).to be true
    end

    it "update? permits submitted for review staff members" do
      reviewer = create(:user, :review_manager, jurisdiction:)
      record =
        double(
          "PermitApplication",
          discarded?: false,
          draft?: false,
          jurisdiction_id: jurisdiction.id
        )
      policy = described_class.new(UserContext.new(reviewer, sandbox), record)
      expect(policy.update?).to be true
    end

    it "retrigger_submission_webhook? requires submitted? and update?" do
      record =
        double(
          "PermitApplication",
          submitted?: true,
          discarded?: false,
          draft?: true
        )
      allow(record).to receive(
        :submission_requirement_block_edit_permissions
      ).and_return([1])

      policy = described_class.new(UserContext.new(user, sandbox), record)
      expect(policy.retrigger_submission_webhook?).to be true

      allow(record).to receive(:submitted?).and_return(false)
      expect(policy.retrigger_submission_webhook?).to be false
    end

    it "download_application_json? permits review staff for non-draft records in the same sandbox" do
      reviewer = create(:user, :review_manager, jurisdiction:)
      record =
        double(
          "PermitApplication",
          jurisdiction_id: jurisdiction.id,
          new_draft?: false,
          sandbox: sandbox
        )

      policy = described_class.new(UserContext.new(reviewer, sandbox), record)
      expect(policy.download_application_json?).to be true

      submitter_policy =
        described_class.new(UserContext.new(submitter, sandbox), record)
      expect(submitter_policy.download_application_json?).to be false
    end

    it "update_version? permits draft submitter or designated submitter" do
      designated = create(:user, :submitter)
      record = double("PermitApplication", draft?: true, submitter: submitter)
      allow(record).to receive(:users_by_collaboration_options).and_return(
        [designated]
      )

      expect(
        described_class.new(
          UserContext.new(submitter, sandbox),
          record
        ).update_version?
      ).to be true
      expect(
        described_class.new(
          UserContext.new(designated, sandbox),
          record
        ).update_version?
      ).to be true
      expect(
        described_class.new(
          UserContext.new(create(:user), sandbox),
          record
        ).update_version?
      ).to be false
    end

    it "update_revision_requests? permits only for review staff and submitted records" do
      reviewer = create(:user, :review_manager, jurisdiction:)
      record = double("PermitApplication", submitted?: true)
      policy = described_class.new(UserContext.new(reviewer, sandbox), record)
      expect(policy.update_revision_requests?).to be true

      policy2 = described_class.new(UserContext.new(submitter, sandbox), record)
      expect(policy2.update_revision_requests?).to be false
    end

    it "upload_supporting_document? matches draft edit permissions" do
      record = double("PermitApplication", draft?: true)
      allow(record).to receive(
        :submission_requirement_block_edit_permissions
      ).and_return([1])
      policy = described_class.new(UserContext.new(submitter, sandbox), record)
      expect(policy.upload_supporting_document?).to be true

      allow(record).to receive(
        :submission_requirement_block_edit_permissions
      ).and_return(nil)
      expect(policy.upload_supporting_document?).to be false
    end

    it "submit? requires :all for drafts" do
      record = double("PermitApplication", draft?: true, submitter: submitter)
      allow(record).to receive(
        :submission_requirement_block_edit_permissions
      ).with(user_id: submitter.id).and_return(:all)
      policy = described_class.new(UserContext.new(submitter, sandbox), record)
      expect(policy.submit?).to be true

      allow(record).to receive(
        :submission_requirement_block_edit_permissions
      ).and_return([1])
      expect(policy.submit?).to be false
    end

    it "submit? permits review staff for non-drafts when member of jurisdiction" do
      reviewer = create(:user, :review_manager, jurisdiction:)
      record =
        double(
          "PermitApplication",
          draft?: false,
          jurisdiction_id: jurisdiction.id
        )
      expect(
        described_class.new(UserContext.new(reviewer, sandbox), record).submit?
      ).to be true
    end

    it "generate_missing_pdfs? permits admin, submitter, or review staff member" do
      record =
        double(
          "PermitApplication",
          submitter: submitter,
          jurisdiction_id: jurisdiction.id
        )
      expect(
        described_class.new(
          UserContext.new(submitter, sandbox),
          record
        ).generate_missing_pdfs?
      ).to be true
      expect(
        described_class.new(
          UserContext.new(create(:user, :super_admin), sandbox),
          record
        ).generate_missing_pdfs?
      ).to be true

      reviewer = create(:user, :review_manager, jurisdiction:)
      expect(
        described_class.new(
          UserContext.new(reviewer, sandbox),
          record
        ).generate_missing_pdfs?
      ).to be true
      stranger = create(:user)
      expect(
        described_class.new(
          UserContext.new(stranger, sandbox),
          record
        ).generate_missing_pdfs?
      ).to be false
    end

    it "finalize_revision_requests? respects designated reviewer feature" do
      reviewer = create(:user, :review_manager, jurisdiction:)
      review_rel =
        double("ReviewRel", delegatee: double("DelegateeRel", first: nil))
      record =
        double(
          "PermitApplication",
          submitted?: true,
          jurisdiction: double("Jurisdiction", allow_designated_reviewer: true),
          permit_collaborations:
            double("PermitCollaborations", review: review_rel)
        )

      allow(SiteConfiguration).to receive(
        :allow_designated_reviewer?
      ).and_return(false)
      policy = described_class.new(UserContext.new(reviewer, sandbox), record)
      expect(policy.finalize_revision_requests?).to be true

      allow(SiteConfiguration).to receive(
        :allow_designated_reviewer?
      ).and_return(true)
      expect(policy.finalize_revision_requests?).to be true
    end

    it "finalize_revision_requests? denies for non-review-staff or non-submitted" do
      record = double("PermitApplication", submitted?: false)
      expect(
        described_class.new(
          UserContext.new(submitter, sandbox),
          record
        ).finalize_revision_requests?
      ).to be false
    end

    it "create_permit_collaboration? supports submission/review branches" do
      submission_record =
        double(
          "PermitCollaboration",
          submission?: true,
          review?: false,
          permit_application:
            double("PermitApplication", submitter: submitter, draft?: true)
        )
      expect(
        described_class.new(
          UserContext.new(submitter, sandbox),
          submission_record
        ).create_permit_collaboration?
      ).to be true

      reviewer = create(:user, :review_manager, jurisdiction:)
      review_record =
        double(
          "PermitCollaboration",
          submission?: false,
          review?: true,
          permit_application:
            double(
              "PermitApplication",
              jurisdiction_id: jurisdiction.id,
              submitted?: true,
              visible_to_reviewers?: true
            )
        )
      expect(
        described_class.new(
          UserContext.new(reviewer, sandbox),
          review_record
        ).create_permit_collaboration?
      ).to be true

      other_record =
        double(
          "PermitCollaboration",
          submission?: false,
          review?: false,
          permit_application: double("PermitApplication")
        )
      expect(
        described_class.new(
          UserContext.new(reviewer, sandbox),
          other_record
        ).create_permit_collaboration?
      ).to be false
    end

    it "remove_collaborator_collaborations? supports draft and non-draft branches" do
      draft_record =
        double("PermitApplication", draft?: true, submitter_id: submitter.id)
      expect(
        described_class.new(
          UserContext.new(submitter, sandbox),
          draft_record
        ).remove_collaborator_collaborations?
      ).to be true

      reviewer = create(:user, :review_manager, jurisdiction:)
      submitted_record =
        double(
          "PermitApplication",
          draft?: false,
          jurisdiction_id: jurisdiction.id
        )
      expect(
        described_class.new(
          UserContext.new(reviewer, sandbox),
          submitted_record
        ).remove_collaborator_collaborations?
      ).to be true
    end

    it "invite_new_collaborator? denies review collaborations and permits submitter on drafts" do
      reviewer = create(:user, :review_manager, jurisdiction:)
      review_collab =
        double(
          "PermitCollaboration",
          review?: true,
          permit_application:
            double("PermitApplication", submitter: submitter, draft?: true)
        )
      expect(
        described_class.new(
          UserContext.new(reviewer, sandbox),
          review_collab
        ).invite_new_collaborator?
      ).to be false

      submission_collab =
        double(
          "PermitCollaboration",
          review?: false,
          permit_application:
            double("PermitApplication", submitter: submitter, draft?: true)
        )
      expect(
        described_class.new(
          UserContext.new(submitter, sandbox),
          submission_collab
        ).invite_new_collaborator?
      ).to be true
    end

    it "create_or_update_permit_block_status? supports requirement_block_id allow-listing" do
      reviewer = create(:user, :review_manager, jurisdiction:)
      pa =
        double(
          "PermitApplication",
          draft?: true,
          submitted?: false,
          jurisdiction_id: jurisdiction.id
        )
      allow(pa).to receive(
        :submission_requirement_block_edit_permissions
      ).and_return(["rb-1"])
      pbs =
        double(
          "PermitBlockStatus",
          submission?: true,
          review?: false,
          permit_application: pa,
          requirement_block_id: "rb-1"
        )
      pbs2 =
        double(
          "PermitBlockStatus",
          submission?: true,
          review?: false,
          permit_application: pa,
          requirement_block_id: "rb-2"
        )

      expect(
        described_class.new(
          UserContext.new(reviewer, sandbox),
          pbs
        ).create_or_update_permit_block_status?
      ).to be true
      expect(
        described_class.new(
          UserContext.new(reviewer, sandbox),
          pbs2
        ).create_or_update_permit_block_status?
      ).to be false
    end

    it "create_or_update_permit_block_status? supports submission and review branches" do
      pa =
        double(
          "PermitApplication",
          draft?: true,
          submitted?: false,
          jurisdiction_id: jurisdiction.id
        )
      allow(pa).to receive(
        :submission_requirement_block_edit_permissions
      ).and_return(:all)
      pbs =
        double(
          "PermitBlockStatus",
          submission?: true,
          review?: false,
          permit_application: pa,
          requirement_block_id: "rb1"
        )

      reviewer = create(:user, :review_manager, jurisdiction:)
      policy = described_class.new(UserContext.new(reviewer, sandbox), pbs)
      expect(policy.create_or_update_permit_block_status?).to be true

      pa2 =
        double(
          "PermitApplication",
          draft?: false,
          submitted?: true,
          jurisdiction_id: jurisdiction.id
        )
      pbs2 =
        double(
          "PermitBlockStatus",
          submission?: false,
          review?: true,
          permit_application: pa2
        )
      expect(
        described_class.new(
          UserContext.new(reviewer, sandbox),
          pbs2
        ).create_or_update_permit_block_status?
      ).to be true
    end

    it "download_application_metrics_csv? permits only super_admin" do
      expect(subject.download_application_metrics_csv?).to be false
      expect(
        described_class.new(
          UserContext.new(create(:user, :super_admin), sandbox),
          draft_permit_application
        ).download_application_metrics_csv?
      ).to be true
    end

    it "destroy? permits only submitter for drafts; restore? permits submitter" do
      record = double("PermitApplication", draft?: true, submitter: submitter)
      policy = described_class.new(UserContext.new(submitter, sandbox), record)
      expect(policy.destroy?).to be true
      expect(policy.restore?).to be true

      other = create(:user, :submitter)
      expect(
        described_class.new(UserContext.new(other, sandbox), record).destroy?
      ).to be false
      expect(
        described_class.new(UserContext.new(other, sandbox), record).restore?
      ).to be false
    end
  end

  context "create? permissions around project ownership" do
    let(:user) { submitter }

    it "denies create when no permit project is present" do
      record =
        build(
          :permit_application,
          submitter: submitter,
          jurisdiction: jurisdiction,
          sandbox: sandbox,
          permit_project: nil
        )

      policy = described_class.new(UserContext.new(user, sandbox), record)
      expect(policy.create?).to be false
    end

    it "denies create when project is owned by someone else" do
      other_owner = create(:user)
      foreign_project =
        create(:permit_project, owner: other_owner, jurisdiction: jurisdiction)
      record =
        build(
          :permit_application,
          submitter: submitter,
          jurisdiction: jurisdiction,
          sandbox: sandbox,
          permit_project: foreign_project
        )

      policy = described_class.new(UserContext.new(user, sandbox), record)
      expect(policy.create?).to be false
    end
  end

  context "for a review manager with correct jurisdiction" do
    let(:user) { FactoryBot.create(:user, :review_manager, jurisdiction:) }

    it "Does not permit search on draft" do
      expect(subject.index?).to be_falsy
    end
  end

  context "for a super admin" do
    let(:user) { FactoryBot.create(:user, :super_admin) }

    it "permits search" do
      expect(subject.index?).to be_falsy
    end
  end

  context "for a submitter with a submitted permit application" do
    let!(:user) { submitter }
    let!(:submitted_permit_application) do
      FactoryBot.create(
        :permit_application,
        :newly_submitted,
        jurisdiction: jurisdiction,
        submitter: submitter
      )
    end

    subject do
      described_class.new(
        UserContext.new(user, sandbox),
        submitted_permit_application
      )
    end

    it "does not permit update" do
      expect(subject.update?).to be false
    end
  end

  describe PermitApplicationPolicy::Scope do
    it "includes submitted applications for review staff in their jurisdiction" do
      reviewer = create(:user, :review_manager, jurisdiction:)
      submitted =
        create(
          :permit_application,
          :newly_submitted,
          jurisdiction: jurisdiction,
          sandbox: sandbox
        )
      draft =
        create(
          :permit_application,
          jurisdiction: jurisdiction,
          sandbox: sandbox
        )

      resolved =
        described_class.new(
          UserContext.new(reviewer, sandbox),
          PermitApplication.all
        ).resolve

      expect(resolved).to include(submitted)
      expect(resolved).not_to include(draft)
    end
  end
end
