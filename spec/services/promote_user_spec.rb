require "rails_helper"

RSpec.describe PromoteUser do
  before { allow(ActiveRecord::Base).to receive(:transaction).and_yield }

  def stub_overheating_codes(invited_user)
    overheating_codes = double("OverheatingCodes")
    allow(invited_user).to receive(:overheating_codes).and_return(
      overheating_codes
    )
    allow(overheating_codes).to receive(:update_all)
    overheating_codes
  end

  it "merges invitation fields and jurisdictions and destroys invited user when valid" do
    existing_user = instance_double("User", jurisdiction_ids: ["j1"], id: "e1")
    invited_user =
      instance_double("User", jurisdiction_ids: ["j2"], submitter?: false)

    allow(invited_user).to receive(:slice).and_return(
      { "invitation_token" => "t", "role" => "review_manager" }
    )
    allow(existing_user).to receive(:assign_attributes)
    allow(existing_user).to receive(:valid?).and_return(true)
    allow(existing_user).to receive(:jurisdiction_ids=)
    allow(existing_user).to receive(:save!)

    allow(invited_user).to receive(:destroy!)
    allow(invited_user).to receive(:reload)
    allow(invited_user).to receive(:collaborations).and_return([])
    stub_overheating_codes(invited_user)

    service =
      described_class.new(
        existing_user: existing_user,
        invited_user: invited_user
      ).call

    expect(existing_user).to have_received(:assign_attributes).with(
      hash_including("invitation_token" => "t")
    )
    expect(invited_user).to have_received(:destroy!)
    expect(existing_user).to have_received(:jurisdiction_ids=).with(%w[j1 j2])
    expect(existing_user).to have_received(:save!)
    expect(service.existing_user).to eq(existing_user)
  end

  it "does not merge when existing user is invalid" do
    existing_user = instance_double("User", jurisdiction_ids: [])
    invited_user =
      instance_double("User", jurisdiction_ids: [], submitter?: true)
    allow(invited_user).to receive(:destroy!)
    allow(invited_user).to receive(:slice).and_return({})
    allow(existing_user).to receive(:assign_attributes)
    allow(existing_user).to receive(:valid?).and_return(false)

    allow(invited_user).to receive(:collaborations).and_return([])

    described_class.new(
      existing_user: existing_user,
      invited_user: invited_user
    ).call

    expect(invited_user).not_to have_received(:destroy!)
  end

  it "merges collaborations by updating collaborator user when missing on existing user" do
    existing_collabs = double("ExistingCollabs")
    invited_collabs = []

    existing_user =
      instance_double(
        "User",
        jurisdiction_ids: [],
        collaborations: existing_collabs,
        id: "e1"
      )
    invited_user =
      instance_double(
        "User",
        jurisdiction_ids: [],
        collaborations: invited_collabs,
        submitter?: true,
        reload: true
      )

    allow(invited_user).to receive(:slice).and_return({})
    allow(existing_user).to receive(:assign_attributes)
    allow(existing_user).to receive(:valid?).and_return(true)
    allow(existing_user).to receive(:jurisdiction_ids=)
    allow(existing_user).to receive(:save!)
    allow(invited_user).to receive(:destroy!)
    allow(invited_user).to receive(:reload)
    stub_overheating_codes(invited_user)

    invited_user_collab =
      instance_double(
        "Collaborator",
        collaboratorable: "x",
        permit_collaborations: [],
        update: true
      )
    allow(invited_user).to receive(:collaborations).and_return(
      [invited_user_collab]
    )
    allow(existing_collabs).to receive(:find_by).with(
      collaboratorable: "x"
    ).and_return(nil)

    described_class.new(
      existing_user: existing_user,
      invited_user: invited_user
    ).call

    expect(invited_user_collab).to have_received(:update).with(
      user: existing_user
    )
  end

  it "reassigns overheating codes from invited user before destroy" do
    allow(ActiveRecord::Base).to receive(:transaction).and_call_original

    existing_user = create(:user, :submitter)
    invited_user = create(:user, :review_manager, confirmed: false)
    overheating_code = create(:overheating_code, creator: invited_user)

    described_class.new(
      existing_user: existing_user,
      invited_user: invited_user
    ).call

    expect(overheating_code.reload.creator_id).to eq(existing_user.id)
    expect(User.exists?(invited_user.id)).to be false
  end
end
