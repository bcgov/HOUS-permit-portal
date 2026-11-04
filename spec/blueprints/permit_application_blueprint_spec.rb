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
end
