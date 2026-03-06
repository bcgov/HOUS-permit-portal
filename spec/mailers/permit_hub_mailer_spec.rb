require "rails_helper"

RSpec.describe PermitHubMailer, type: :mailer do
  let(:mailer) { described_class.new }

  let(:confirmed_user) do
    instance_double(
      "User",
      email: "user@example.com",
      discarded?: false,
      confirmed?: true,
      submitter?: true,
      preference:
        instance_double(
          "Preference",
          enable_email_collaboration_notification: true
        ),
      omniauth_provider: "idir",
      omniauth_username: nil
    )
  end

  let(:unconfirmed_user) do
    instance_double(
      "User",
      email: "u@example.com",
      discarded?: false,
      confirmed?: false
    )
  end

  before do
    allow(mailer).to receive(:send_mail).and_return(:ok)
    allow(FrontendUrlHelper).to receive(:frontend_url).and_return(
      "http://example.test/x"
    )
    allow(FrontendUrlHelper).to receive(:root_url).and_return(
      "http://example.test/"
    )
    allow(Rails.logger).to receive(:info)
    allow(Rails.logger).to receive(:error)
  end

  describe "#send_user_mail" do
    it "does not send when user is unconfirmed" do
      mailer.instance_variable_set(:@user, unconfirmed_user)
      mailer.send_user_mail(
        email: unconfirmed_user.email,
        template_key: "welcome"
      )
      expect(mailer).not_to have_received(:send_mail)
    end

    it "does not send when user is discarded" do
      user =
        instance_double(
          "User",
          email: "d@example.com",
          discarded?: true,
          confirmed?: true
        )
      mailer.instance_variable_set(:@user, user)
      mailer.send_user_mail(email: user.email, template_key: "welcome")
      expect(mailer).not_to have_received(:send_mail)
    end

    it "sends when user is confirmed and not discarded" do
      mailer.instance_variable_set(:@user, confirmed_user)
      mailer.send_user_mail(
        email: confirmed_user.email,
        template_key: "welcome"
      )
      expect(mailer).to have_received(:send_mail).with(
        email: confirmed_user.email,
        template_key: "welcome"
      )
    end
  end

  it "welcome sends user mail" do
    mailer.welcome(confirmed_user)
    expect(mailer).to have_received(:send_mail).with(
      email: confirmed_user.email,
      template_key: "welcome"
    )
  end

  it "account_closed bypasses send_user_mail checks" do
    discarded =
      instance_double(
        "User",
        email: "x@example.com",
        discarded?: true,
        confirmed?: false
      )
    mailer.account_closed(discarded)
    expect(mailer).to have_received(:send_mail).with(
      email: discarded.email,
      template_key: "account_closed"
    )
  end

  it "notify_permit_collaboration returns when no permit_application" do
    permit_collaboration =
      instance_double(
        "PermitCollaboration",
        collaborator: instance_double("Collaborator", user: confirmed_user),
        permit_application: nil
      )

    mailer.notify_permit_collaboration(
      permit_collaboration: permit_collaboration
    )
    expect(mailer).not_to have_received(:send_mail)
  end

  it "notify_block_status_ready returns when user preference disabled" do
    permit_block_status =
      instance_double("PermitBlockStatus", block_exists?: true)
    user =
      instance_double(
        "User",
        email: "x@example.com",
        discarded?: false,
        confirmed?: true,
        preference:
          instance_double(
            "Preference",
            enable_email_collaboration_notification: false
          )
      )

    mailer.notify_block_status_ready(
      permit_block_status: permit_block_status,
      user: user
    )
    expect(mailer).not_to have_received(:send_mail)
  end

  it "notify_new_or_unconfirmed_permit_collaboration invites submitter users" do
    collaboratorable = instance_double("Collaboratorable")
    collaborator =
      instance_double("Collaborator", collaboratorable: collaboratorable)
    permit_collaboration =
      instance_double(
        "PermitCollaboration",
        collaborator: collaborator,
        permit_application: instance_double("PermitApplication")
      )

    user =
      instance_double(
        "User",
        email: "inv@example.com",
        discarded?: false,
        confirmed?: true,
        submitter?: true
      )
    allow(user).to receive(:skip_confirmation_notification!)
    allow(user).to receive(:skip_invitation=)
    allow(user).to receive(:invite!).with(collaboratorable)
    allow(user).to receive(:invitation_sent_at=)
    allow(user).to receive(:save!)

    mailer.notify_new_or_unconfirmed_permit_collaboration(
      permit_collaboration: permit_collaboration,
      user: user
    )

    expect(mailer).to have_received(:send_mail).with(
      email: user.email,
      template_key: :notify_new_or_unconfirmed_permit_collaboration
    )
  end

  it "notifies user archive warning and handles invalid retention days env" do
    allow(ENV).to receive(:fetch).and_call_original
    allow(ENV).to receive(:fetch).with(
      "USER_DELETE_AFTER_DAYS",
      anything
    ).and_return("not-a-number")

    mailer.notify_user_archive_warning(confirmed_user, 5)

    expect(mailer).to have_received(:send_mail).with(
      email: confirmed_user.email,
      template_key: "user_archive_warning",
      subject_i18n_params: {
        days: 5
      }
    )
  end

  it "notifies user delete warning via send_mail" do
    mailer.notify_user_delete_warning(confirmed_user, 2)
    expect(mailer).to have_received(:send_mail).with(
      email: confirmed_user.email,
      template_key: "user_delete_warning",
      subject_i18n_params: {
        days: 2
      }
    )
  end

  it "sends onboarding and new jurisdiction membership emails" do
    jurisdiction = instance_double("Jurisdiction")
    allow(Jurisdiction).to receive(:find).with("j-1").and_return(jurisdiction)

    mailer.onboarding(confirmed_user)
    mailer.new_jurisdiction_membership(confirmed_user, "j-1")

    expect(mailer).to have_received(:send_mail).with(
      email: confirmed_user.email,
      template_key: "onboarding"
    )
    expect(mailer).to have_received(:send_mail).with(
      email: confirmed_user.email,
      template_key: "new_jurisdiction_membership"
    )
  end

  it "sends submitter and reviewer permit application notifications" do
    permit_application =
      instance_double(
        "PermitApplication",
        number: "PA-1",
        submitter: confirmed_user
      )
    contact =
      instance_double(
        "PermitTypeSubmissionContact",
        email: "reviewer@example.com"
      )

    mailer.notify_submitter_application_submitted(
      permit_application,
      confirmed_user
    )
    mailer.notify_reviewer_application_received(contact, permit_application)
    mailer.notify_application_viewed(permit_application)
    mailer.notify_application_revisions_requested(
      permit_application,
      confirmed_user
    )

    expect(mailer).to have_received(:send_mail).with(
      email: confirmed_user.email,
      template_key: "notify_submitter_application_submitted"
    )
    expect(mailer).to have_received(:send_mail).with(
      email: "reviewer@example.com",
      template_key: "notify_reviewer_application_received",
      subject_i18n_params: {
        permit_application_number: "PA-1"
      }
    )
    expect(mailer).to have_received(:send_mail).with(
      email: confirmed_user.email,
      template_key: "notify_application_viewed",
      subject_i18n_params: {
        permit_application_number: "PA-1"
      }
    )
    expect(mailer).to have_received(:send_mail).with(
      email: confirmed_user.email,
      template_key: "notify_application_revisions_requested",
      subject_i18n_params: {
        permit_application_number: "PA-1"
      }
    )
  end

  it "sends pre-check notifications" do
    pre_check = instance_double("PreCheck", creator: confirmed_user)
    mailer.notify_pre_check_submitted(pre_check)
    mailer.notify_pre_check_completed(pre_check)

    expect(mailer).to have_received(:send_mail).with(
      email: confirmed_user.email,
      template_key: "notify_pre_check_submitted"
    )
    expect(mailer).to have_received(:send_mail).with(
      email: confirmed_user.email,
      template_key: "notify_pre_check_completed"
    )
  end

  it "sends template version published notification and sets inbox setup urls when contact missing" do
    permit_type = instance_double("PermitType", id: "pt-1")
    template_version =
      instance_double(
        "TemplateVersion",
        label: "Label",
        version_date: Date.new(2026, 1, 1),
        permit_type: permit_type
      )
    jurisdiction =
      instance_double("Jurisdiction", slug: "jur", external_api_enabled?: true)
    relation = double("Relation")
    allow(relation).to receive(:where).and_return(relation)
    allow(relation).to receive(:not).and_return(relation)
    allow(relation).to receive(:exists?).and_return(false)
    allow(jurisdiction).to receive(:permit_type_submission_contacts).and_return(
      relation
    )

    mailer.notify_new_template_version_published(
      template_version,
      confirmed_user,
      jurisdiction: jurisdiction,
      change_type: :new_template,
      diff_summary: "diff"
    )

    expect(mailer).to have_received(:send_mail).with(
      email: confirmed_user.email,
      template_key: "notify_new_template_version_published",
      subject_i18n_params: hash_including(:template_label, :version_date),
      subject_key: "notify_template_version_new_template"
    )
  end

  it "sends external api key template update when notification email present" do
    jurisdiction =
      instance_double(
        "Jurisdiction",
        slug: "jur",
        qualified_name: "Jur",
        external_api_enabled?: true
      )
    external_api_key =
      instance_double(
        "ExternalApiKey",
        jurisdiction: jurisdiction,
        notification_email: "api@example.com"
      )
    template_version =
      instance_double(
        "TemplateVersion",
        label: "Label",
        version_date: Date.new(2026, 1, 1)
      )

    mailer.notify_external_api_key_template_update(
      template_version,
      external_api_key,
      change_type: :action_required,
      diff_summary: "diff"
    )

    expect(mailer).to have_received(:send_mail).with(
      email: "api@example.com",
      template_key: "notify_new_template_version_published",
      subject_i18n_params: hash_including(:template_label, :version_date),
      subject_key: "notify_template_version_action_required"
    )
  end

  it "sends api key status change email only when notification email exists" do
    jurisdiction = instance_double("Jurisdiction", qualified_name: "Jur")
    api_key =
      instance_double(
        "ExternalApiKey",
        jurisdiction: jurisdiction,
        notification_email: nil
      )
    mailer.notify_api_key_status_change(api_key, :revoked)
    expect(mailer).not_to have_received(:send_mail)

    api_key2 =
      instance_double(
        "ExternalApiKey",
        jurisdiction: jurisdiction,
        notification_email: "n@example.com"
      )
    mailer.notify_api_key_status_change(api_key2, :expiring, 5)
    expect(mailer).to have_received(:send_mail).with(
      email: "n@example.com",
      template_key: "notify_api_key_status_change",
      subject_i18n_params:
        hash_including(:jurisdiction_name, :status, :interval)
    )
  end

  it "reminds reviewer and resource update" do
    contact =
      instance_double("PermitTypeSubmissionContact", email: "r@example.com")
    mailer.remind_reviewer(contact, [instance_double("PermitApplication")])

    allow(Resource).to receive(:where).and_return([])
    jurisdiction = instance_double("Jurisdiction")
    mailer.remind_resource_update(confirmed_user, jurisdiction, ["id-1"])

    expect(mailer).to have_received(:send_mail).with(
      email: "r@example.com",
      template_key: "remind_reviewer"
    )
    expect(mailer).to have_received(:send_mail).with(
      email: confirmed_user.email,
      template_key: "remind_resource_update"
    )
  end

  describe "#send_step_code_report_to_jurisdiction" do
    it "raises when report document has no file attached" do
      report_document = instance_double("ReportDocument", id: "rd-1", file: nil)

      expect do
        mailer.send_step_code_report_to_jurisdiction(
          report_document: report_document,
          step_code: instance_double("StepCode", title: "Title"),
          recipient_email: "to@example.com",
          jurisdiction: instance_double("Jurisdiction", qualified_name: "Jur"),
          sender_user: confirmed_user
        )
      end.to raise_error(/Unable to attach report file/)
    end

    it "attaches the report file and sends mail" do
      attachment_io = StringIO.new("abc".encode("UTF-8"))
      attachment = instance_double("Shrine::UploadedFile")
      allow(attachment).to receive(:download).and_return(attachment_io)
      allow(attachment).to receive(:metadata).and_return(
        { "filename" => "report.pdf" }
      )
      allow(attachment).to receive(:size).and_return(3)

      report_document =
        instance_double(
          "ReportDocument",
          id: "rd-2",
          file: attachment,
          file_name: "report.pdf"
        )

      allow(mailer).to receive(:attachments).and_return({})

      mailer.send_step_code_report_to_jurisdiction(
        report_document: report_document,
        step_code: instance_double("StepCode", title: nil),
        recipient_email: "to@example.com",
        jurisdiction: instance_double("Jurisdiction", qualified_name: "Jur"),
        sender_user: confirmed_user
      )

      expect(mailer.attachments).to include("report.pdf")
      expect(mailer).to have_received(:send_mail).with(
        email: "to@example.com",
        template_key: "send_step_code_report_to_jurisdiction",
        subject_i18n_params: hash_including(:jurisdiction_name)
      )
    end
  end

  it "does nothing when adding attachment with no file" do
    allow(mailer).to receive(:attachments).and_return({})
    mailer.send(:add_attachment, double("FileUploadAttachment", file: nil))
    expect(mailer.attachments).to eq({})
  end
end
