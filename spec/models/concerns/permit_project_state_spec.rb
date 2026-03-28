require "rails_helper"

RSpec.describe PermitProjectState, type: :model do
  let(:project) { create(:permit_project) }

  describe "enums" do
    subject { build(:permit_project) }

    it do
      should define_enum_for(:state).with_values(
               draft: 0,
               queued: 1,
               waiting: 2,
               in_progress: 3,
               ready: 4,
               permit_issued: 5,
               active: 6,
               complete: 7,
               closed: 8
             )
    end
  end

  describe "AASM state machine" do
    describe "initial state" do
      it "starts in draft" do
        expect(project).to be_draft
      end
    end

    describe "event :enqueue" do
      context "from draft" do
        it "transitions when a submitted permit exists" do
          pa =
            create(
              :permit_application,
              permit_project: project,
              status: :new_draft
            )
          pa.update_column(
            :status,
            PermitApplication.statuses[:newly_submitted]
          )
          expect { project.enqueue! }.to change(project, :state).from(
            "draft"
          ).to("queued")
        end

        it "does not transition without a submitted permit" do
          project.state = "draft"
          expect { project.enqueue! }.to raise_error(AASM::InvalidTransition)
        end
      end

      %i[waiting in_progress active complete closed].each do |from_state|
        it "transitions from #{from_state}" do
          project.update_column(:state, PermitProject.states[from_state])
          expect { project.enqueue! }.to change(project, :state).to("queued")
        end
      end

      %i[queued ready permit_issued].each do |from_state|
        it "does not transition from #{from_state}" do
          project.update_column(:state, PermitProject.states[from_state])
          expect { project.enqueue! }.to raise_error(AASM::InvalidTransition)
        end
      end
    end

    describe "event :begin_progress" do
      %i[queued waiting ready permit_issued active].each do |from_state|
        it "transitions from #{from_state}" do
          project.update_column(:state, PermitProject.states[from_state])
          expect { project.begin_progress! }.to change(project, :state).to(
            "in_progress"
          )
        end
      end

      %i[draft in_progress complete closed].each do |from_state|
        it "does not transition from #{from_state}" do
          project.update_column(:state, PermitProject.states[from_state])
          expect { project.begin_progress! }.to raise_error(
            AASM::InvalidTransition
          )
        end
      end
    end

    describe "event :mark_ready" do
      %i[queued waiting in_progress permit_issued].each do |from_state|
        it "transitions from #{from_state}" do
          project.update_column(:state, PermitProject.states[from_state])
          expect { project.mark_ready! }.to change(project, :state).to("ready")
        end
      end

      %i[draft ready active complete closed].each do |from_state|
        it "does not transition from #{from_state}" do
          project.update_column(:state, PermitProject.states[from_state])
          expect { project.mark_ready! }.to raise_error(AASM::InvalidTransition)
        end
      end
    end

    describe "event :issue_permit" do
      %i[queued waiting ready].each do |from_state|
        it "transitions from #{from_state}" do
          project.update_column(:state, PermitProject.states[from_state])
          expect { project.issue_permit! }.to change(project, :state).to(
            "permit_issued"
          )
        end
      end

      %i[
        draft
        in_progress
        permit_issued
        active
        complete
        closed
      ].each do |from_state|
        it "does not transition from #{from_state}" do
          project.update_column(:state, PermitProject.states[from_state])
          expect { project.issue_permit! }.to raise_error(
            AASM::InvalidTransition
          )
        end
      end
    end

    describe "event :start_construction" do
      %i[queued waiting permit_issued complete].each do |from_state|
        it "transitions from #{from_state}" do
          project.update_column(:state, PermitProject.states[from_state])
          expect { project.start_construction! }.to change(project, :state).to(
            "active"
          )
        end
      end

      %i[draft in_progress ready active closed].each do |from_state|
        it "does not transition from #{from_state}" do
          project.update_column(:state, PermitProject.states[from_state])
          expect { project.start_construction! }.to raise_error(
            AASM::InvalidTransition
          )
        end
      end
    end

    describe "event :finish" do
      it "transitions from active" do
        project.update_column(:state, PermitProject.states[:active])
        expect { project.finish! }.to change(project, :state).to("complete")
      end

      %i[
        draft
        queued
        waiting
        in_progress
        ready
        permit_issued
        complete
        closed
      ].each do |from_state|
        it "does not transition from #{from_state}" do
          project.update_column(:state, PermitProject.states[from_state])
          expect { project.finish! }.to raise_error(AASM::InvalidTransition)
        end
      end
    end

    describe "event :close_project" do
      %i[
        queued
        waiting
        in_progress
        ready
        permit_issued
        active
      ].each do |from_state|
        it "transitions from #{from_state}" do
          project.update_column(:state, PermitProject.states[from_state])
          expect { project.close_project! }.to change(project, :state).to(
            "closed"
          )
        end
      end

      %i[draft complete closed].each do |from_state|
        it "does not transition from #{from_state}" do
          project.update_column(:state, PermitProject.states[from_state])
          expect { project.close_project! }.to raise_error(
            AASM::InvalidTransition
          )
        end
      end
    end

    describe "event :put_on_hold" do
      %i[queued in_progress ready permit_issued active].each do |from_state|
        it "transitions from #{from_state}" do
          project.update_column(:state, PermitProject.states[from_state])
          expect { project.put_on_hold! }.to change(project, :state).to(
            "waiting"
          )
        end
      end

      %i[draft waiting complete closed].each do |from_state|
        it "does not transition from #{from_state}" do
          project.update_column(:state, PermitProject.states[from_state])
          expect { project.put_on_hold! }.to raise_error(
            AASM::InvalidTransition
          )
        end
      end
    end

    describe "event :return_to_draft" do
      it "transitions from queued when no post-draft permits exist" do
        project.update_column(:state, PermitProject.states[:queued])
        expect { project.return_to_draft! }.to change(project, :state).to(
          "draft"
        )
      end

      it "does not transition from queued when post-draft permits exist" do
        project.update_column(:state, PermitProject.states[:queued])
        pa =
          create(
            :permit_application,
            permit_project: project,
            status: :new_draft
          )
        pa.update_column(:status, PermitApplication.statuses[:newly_submitted])
        expect { project.return_to_draft! }.to raise_error(
          AASM::InvalidTransition
        )
      end
    end
  end

  describe "helper methods" do
    describe ".kanban_states" do
      it "returns the correct kanban states" do
        expect(PermitProject.kanban_states).to eq(
          %w[
            queued
            waiting
            in_progress
            ready
            permit_issued
            active
            complete
            closed
          ]
        )
      end
    end

    describe ".off_board_states" do
      it "returns the correct off-board states" do
        expect(PermitProject.off_board_states).to eq(%w[draft])
      end
    end

    describe "#allowed_manual_transitions" do
      it "returns empty for draft" do
        expect(project.allowed_manual_transitions).to eq([])
      end

      it "returns valid transitions for queued" do
        project.update_column(:state, PermitProject.states[:queued])
        expect(project.allowed_manual_transitions).to eq(
          %i[waiting in_progress ready permit_issued active closed]
        )
      end
    end

    describe "#rollup_status" do
      it "returns 'empty' when there are no permit applications" do
        expect(project.rollup_status).to eq("empty")
      end

      it "returns the status of the permit application with highest pertinence_score" do
        project_with_apps = build(:permit_project)
        a =
          instance_double(
            "PermitApplication",
            id: 1,
            pertinence_score: 1,
            inbox_pertinence_score: 40,
            status: "new_draft",
            nickname: "App A"
          )
        b =
          instance_double(
            "PermitApplication",
            id: 2,
            pertinence_score: 5,
            inbox_pertinence_score: 5,
            status: "newly_submitted",
            nickname: "App B"
          )
        relation = double("PermitApplicationRelation", kept: [a, b])
        allow(project_with_apps).to receive(:permit_applications).and_return(
          relation
        )

        expect(project_with_apps.rollup_status).to eq("newly_submitted")
      end
    end

    describe "#inbox_rollup_status" do
      it "returns 'empty' when there are no permit applications" do
        expect(project.inbox_rollup_status).to eq("empty")
      end

      it "returns the status of the permit application with highest inbox_pertinence_score" do
        project_with_apps = build(:permit_project)
        a =
          instance_double(
            "PermitApplication",
            id: 1,
            inbox_pertinence_score: 40,
            status: "newly_submitted",
            nickname: "App A"
          )
        b =
          instance_double(
            "PermitApplication",
            id: 2,
            inbox_pertinence_score: 15,
            status: "revisions_requested",
            nickname: "App B"
          )
        relation = double("PermitApplicationRelation", kept: [a, b])
        allow(project_with_apps).to receive(:permit_applications).and_return(
          relation
        )

        expect(project_with_apps.inbox_rollup_status).to eq("newly_submitted")
      end
    end

    describe "#has_submitted_permit?" do
      it "returns true when a submitted permit exists" do
        pa =
          create(
            :permit_application,
            permit_project: project,
            status: :new_draft
          )
        pa.update_column(:status, PermitApplication.statuses[:newly_submitted])
        expect(project.has_submitted_permit?).to be true
      end

      it "returns false when no submitted permits exist" do
        create(:permit_application, permit_project: project, status: :new_draft)
        expect(project.has_submitted_permit?).to be false
      end

      it "returns false with no permits" do
        expect(project.has_submitted_permit?).to be false
      end
    end

    describe "#no_post_draft_permits?" do
      it "returns true with no permits" do
        expect(project.no_post_draft_permits?).to be true
      end

      it "returns true when all permits are new_draft" do
        create(:permit_application, permit_project: project, status: :new_draft)
        expect(project.no_post_draft_permits?).to be true
      end

      it "returns false when a permit has been submitted" do
        pa =
          create(
            :permit_application,
            permit_project: project,
            status: :new_draft
          )
        pa.update_column(:status, PermitApplication.statuses[:newly_submitted])
        expect(project.no_post_draft_permits?).to be false
      end
    end
  end
end
