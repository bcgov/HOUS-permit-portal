# frozen_string_literal: true

require "rails_helper"

RSpec.describe PermitApplicationBlueprint do
  it "reports the submitter when created_by was never stored" do
    application = create(:permit_application)
    application.update_columns(created_by_type: nil, created_by_id: nil)

    json =
      JSON.parse(
        described_class.render(application, view: :jurisdiction_review_inbox)
      )

    expect(json["created_by"]).to include(
      "type" => "User",
      "id" => application.submitter_id,
      "name" => application.submitter.name,
      "role" => application.submitter.role
    )
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
end
