require "rails_helper"

RSpec.describe PermitBlockStatus, type: :model do
  describe "associations" do
    subject { build(:permit_block_status) }

    it { should belong_to(:permit_application) }
  end

  describe "enums" do
    subject { build_stubbed(:permit_block_status) }

    it do
      should define_enum_for(:status).with_values(
               draft: 0,
               in_progress: 1,
               ready: 2
             )
    end

    it do
      should define_enum_for(:collaboration_type).with_values(
               submission: 0,
               review: 1
             )
    end
  end

  describe "validations" do
    it { should validate_presence_of(:requirement_block_id) }
    it { should validate_presence_of(:collaboration_type) }

    it "enforces uniqueness of permit_application_id scoped to requirement_block_id and collaboration_type" do
      block_id = SecureRandom.uuid
      permit_application = create(:permit_application)
      create(
        :permit_block_status,
        permit_application: permit_application,
        requirement_block_id: block_id,
        collaboration_type: :submission
      )

      dup =
        build(
          :permit_block_status,
          permit_application: permit_application,
          requirement_block_id: block_id,
          collaboration_type: :submission
        )

      expect(dup).not_to be_valid
      expect(dup.errors.of_kind?(:permit_application_id, :taken)).to be(true)
    end
  end

  describe "#requirement_block_name" do
    it "returns requirement block name from template_version JSON" do
      permit_application = create(:permit_application)
      rb_id = SecureRandom.uuid
      permit_application.template_version.update!(
        requirement_blocks_json: {
          rb_id => {
            "name" => "Site survey"
          }
        }
      )

      status =
        build(
          :permit_block_status,
          permit_application: permit_application,
          requirement_block_id: rb_id
        )
      expect(status.requirement_block_name).to eq("Site survey")
    end
  end

  describe "#block_exists?" do
    it "returns true when requirement block key exists" do
      permit_application = create(:permit_application)
      rb_id = SecureRandom.uuid
      permit_application.template_version.update!(
        requirement_blocks_json: {
          rb_id => {
            "name" => "Block"
          }
        }
      )

      status =
        build(
          :permit_block_status,
          permit_application: permit_application,
          requirement_block_id: rb_id
        )
      expect(status.block_exists?).to be(true)
    end

    it "returns nil/falsey when requirement_blocks_json is nil" do
      permit_application = create(:permit_application)
      permit_application.template_version.update!(requirement_blocks_json: nil)

      status =
        build(
          :permit_block_status,
          permit_application: permit_application,
          requirement_block_id: SecureRandom.uuid
        )
      expect(status.block_exists?).to be_nil
    end
  end

  describe "#status_ready_notification_data" do
    it "uses setter text when set_by_user is present" do
      permit_application = create(:permit_application)
      rb_id = SecureRandom.uuid
      permit_application.template_version.update!(
        requirement_blocks_json: {
          rb_id => {
            "name" => "Block"
          }
        }
      )
      setter = create(:user, first_name: "Alex", last_name: "Lee")

      status =
        build(
          :permit_block_status,
          permit_application: permit_application,
          requirement_block_id: rb_id
        )
      status.set_by_user = setter

      data = status.status_ready_notification_data
      expect(data["action_type"]).to eq(
        Constants::NotificationActionTypes::PERMIT_BLOCK_STATUS_READY
      )
      expect(data["object_data"]["permit_application_id"]).to eq(
        permit_application.id
      )
    end
  end

  describe "#users_to_notify_status_ready" do
    it "includes submitter for submission collaboration type" do
      permit_application = create(:permit_application)
      status =
        build(
          :permit_block_status,
          permit_application: permit_application,
          collaboration_type: :submission
        )

      allow(permit_application).to receive(
        :users_by_collaboration_options
      ).and_return([])

      expect(status.users_to_notify_status_ready).to eq(
        [permit_application.submitter]
      )
    end

    it "includes delegatees and relevant assignees" do
      permit_application = create(:permit_application)
      rb_id = SecureRandom.uuid
      status =
        build(
          :permit_block_status,
          permit_application: permit_application,
          collaboration_type: :review,
          requirement_block_id: rb_id
        )

      delegatee_users = [create(:user)]
      assignee_users = [create(:user), create(:user)]

      allow(permit_application).to receive(
        :users_by_collaboration_options
      ).with(hash_including(collaborator_type: :delegatee)).and_return(
        delegatee_users
      )
      allow(permit_application).to receive(
        :users_by_collaboration_options
      ).with(
        hash_including(
          collaborator_type: :assignee,
          assigned_requirement_block_id: rb_id
        )
      ).and_return(assignee_users)

      expect(status.users_to_notify_status_ready).to match_array(
        delegatee_users + assignee_users
      )
    end
  end

  describe "callback behavior (private methods)" do
    describe "#send_status_ready_notification" do
      it "publishes notification only when ready and status changed" do
        status = build(:permit_block_status)
        allow(status).to receive(:saved_change_to_status?).and_return(true)
        allow(status).to receive(:ready?).and_return(true)
        allow(NotificationService).to receive(
          :publish_permit_block_status_ready_event
        )

        status.send(:send_status_ready_notification)
        expect(NotificationService).to have_received(
          :publish_permit_block_status_ready_event
        ).with(status)
      end

      it "does nothing when not ready" do
        status = build(:permit_block_status)
        allow(status).to receive(:saved_change_to_status?).and_return(true)
        allow(status).to receive(:ready?).and_return(false)
        allow(NotificationService).to receive(
          :publish_permit_block_status_ready_event
        )

        status.send(:send_status_ready_notification)
        expect(NotificationService).not_to have_received(
          :publish_permit_block_status_ready_event
        )
      end
    end

    describe "#send_status_ready_email" do
      it "emails users with email collaboration notifications enabled" do
        status = build(:permit_block_status, collaboration_type: :submission)
        allow(status).to receive(:saved_change_to_status?).and_return(true)
        allow(status).to receive(:ready?).and_return(true)

        user_enabled = create(:user)
        user_enabled.preference.update!(
          enable_email_collaboration_notification: true
        )
        user_disabled = create(:user)
        user_disabled.preference.update!(
          enable_email_collaboration_notification: false
        )

        allow(status).to receive(:users_to_notify_status_ready).and_return(
          [user_enabled, user_disabled]
        )

        allow(DebouncedNotificationEmailJob).to receive(:perform_in)

        status.send(:send_status_ready_email)

        expect(DebouncedNotificationEmailJob).to have_received(
          :perform_in
        ).with(
          kind_of(ActiveSupport::Duration),
          "permit_block_status_ready_summary:" \
            "#{status.permit_application_id}:" \
            "#{status.collaboration_type}:" \
            "#{user_enabled.id}",
          kind_of(Integer),
          "NotificationAggregators::PermitBlockReadySummary",
          {
            "permit_application_id" => status.permit_application_id,
            "collaboration_type" => status.collaboration_type,
            "user_id" => user_enabled.id
          },
          "PermitHubMailer",
          "notify_block_status_ready_summary"
        )
      end
    end

    describe "#send_status_change_websocket" do
      it "pushes websocket updates only when status changed" do
        status = build(:permit_block_status, collaboration_type: :submission)
        allow(status).to receive(:saved_change_to_status?).and_return(true)

        u1 = create(:user)
        allow(status).to receive(:users_to_notify_status_ready).and_return([u1])

        allow(PermitBlockStatusBlueprint).to receive(
          :render_as_hash
        ).and_return({ "id" => "x" })
        allow(WebsocketBroadcaster).to receive(:push_update_to_relevant_users)

        status.send(:send_status_change_websocket)

        expect(WebsocketBroadcaster).to have_received(
          :push_update_to_relevant_users
        )
      end

      it "adds jurisdiction review staff to recipients for review collaboration" do
        permit_application = create(:permit_application, :newly_submitted)
        status =
          build(
            :permit_block_status,
            permit_application: permit_application,
            collaboration_type: :review
          )
        allow(status).to receive(:saved_change_to_status?).and_return(true)

        allow(status).to receive(:users_to_notify_status_ready).and_return([])

        jurisdiction = permit_application.jurisdiction
        review_manager = create(:user, role: "review_manager")
        reviewer = create(:user, role: "reviewer")
        create(
          :jurisdiction_membership,
          jurisdiction: jurisdiction,
          user: review_manager
        )
        create(
          :jurisdiction_membership,
          jurisdiction: jurisdiction,
          user: reviewer
        )

        expected_ids =
          jurisdiction
            .users
            .kept
            .where(role: %i[review_manager reviewer regional_review_manager])
            .pluck(:id)

        allow(PermitBlockStatusBlueprint).to receive(
          :render_as_hash
        ).and_return({ "id" => "x" })
        allow(WebsocketBroadcaster).to receive(:push_update_to_relevant_users)

        status.send(:send_status_change_websocket)

        expect(WebsocketBroadcaster).to have_received(
          :push_update_to_relevant_users
        ).with(match_array(expected_ids), anything, anything, anything)
      end
    end
  end
end
