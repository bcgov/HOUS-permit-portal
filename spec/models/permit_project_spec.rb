require "rails_helper"

RSpec.describe PermitProject, type: :model do
  include ActiveSupport::Testing::TimeHelpers

  describe "associations" do
    subject { build(:permit_project) }

    it { should belong_to(:owner).class_name("User") }
    it { should belong_to(:jurisdiction) }
    it { should have_many(:permit_applications) }
    it { should have_many(:project_documents).dependent(:destroy) }
    it { should have_many(:step_codes) }
    it { should have_many(:pinned_projects).dependent(:destroy) }
    it do
      should have_many(:pinning_users).through(:pinned_projects).source(:user)
    end
    it { should have_many(:collaborators).through(:permit_applications) }
  end

  describe "validations" do
    it { should validate_presence_of(:title) }

    it "auto-assigns a number on update when missing" do
      project = create(:permit_project)
      expect(project.number).to be_present

      expect { project.update!(number: nil) }.not_to raise_error
      expect(project.reload.number).to be_present
    end
  end

  describe "callbacks" do
    it "sets default title from full_address when title is blank" do
      project =
        create(
          :permit_project,
          title: nil,
          full_address: "123 Main St, Anytown, USA"
        )

      expect(project.title).to eq("123 Main St")
    end

    it "assigns a unique number on create when missing" do
      project = create(:permit_project, number: nil)
      expect(project.number).to be_present
      expect(project.number).to match(/\A.+-\d{4}-\d{4}\z/)
    end

    it "generates unique numbers for the same jurisdiction" do
      jurisdiction = create(:sub_district)
      p1 = create(:permit_project, jurisdiction: jurisdiction, number: nil)
      p2 = create(:permit_project, jurisdiction: jurisdiction, number: nil)

      expect(p1.number).to be_present
      expect(p2.number).to be_present
      expect(p1.number).not_to eq(p2.number)
    end
  end

  describe "scopes" do
    describe ".with_status_counts" do
      it "exposes status count columns and uses them in getters" do
        permit_project = create(:permit_project)
        create(
          :permit_application,
          permit_project: permit_project,
          status: :new_draft
        )
        create(
          :permit_application,
          :newly_submitted,
          permit_project: permit_project
        )

        project = described_class.with_status_counts.find(permit_project.id)

        expect(project.total_permits_count).to eq(2)
        expect(project.new_draft_count).to eq(1)
        expect(project.newly_submitted_count).to eq(1)
      end
    end
  end

  describe "instance methods" do
    describe "#approved_count" do
      it "returns 0 when approved status is not supported" do
        project = create(:permit_project)
        expect(project.approved_count).to eq(0)
      end
    end

    describe "#rollup_status" do
      it "returns 'empty' when there are no permit applications" do
        project = create(:permit_project)
        expect(project.rollup_status).to eq("empty")
      end

      it "returns the status of the permit application with highest pertinence_score" do
        project = build(:permit_project)
        a =
          instance_double(
            "PermitApplication",
            pertinence_score: 1,
            status: "new_draft"
          )
        b =
          instance_double(
            "PermitApplication",
            pertinence_score: 5,
            status: "newly_submitted"
          )
        allow(project).to receive(:permit_applications).and_return([a, b])

        expect(project.rollup_status).to eq("newly_submitted")
      end
    end

    describe "#forcasted_completion_date" do
      it "returns a date ~14 days from now" do
        project = build(:permit_project)
        travel_to(Time.zone.parse("2026-01-01 10:00:00")) do
          expect(project.forcasted_completion_date).to eq(
            Time.zone.parse("2026-01-15 10:00:00")
          )
        end
      end
    end

    describe "#recent_permit_applications" do
      it "returns none when user is nil" do
        project = create(:permit_project)
        expect(project.recent_permit_applications(nil)).to be_empty
      end

      it "returns last 3 when user is owner" do
        owner = create(:user)
        project = create(:permit_project, owner: owner)
        older =
          create(
            :permit_application,
            permit_project: project,
            created_at: 3.days.ago,
            updated_at: 3.days.ago
          )
        middle =
          create(
            :permit_application,
            permit_project: project,
            created_at: 2.days.ago,
            updated_at: 2.days.ago
          )
        newer =
          create(
            :permit_application,
            permit_project: project,
            created_at: 1.day.ago,
            updated_at: 1.day.ago
          )
        newest =
          create(
            :permit_application,
            permit_project: project,
            created_at: Time.current,
            updated_at: Time.current
          )

        expect(project.recent_permit_applications(owner)).to eq(
          [newest, newer, middle]
        )
        expect(project.recent_permit_applications(owner)).not_to include(older)
      end
    end

    describe "#submission_collaborators" do
      it "returns none when user is nil" do
        project = create(:permit_project)
        expect(project.submission_collaborators(nil)).to be_empty
      end

      it "returns collaborators for owner (submission collaborations only)" do
        owner = create(:user)
        project = create(:permit_project, owner: owner)
        permit_application =
          create(:permit_application, permit_project: project)

        submitter = create(:user)
        collaborator =
          create(
            :collaborator,
            user: submitter,
            collaboratorable: permit_application.submitter
          )
        create(
          :permit_collaboration,
          permit_application: permit_application,
          collaborator: collaborator,
          collaboration_type: :submission
        )

        expect(project.submission_collaborators(owner)).to include(collaborator)
      end

      it "returns none for non-owner" do
        owner = create(:user)
        other = create(:user)
        project = create(:permit_project, owner: owner)

        expect(project.submission_collaborators(other)).to be_empty
      end
    end

    describe "#project_documents(user)" do
      it "returns none when user is nil" do
        project = create(:permit_project)
        expect(project.project_documents(nil)).to be_empty
      end

      it "returns project documents for owner" do
        owner = create(:user)
        project = create(:permit_project, owner: owner)
        doc = create(:project_document, permit_project: project)

        expect(project.project_documents(owner)).to include(doc)
      end

      it "returns none for non-owner" do
        owner = create(:user)
        other = create(:user)
        project = create(:permit_project, owner: owner)
        create(:project_document, permit_project: project)

        expect(project.project_documents(other)).to be_empty
      end
    end
  end
end
