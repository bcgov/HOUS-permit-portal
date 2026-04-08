require "rails_helper"

RSpec.describe OmniauthUserResolver do
  def build_auth(identity_provider:, raw_info_attrs: {}, info_attrs: {})
    raw_info =
      OpenStruct.new(
        { identity_provider: identity_provider }.merge(raw_info_attrs)
      )
    info =
      OpenStruct.new(
        {
          email: "e@example.com",
          first_name: "First Middle",
          last_name: "Last"
        }.merge(info_attrs)
      )
    extra = OpenStruct.new(raw_info: raw_info)
    OpenStruct.new(info: info, extra: extra)
  end

  before do
    allow(Devise).to receive_message_chain(:friendly_token, :[]).and_return(
      "tok"
    )
  end

  it "returns unavailable error when provider is IDIR and no existing/invited user" do
    auth =
      build_auth(
        identity_provider: "idir",
        raw_info_attrs: {
          idir_user_guid: "g1",
          idir_username: "u"
        }
      )
    allow(User).to receive(:find_by_invitation_token).and_return(nil)
    allow(User).to receive(:find_by).and_return(nil)

    resolver = described_class.new(auth: auth, invitation_token: "t").call

    expect(resolver.user).to be_nil
    expect(resolver.error_key).to eq("omniauth.unavailable")
  end

  it "creates a user for BCeID providers and sets provider/uid/username" do
    auth =
      build_auth(
        identity_provider: "bceidboth",
        raw_info_attrs: {
          bceid_user_guid: "guid",
          bceid_username: "buser",
          bceid_business_guid: "biz"
        }
      )

    allow(User).to receive(:find_by_invitation_token).and_return(nil)
    allow(User).to receive(:find_by).and_return(nil)

    user =
      instance_double(
        "User",
        valid?: true,
        persisted?: true,
        skip_confirmation_notification!: true,
        save: true
      )
    allow(User).to receive(:new).and_return(user)

    resolver = described_class.new(auth: auth, invitation_token: "t").call

    expect(resolver.user).to eq(user)
    expect(User).to have_received(:new).with(
      hash_including(
        omniauth_provider: "bceidbusiness",
        omniauth_uid: "guid",
        omniauth_username: "buser"
      )
    )
  end

  it "accepts an invited user and assigns it when present" do
    auth =
      build_auth(
        identity_provider: "bceidbasic",
        raw_info_attrs: {
          bceid_user_guid: "guid",
          bceid_username: "u"
        }
      )

    invited_user =
      instance_double(
        "User",
        id: "inv1",
        update: true,
        valid?: true,
        accept_invitation!: true,
        persisted?: true
      )

    allow(User).to receive(:find_by_invitation_token).and_return(invited_user)
    allow(User).to receive(:find_by).and_return(nil)

    resolver = described_class.new(auth: auth, invitation_token: "t").call

    expect(resolver.user).to eq(invited_user)
    expect(invited_user).to have_received(:accept_invitation!)
  end

  it "promotes user when existing submitter differs from invited regional review manager" do
    auth =
      build_auth(
        identity_provider: "bceidbasic",
        raw_info_attrs: {
          bceid_user_guid: "guid",
          bceid_username: "u"
        }
      )

    existing_user =
      instance_double(
        "User",
        id: "e1",
        submitter?: true,
        regional_review_manager?: false,
        valid?: true,
        persisted?: true,
        accept_invitation!: true
      )
    allow(existing_user).to receive(:update).and_return(true)
    invited_user =
      instance_double(
        "User",
        id: "i1",
        submitter?: false,
        regional_review_manager?: true,
        valid?: true,
        accept_invitation!: true,
        persisted?: true
      )
    allow(invited_user).to receive(:update).and_return(true)

    allow(User).to receive(:find_by_invitation_token).and_return(invited_user)
    allow(User).to receive(:find_by).and_return(existing_user)

    promote =
      instance_double(
        "PromoteUser",
        call: OpenStruct.new(existing_user: existing_user)
      )
    allow(PromoteUser).to receive(:new).with(
      existing_user: existing_user,
      invited_user: invited_user
    ).and_return(promote)

    resolver = described_class.new(auth: auth, invitation_token: "t").call

    expect(resolver.invited_user).to eq(existing_user)
  end
end
