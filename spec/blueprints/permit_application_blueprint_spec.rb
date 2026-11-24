# frozen_string_literal: true

require "rails_helper"

RSpec.describe PermitApplicationBlueprint do
  it "does not use the submitter when created_by was never stored" do
    application = create(:permit_application)
    application.update_columns(created_by_type: nil, created_by_id: nil)

    json =
      JSON.parse(
        described_class.render(application, view: :jurisdiction_review_inbox)
      )

    expect(application.submitter).to be_present
    expect(json["created_by"]).to be_nil
  end

  it "includes status on the summary row a member who cannot open the application receives" do
    application = create(:permit_application)
    view =
      PermitProjectBlueprint.application_row_view(
        project_access: instance_double(ProjectAccess, view_application?: false)
      )

    expect(view).to eq(:summary)
    json = JSON.parse(described_class.render(application, view: view))
    expect(json["status"]).to eq(application.status)
  end

  it "puts can_archive_draft on the summary row" do
    application = create(:permit_application)
    access = instance_double(ProjectAccess)
    allow(access).to receive(:archive_draft?).with(application).and_return(true)

    json =
      JSON.parse(
        described_class.render(
          application,
          view: :summary,
          project_access: access
        )
      )

    expect(json["can_archive_draft"]).to be true
  end

  it "marks a summary row openable when the member holds a block grant" do
    project = create(:permit_project)
    application = create(:permit_application, permit_project: project)
    user = create(:user, :submitter)
    membership =
      create(
        :project_membership,
        permit_project: project,
        user: user,
        access: :limited
      )
    create(
      :project_grant,
      project_membership: membership,
      permit_application: application
    )
    access = ProjectAccess.new(user, project.sandbox, project)

    json =
      JSON.parse(
        described_class.render(
          application,
          view: :summary,
          current_user: user,
          project_access: access
        )
      )

    expect(json["can_open"]).to be true
  end

  it "asks the application contact to share details when neither field is present" do
    application = create(:permit_application)
    submitter = application.submitter

    missing =
      JSON.parse(
        described_class.render(
          application,
          view: :extended,
          current_user: submitter
        )
      )
    expect(missing["submitter_needs_shared_contact"]).to be true

    application.submitter_membership.update!(
      project_contact_email: "shared@example.com"
    )
    shared =
      JSON.parse(
        described_class.render(
          application.reload,
          view: :extended,
          current_user: submitter
        )
      )
    expect(shared["submitter_needs_shared_contact"]).to be false

    other = create(:user, :submitter)
    for_someone_else =
      JSON.parse(
        described_class.render(
          application,
          view: :extended,
          current_user: other
        )
      )
    expect(for_someone_else["submitter_needs_shared_contact"]).to be false
  end
end
