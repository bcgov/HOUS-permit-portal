require "rails_helper"

RSpec.describe NotificationService do
  def stub_simple_feed!(user_feed:)
    stub_const("SimpleFeed", Module.new)
    SimpleFeed.define_singleton_method(:user_feed) { user_feed }
    unless SimpleFeed.const_defined?("Event")
      SimpleFeed.const_set(
        "Event",
        Class.new do
          def initialize(_payload, _at)
          end
        end
      )
    end
  end

  describe ".reset_user_feed_last_read" do
    it "resets last read for a user feed" do
      activity = instance_double("SimpleFeedActivity", reset_last_read: true)
      user_feed = instance_double("UserFeed", activity: activity)
      stub_simple_feed!(user_feed: user_feed)

      described_class.reset_user_feed_last_read("u-1")

      expect(activity).to have_received(:reset_last_read)
    end
  end

  describe ".total_page_count" do
    it "uses ENV page size and rounds up" do
      allow(ENV).to receive(:[]).and_call_original
      allow(ENV).to receive(:[]).with("NOTIFICATION_FEED_PER_PAGE").and_return(
        "5"
      )

      expect(described_class.total_page_count(0)).to eq(0)
      expect(described_class.total_page_count(1)).to eq(1)
      expect(described_class.total_page_count(6)).to eq(2)
    end
  end

  describe ".user_feed_for" do
    it "returns parsed feed items with pagination meta" do
      feed_item =
        instance_double(
          "FeedItem",
          value: { message: "hello" }.to_json,
          at: Time.zone.parse("2026-01-01 10:00:00")
        )

      activity =
        instance_double(
          "SimpleFeedActivity",
          paginate: [feed_item],
          total_count: 6
        )
      user_feed = instance_double("UserFeed", activity: activity)
      stub_simple_feed!(user_feed: user_feed)
      allow(ENV).to receive(:[]).and_call_original
      allow(ENV).to receive(:[]).with("NOTIFICATION_FEED_PER_PAGE").and_return(
        "5"
      )

      result = described_class.user_feed_for("u-1", 1)

      expect(result[:feed_items].first.message).to eq("hello")
      expect(result[:feed_items].first.at).to eq(feed_item.at)
      expect(result[:total_pages]).to eq(2)
      expect(result[:feed_object]).to eq(activity)
    end
  end

  describe ".publish_to_user_feeds" do
    it "stores events and broadcasts user payloads with meta" do
      allow(Time).to receive(:now).and_return(
        Time.zone.parse("2026-01-01 10:00:00")
      )

      activity_u1 =
        instance_double(
          "SimpleFeedActivity",
          store: true,
          total_count: 3,
          unread_count: 2,
          last_read: Time.zone.parse("2026-01-01 09:00:00")
        )
      activity_u2 =
        instance_double(
          "SimpleFeedActivity",
          store: true,
          total_count: {
            "u-2" => 10
          },
          unread_count: {
            "u-2" => 1
          },
          last_read: {
            "u-2" => nil
          }
        )

      user_feed = instance_double("UserFeed")
      stub_simple_feed!(user_feed: user_feed)
      allow(user_feed).to receive(:activity).with("u-1").and_return(activity_u1)
      allow(user_feed).to receive(:activity).with("u-2").and_return(activity_u2)

      allow(WebsocketBroadcaster).to receive(:push_user_payloads)
      allow(ENV).to receive(:[]).and_call_original
      allow(ENV).to receive(:[]).with("NOTIFICATION_FEED_PER_PAGE").and_return(
        "5"
      )

      described_class.publish_to_user_feeds(
        { "u-1" => { message: "one" }, "u-2" => { message: "two" } }
      )

      expect(activity_u1).to have_received(:store)
      expect(activity_u2).to have_received(:store)
      expect(WebsocketBroadcaster).to have_received(
        :push_user_payloads
      ) do |payloads|
        expect(payloads.keys).to match_array(%w[u-1 u-2])
        expect(payloads["u-1"][:meta][:unread_count]).to eq(2)
        expect(payloads["u-2"][:meta][:total_pages]).to eq(2)
      end
    end
  end

  describe ".available_jurisdiction_ids_for" do
    it "returns nil when template is globally available" do
      template =
        instance_double("RequirementTemplate", available_globally: true)
      expect(
        described_class.send(:available_jurisdiction_ids_for, template)
      ).to be_nil
    end

    it "returns jurisdiction ids when template is not globally available" do
      assoc = double("JRTAssoc", pluck: %w[j1 j2])
      template =
        instance_double(
          "RequirementTemplate",
          available_globally: false,
          jurisdiction_requirement_templates: assoc
        )
      expect(
        described_class.send(:available_jurisdiction_ids_for, template)
      ).to eq(%w[j1 j2])
    end
  end

  describe ".publish_file_upload_failed_event" do
    it "pushes notification payloads for each determined owner" do
      owners = [
        instance_double("User", id: "u1"),
        instance_double("User", id: "u2")
      ]
      file_attachment = double("FileAttachment")
      allow(file_attachment).to receive(
        :upload_failed_notification_data
      ).and_return({ message: "fail" })

      allow(described_class).to receive(:determine_file_owner).and_return(
        owners
      )
      allow(NotificationPushJob).to receive(:perform_async)

      described_class.publish_file_upload_failed_event(
        file_attachment,
        file_name: "x.pdf"
      )

      expect(NotificationPushJob).to have_received(:perform_async) do |hash|
        expect(hash.keys).to match_array(%w[u1 u2])
      end
    end
  end

  describe ".publish_permit_block_status_ready_event" do
    it "returns early when not ready or block missing" do
      permit_block_status =
        instance_double("PermitBlockStatus", ready?: false, block_exists?: true)
      allow(NotificationPushJob).to receive(:perform_async)

      described_class.publish_permit_block_status_ready_event(
        permit_block_status
      )

      expect(NotificationPushJob).not_to have_received(:perform_async)
    end

    it "pushes notifications only to users with in-app preference enabled" do
      pref_on =
        instance_double(
          "Preference",
          enable_in_app_collaboration_notification: true
        )
      pref_off =
        instance_double(
          "Preference",
          enable_in_app_collaboration_notification: false
        )
      user_on = instance_double("User", id: "u1", preference: pref_on)
      user_off = instance_double("User", id: "u2", preference: pref_off)

      permit_block_status =
        instance_double(
          "PermitBlockStatus",
          ready?: true,
          block_exists?: true,
          users_to_notify_status_ready: [user_on, user_off],
          status_ready_notification_data: {
            message: "ready"
          }
        )
      allow(NotificationPushJob).to receive(:perform_async)

      described_class.publish_permit_block_status_ready_event(
        permit_block_status
      )

      expect(NotificationPushJob).to have_received(:perform_async).with(
        { "u1" => { message: "ready" } }
      )
    end

    it "skips users with missing preference object" do
      user_nil_pref = instance_double("User", id: "u3", preference: nil)
      permit_block_status =
        instance_double(
          "PermitBlockStatus",
          ready?: true,
          block_exists?: true,
          users_to_notify_status_ready: [user_nil_pref],
          status_ready_notification_data: {
            message: "ready"
          }
        )
      allow(NotificationPushJob).to receive(:perform_async)

      described_class.publish_permit_block_status_ready_event(
        permit_block_status
      )

      expect(NotificationPushJob).to have_received(:perform_async).with({})
    end
  end

  describe ".publish_step_code_report_generated_event" do
    it "returns when step_code is missing" do
      report_document = instance_double("ReportDocument", step_code: nil)
      allow(NotificationPushJob).to receive(:perform_async)
      described_class.publish_step_code_report_generated_event(report_document)
      expect(NotificationPushJob).not_to have_received(:perform_async)
    end

    it "notifies submitter (if permit application) and creator (if present)" do
      pa = instance_double("PermitApplication", submitter_id: "u1")
      step_code =
        instance_double("StepCode", permit_application: pa, creator_id: "u2")
      report_document =
        instance_double(
          "ReportDocument",
          step_code: step_code,
          report_generated_event_notification_data: {
            msg: "ok"
          }
        )
      allow(NotificationPushJob).to receive(:perform_async)

      described_class.publish_step_code_report_generated_event(report_document)

      expect(NotificationPushJob).to have_received(:perform_async) do |hash|
        expect(hash.keys).to match_array(%w[u1 u2])
      end
    end

    it "does not enqueue when there are no recipient user ids" do
      step_code =
        instance_double("StepCode", permit_application: nil, creator_id: nil)
      report_document = instance_double("ReportDocument", step_code: step_code)
      allow(NotificationPushJob).to receive(:perform_async)

      described_class.publish_step_code_report_generated_event(report_document)

      expect(NotificationPushJob).not_to have_received(:perform_async)
    end
  end

  describe ".publish_pre_check_submitted_event / .publish_pre_check_completed_event" do
    it "pushes in-app and emails for submitted and completed events" do
      pre_check =
        instance_double(
          "PreCheck",
          creator_id: "u1",
          submission_event_notification_data: {
            a: 1
          },
          completed_event_notification_data: {
            b: 2
          }
        )
      allow(NotificationPushJob).to receive(:perform_async)
      allow(PermitHubMailer).to receive(:notify_pre_check_submitted).and_return(
        instance_double("MailerMessage", deliver_later: true)
      )
      allow(PermitHubMailer).to receive(:notify_pre_check_completed).and_return(
        instance_double("MailerMessage", deliver_later: true)
      )

      described_class.publish_pre_check_submitted_event(pre_check)
      described_class.publish_pre_check_completed_event(pre_check)

      expect(NotificationPushJob).to have_received(:perform_async).with(
        { "u1" => { a: 1 } }
      )
      expect(NotificationPushJob).to have_received(:perform_async).with(
        { "u1" => { b: 2 } }
      )
      expect(PermitHubMailer).to have_received(
        :notify_pre_check_submitted
      ).with(pre_check)
      expect(PermitHubMailer).to have_received(
        :notify_pre_check_completed
      ).with(pre_check)
    end
  end

  describe ".publish_review_started_event" do
    it "emails and pushes based on submitter preference flags" do
      preference =
        instance_double(
          "Preference",
          enable_email_application_view_notification: true,
          enable_in_app_application_view_notification: true
        )
      submitter = instance_double("User", preference: preference)
      permit_application =
        instance_double(
          "PermitApplication",
          submitter_id: "u1",
          submitter: submitter,
          review_started_event_notification_data: {
            msg: "review_started"
          }
        )
      allow(NotificationPushJob).to receive(:perform_async)
      allow(PermitHubMailer).to receive(:notify_review_started).and_return(
        instance_double("MailerMessage", deliver_later: true)
      )

      described_class.publish_review_started_event(permit_application)

      expect(PermitHubMailer).to have_received(:notify_review_started).with(
        permit_application
      )
      expect(NotificationPushJob).to have_received(:perform_async).with(
        { "u1" => { msg: "review_started" } }
      )
    end
  end

  describe ".publish_resource_reminder_event" do
    it "returns when jurisdiction has no managers" do
      jurisdiction = instance_double("Jurisdiction", managers: [])
      allow(NotificationPushJob).to receive(:perform_async)
      described_class.publish_resource_reminder_event(jurisdiction, ["r1"])
      expect(NotificationPushJob).not_to have_received(:perform_async)
    end

    it "notifies managers based on preference flags" do
      pref_on =
        instance_double(
          "Preference",
          enable_in_app_resource_reminder_notification: true,
          enable_email_resource_reminder_notification: true
        )
      manager = instance_double("User", id: "u1", preference: pref_on)
      jurisdiction =
        instance_double("Jurisdiction", id: "j1", managers: [manager])
      allow(Resource).to receive(
        :resource_reminder_notification_data
      ).and_return({ msg: "remind" })
      allow(NotificationPushJob).to receive(:perform_async)
      allow(PermitHubMailer).to receive(:remind_resource_update).and_return(
        instance_double("MailerMessage", deliver_later: true)
      )

      described_class.publish_resource_reminder_event(jurisdiction, ["r1"])

      expect(NotificationPushJob).to have_received(:perform_async).with(
        { "u1" => { msg: "remind" } }
      )
      expect(PermitHubMailer).to have_received(:remind_resource_update).with(
        manager,
        jurisdiction,
        ["r1"]
      )
    end
  end

  describe ".publish_application_submission_event / .publish_application_revisions_request_event" do
    it "creates correct in-app and email notifications for submitters and collaborators" do
      submitter_pref =
        instance_double(
          "Preference",
          enable_in_app_application_submission_notification: true,
          enable_email_application_submission_notification: true,
          enable_in_app_application_revisions_request_notification: true,
          enable_email_application_revisions_request_notification: true
        )
      submitter =
        instance_double("User", id: "u_submit", preference: submitter_pref)

      designated_pref =
        instance_double(
          "Preference",
          enable_in_app_application_submission_notification: true,
          enable_email_application_submission_notification: false,
          enable_in_app_application_revisions_request_notification: true,
          enable_email_application_revisions_request_notification: false
        )
      designated =
        instance_double("User", id: "u_designated", preference: designated_pref)

      assignee_pref =
        instance_double(
          "Preference",
          enable_in_app_collaboration_notification: true,
          enable_email_collaboration_notification: true
        )
      assignee =
        instance_double("User", id: "u_assignee", preference: assignee_pref)

      contact = instance_double("SubmissionContact")

      permit_application =
        instance_double(
          "PermitApplication",
          submitter: submitter,
          submitter_id: "u_submit",
          submit_event_notification_data: {
            msg: "submitted"
          },
          revisions_request_event_notification_data: {
            msg: "rev"
          },
          confirmed_submission_contacts: [contact]
        )

      allow(permit_application).to receive(
        :users_by_collaboration_options
      ) do |args|
        if args[:collaborator_type] == :delegatee
          [designated]
        else
          [assignee]
        end
      end

      allow(NotificationPushJob).to receive(:perform_async)
      allow(PermitHubMailer).to receive(
        :notify_submitter_application_submitted
      ).and_return(instance_double("MailerMessage", deliver_later: true))
      allow(PermitHubMailer).to receive(
        :notify_reviewer_application_received
      ).and_return(instance_double("MailerMessage", deliver_later: true))
      allow(PermitHubMailer).to receive(
        :notify_application_revisions_requested
      ).and_return(instance_double("MailerMessage", deliver_later: true))

      described_class.publish_application_submission_event(permit_application)
      described_class.publish_application_revisions_request_event(
        permit_application
      )

      expect(NotificationPushJob).to have_received(:perform_async).at_least(
        :once
      )
      expect(PermitHubMailer).to have_received(
        :notify_submitter_application_submitted
      ).at_least(:once)
      expect(PermitHubMailer).to have_received(
        :notify_reviewer_application_received
      ).at_least(:once)
      expect(PermitHubMailer).to have_received(
        :notify_application_revisions_requested
      ).with(permit_application, submitter)
    end
  end

  describe "private email notifications for external api keys" do
    it "sends template update emails to active external api keys for eligible jurisdictions" do
      template_version = instance_double("TemplateVersion")

      api_key = instance_double("ExternalApiKey")
      mail = instance_double("MailerMessage", deliver_later: true)
      allow(PermitHubMailer).to receive(
        :notify_external_api_key_template_update
      ).and_return(mail)

      keys_relation = double("ExternalApiKeysRelation")
      keys_where_chain = double("KeysWhereChain")
      allow(keys_relation).to receive(:where).and_return(keys_relation)
      allow(keys_relation).to receive(:where).with(no_args).and_return(
        keys_where_chain
      )
      allow(keys_where_chain).to receive(:not).and_return(keys_relation)
      allow(keys_relation).to receive(:each).and_yield(api_key)

      jurisdiction =
        instance_double("Jurisdiction", external_api_keys: keys_relation)

      api_jurisdictions = double("ApiJurisdictionsRelation")
      api_where_chain = double("ApiWhereChain")
      allow(api_jurisdictions).to receive(:where).and_return(api_jurisdictions)
      allow(api_jurisdictions).to receive(:where).with(id: ["j1"]).and_return(
        api_jurisdictions
      )
      allow(api_jurisdictions).to receive(:where).with(no_args).and_return(
        api_where_chain
      )
      allow(api_where_chain).to receive(:not).and_return(api_jurisdictions)
      allow(api_jurisdictions).to receive(:find_each).and_yield(jurisdiction)

      allow(Jurisdiction).to receive(:where).with(
        external_api_state: "j_on"
      ).and_return(api_jurisdictions)

      described_class.send(
        :send_external_api_key_notifications,
        template_version,
        ["j1"],
        ["j2"],
        change_type: "minor",
        diff_summary: "diff"
      )

      expect(PermitHubMailer).to have_received(
        :notify_external_api_key_template_update
      ).with(
        template_version,
        api_key,
        change_type: "minor",
        diff_summary: "diff"
      )
    end
  end

  describe "private helpers" do
    it "activity_metadata handles scalar and hash metadata shapes" do
      activity = double("Activity", total_count: 5)
      expect(
        described_class.send(:activity_metadata, "u1", activity, :total_count)
      ).to eq(5)

      activity2 = double("Activity", total_count: { "u1" => 7 })
      expect(
        described_class.send(:activity_metadata, "u1", activity2, :total_count)
      ).to eq(7)
    end
  end

  describe "private helpers" do
    it "determine_file_owner returns submitter for permit application attachment" do
      submitter = instance_double("User")
      pa = instance_double("PermitApplication", submitter: submitter)
      file_attachment = instance_double("FileAttachment", attached_to: pa)

      owners = described_class.send(:determine_file_owner, file_attachment)

      expect(owners).to eq([submitter])
    end

    it "determine_file_owner returns super admins for requirement block attachment" do
      rb = RequirementBlock.new
      file_attachment = instance_double("FileAttachment", attached_to: rb)
      admins = [instance_double("User")]
      allow(User).to receive(:where).with(role: :super_admin).and_return(admins)

      owners = described_class.send(:determine_file_owner, file_attachment)

      expect(owners).to eq(admins)
    end

    it "determine_file_owner returns jurisdiction managers for resource attachments" do
      manager = instance_double("User")
      jurisdiction = instance_double("Jurisdiction", managers: [manager])
      resource = Resource.new
      allow(resource).to receive(:jurisdiction).and_return(jurisdiction)
      file_attachment = instance_double("FileAttachment", attached_to: resource)

      owners = described_class.send(:determine_file_owner, file_attachment)

      expect(owners).to eq([manager])
    end

    it "determine_file_owner falls back to common user accessors" do
      owner = instance_double("User")
      attached_to = OpenStruct.new(creator: owner)
      file_attachment =
        instance_double("FileAttachment", attached_to: attached_to)

      owners = described_class.send(:determine_file_owner, file_attachment)
      expect(owners).to eq([owner])
    end

    it "determine_file_owner returns nil when attached_to is blank" do
      file_attachment = instance_double("FileAttachment", attached_to: nil)
      expect(
        described_class.send(:determine_file_owner, file_attachment)
      ).to be_nil
    end
  end

  describe ".publish_permit_collaboration_assignment_event / .publish_permit_collaboration_unassignment_event" do
    it "pushes assignment/unassignment notification payloads" do
      preference =
        instance_double(
          "Preference",
          enable_in_app_collaboration_notification: true
        )
      user = instance_double("User", id: "u1", preference: preference)
      collaborator = instance_double("Collaborator", user_id: "u1", user: user)
      permit_collaboration =
        instance_double(
          "PermitCollaboration",
          collaborator: collaborator,
          collaboration_assignment_notification_data: {
            a: 1
          },
          collaboration_unassignment_notification_data: {
            b: 2
          }
        )
      allow(NotificationPushJob).to receive(:perform_async)

      described_class.publish_permit_collaboration_assignment_event(
        permit_collaboration
      )
      described_class.publish_permit_collaboration_unassignment_event(
        permit_collaboration
      )

      expect(NotificationPushJob).to have_received(:perform_async).with(
        { "u1" => { a: 1 } }
      )
      expect(NotificationPushJob).to have_received(:perform_async).with(
        { "u1" => { b: 2 } }
      )
    end
  end
end
