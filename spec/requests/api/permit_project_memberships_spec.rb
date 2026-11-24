require "rails_helper"

RSpec.describe "Api::PermitProjects::Memberships", type: :request do
  include Devise::Test::IntegrationHelpers

  let(:headers) { { "ACCEPT" => "application/json" } }
  let(:owner) do
    create(:user, :submitter, first_name: "Olivia", last_name: "Owner")
  end
  let(:member) do
    create(:user, :submitter, first_name: "Mina", last_name: "Member")
  end
  let(:stranger) { create(:user, :submitter) }
  let(:jurisdiction) { create(:sub_district) }
  let(:project) do
    create(:permit_project, owner: owner, jurisdiction: jurisdiction)
  end
  let(:other_project) do
    create(:permit_project, owner: owner, jurisdiction: jurisdiction)
  end

  let!(:membership) do
    record =
      create(
        :project_membership,
        user: member,
        permit_project: project,
        access: :full,
        contact_designation: :none
      )
    record.role_list = ["Architect"]
    record.save!
    record
  end

  before do
    create(
      :project_membership,
      permit_project: other_project,
      user: create(:user, :submitter, first_name: "Other", last_name: "Project")
    )
    User.reindex
    ProjectMembership.reindex
  end

  def full_member_of_another_project
    outsider = create(:user, :submitter)
    other_application =
      create(
        :permit_application,
        submitter: outsider,
        jurisdiction: jurisdiction,
        sandbox: project.sandbox
      )
    expect(
      other_application.permit_project.project_memberships.find_by!(
        user: outsider
      )
    ).to be_full
    [outsider, other_application]
  end

  describe "GET /api/permit_projects/:id/memberships" do
    it "returns the creator membership and the other members" do
      sign_in owner

      get "/api/permit_projects/#{project.id}/memberships", headers: headers

      expect(response).to have_http_status(:ok)
      rows = json_response["data"]
      expect(rows.map { |row| row["name"] }).to eq(
        ["Olivia Owner", "Mina Member"]
      )
      expect(rows.first).to include(
        "user_id" => owner.id,
        "access" => "full",
        "contact_designation" => "primary",
        "role_tags" => []
      )
      expect(rows.second).to include(
        "access" => "full",
        "contact_designation" => "none",
        "role_tags" => ["Architect"]
      )
      expect(rows.map { |row| row["name"] }).not_to include("Other Project")
    end

    it "denies a user who cannot show the project" do
      sign_in stranger

      get "/api/permit_projects/#{project.id}/memberships", headers: headers

      expect(response).to have_http_status(:forbidden)
    end

    it "denies a Full member of a different project" do
      outsider, _other_application = full_member_of_another_project
      sign_in outsider

      get "/api/permit_projects/#{project.id}/memberships", headers: headers

      expect(response).to have_http_status(:forbidden)
    end

    it "shows every member their access and hides invitations from Limited" do
      standard =
        create(:user, :submitter, first_name: "Sam", last_name: "Standard")
      expanded =
        create(:user, :submitter, first_name: "Eve", last_name: "Expanded")
      create(
        :project_membership,
        user: standard,
        permit_project: project,
        access: :limited
      )
      create(
        :project_membership,
        user: expanded,
        permit_project: project,
        access: :expanded
      )
      create(
        :project_membership,
        :pending_invitation,
        permit_project: project,
        invited_first_name: "Penny",
        invited_last_name: "Pending",
        access: :expanded
      )
      create(
        :project_membership,
        :pending_invitation,
        permit_project: project,
        invited_first_name: "Eddie",
        invited_last_name: "Expired",
        invitation_sent_at: 4.days.ago,
        access: :limited
      )
      ProjectMembership.reindex

      sign_in standard
      get "/api/permit_projects/#{project.id}/memberships", headers: headers

      expect(response).to have_http_status(:ok)
      rows = json_response["data"]
      names = rows.map { |row| row["name"] }
      expect(names).to include(
        "Sam Standard",
        "Eve Expanded",
        "Olivia Owner",
        "Mina Member"
      )
      expect(names).not_to include("Penny Pending", "Eddie Expired")
      expanded_row = rows.find { |row| row["name"] == "Eve Expanded" }
      expect(expanded_row).to include(
        "access" => "expanded",
        "status" => "active"
      )
      expect(expanded_row).not_to have_key("invited_email")
      expect(expanded_row).not_to have_key("email")

      sign_in expanded
      get "/api/permit_projects/#{project.id}/memberships", headers: headers

      expect(response).to have_http_status(:ok)
      invitation_rows = json_response["data"]
      expect(invitation_rows.map { |row| row["name"] }).to include(
        "Penny Pending",
        "Eddie Expired"
      )
      expect(
        invitation_rows.find { |row| row["name"] == "Penny Pending" }
      ).to include("status" => "pending", "access" => "expanded")
      expect(
        invitation_rows.find { |row| row["name"] == "Eddie Expired" }
      ).to include("status" => "expired", "access" => "limited")
      expect(invitation_rows).to all(
        satisfy { |row| !row.key?("invited_email") }
      )
    end

    it "shows invitations to review staff for the jurisdiction" do
      create(
        :project_membership,
        :pending_invitation,
        permit_project: project,
        invited_first_name: "Penny",
        invited_last_name: "Pending"
      )
      ProjectMembership.reindex
      sign_in create(:user, :reviewer, jurisdiction: jurisdiction)

      get "/api/permit_projects/#{project.id}/memberships", headers: headers

      expect(response).to have_http_status(:ok)
      rows = json_response["data"]
      expect(rows.map { |row| row["name"] }).to include("Penny Pending")
      expect(rows).to all(
        satisfy { |row| !row.key?("email") && !row.key?("invited_email") }
      )
    end
  end

  describe "POST /api/permit_projects/:id/memberships/search" do
    it "matches a member name" do
      sign_in owner

      post "/api/permit_projects/#{project.id}/memberships/search",
           params: {
             query: "Mina"
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:ok)
      expect(json_response["data"].map { |row| row["name"] }).to eq(
        ["Mina Member"]
      )
      expect(json_response["meta"]["role_tags"]).to eq(["Architect"])
    end

    it "matches the creator by name" do
      sign_in owner

      post "/api/permit_projects/#{project.id}/memberships/search",
           params: {
             query: "Olivia"
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:ok)
      expect(json_response["data"].map { |row| row["name"] }).to eq(
        ["Olivia Owner"]
      )
      expect(json_response["data"].first).to include(
        "access" => "full",
        "contact_designation" => "primary"
      )
    end

    it "filters by access" do
      sign_in owner

      post "/api/permit_projects/#{project.id}/memberships/search",
           params: {
             filters: {
               access: ["full"]
             }
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:ok)
      expect(json_response["data"].map { |row| row["name"] }).to eq(
        ["Olivia Owner", "Mina Member"]
      )
    end
  end

  describe "PATCH /api/permit_projects/:id/memberships/:id" do
    it "updates role tags and contact designation without changing access" do
      membership.update!(project_contact_email: "mina@example.com")
      sign_in owner

      patch "/api/permit_projects/#{project.id}/memberships/#{membership.id}",
            params: {
              membership: {
                role_tags: %w[Architect Builder],
                contact_designation: "alternate"
              }
            },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:ok)
      expect(json_response["data"]).to include(
        "id" => membership.id,
        "contact_designation" => "alternate",
        "access" => "full"
      )
      expect(json_response["data"]["role_tags"]).to contain_exactly(
        "Architect",
        "Builder"
      )

      membership.reload
      expect(membership.role_list).to contain_exactly("Architect", "Builder")
      expect(membership.contact_designation).to eq("alternate")
      expect(membership.access).to eq("full")

      patch "/api/permit_projects/#{project.id}/memberships/#{membership.id}",
            params: {
              membership: {
                contact_designation: "none"
              }
            },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:ok)
      expect(membership.reload.contact_designation).to eq("none")
    end

    it "updates project access" do
      sign_in owner

      patch "/api/permit_projects/#{project.id}/memberships/#{membership.id}",
            params: {
              membership: {
                access: "limited"
              }
            },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:ok)
      expect(json_response["data"]).to include("access" => "limited")
      expect(membership.reload.access).to eq("limited")
    end

    it "creates and removes an invite grant for an Expanded member" do
      expanded =
        create(
          :project_membership,
          permit_project: project,
          user: create(:user, :submitter),
          access: :expanded
        )
      sign_in owner

      patch "/api/permit_projects/#{project.id}/memberships/#{expanded.id}",
            params: {
              membership: {
                allow_invite: true
              }
            },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:ok)
      expect(expanded.project_grants.invite.count).to eq(1)
      expect(json_response["data"]["allow_invite"]).to be(true)

      patch "/api/permit_projects/#{project.id}/memberships/#{expanded.id}",
            params: {
              membership: {
                allow_invite: false
              }
            },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:ok)
      expect(expanded.project_grants.invite.count).to eq(0)
      expect(json_response["data"]["allow_invite"]).to be(false)
    end

    it "keeps the invite grant when access changes away from Expanded" do
      expanded =
        create(
          :project_membership,
          permit_project: project,
          user: create(:user, :submitter),
          access: :expanded
        )
      create(:project_grant, :invite, project_membership: expanded)
      sign_in owner

      patch "/api/permit_projects/#{project.id}/memberships/#{expanded.id}",
            params: {
              membership: {
                access: "limited"
              }
            },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:ok)
      expect(expanded.reload.access).to eq("limited")
      expect(expanded.project_grants.invite.count).to eq(1)
    end

    it "denies an Expanded member from changing the invite grant" do
      expanded_user = create(:user, :submitter)
      expanded =
        create(
          :project_membership,
          permit_project: project,
          user: expanded_user,
          access: :expanded
        )
      sign_in expanded_user

      patch "/api/permit_projects/#{project.id}/memberships/#{expanded.id}",
            params: {
              membership: {
                allow_invite: true
              }
            },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:forbidden)
      expect(expanded.project_grants.invite.count).to eq(0)
    end

    it "does not change role tags when the same update changes access and the member cannot change standing" do
      expanded = create(:user, :submitter)
      create(
        :project_membership,
        permit_project: project,
        user: expanded,
        access: :expanded
      )
      sign_in expanded

      patch "/api/permit_projects/#{project.id}/memberships/#{membership.id}",
            params: {
              membership: {
                access: "limited",
                role_tags: ["Builder"]
              }
            },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:forbidden)
      expect(membership.reload.access).to eq("full")
      expect(membership.role_list).to contain_exactly("Architect")
    end

    it "lets Expanded change anyone's role and denies Limited" do
      expanded_user = create(:user, :submitter)
      standard_user = create(:user, :submitter)
      expanded_membership =
        create(
          :project_membership,
          permit_project: project,
          user: expanded_user,
          access: :expanded
        )
      standard_membership =
        create(
          :project_membership,
          permit_project: project,
          user: standard_user,
          access: :limited
        )
      sign_in expanded_user

      patch "/api/permit_projects/#{project.id}/memberships/#{standard_membership.id}",
            params: {
              membership: {
                role_tags: ["Designer"]
              }
            },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:ok)
      expect(standard_membership.reload.role_list).to contain_exactly(
        "Designer"
      )

      patch "/api/permit_projects/#{project.id}/memberships/#{expanded_membership.id}",
            params: {
              membership: {
                role_tags: ["Architect"]
              }
            },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:ok)
      expect(expanded_membership.reload.role_list).to contain_exactly(
        "Architect"
      )

      patch "/api/permit_projects/#{project.id}/memberships/#{membership.id}",
            params: {
              membership: {
                role_tags: ["Designer"]
              }
            },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:ok)
      expect(membership.reload.role_list).to contain_exactly("Designer")

      sign_in standard_user

      patch "/api/permit_projects/#{project.id}/memberships/#{standard_membership.id}",
            params: {
              membership: {
                role_tags: ["Builder"]
              }
            },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:forbidden)
      expect(standard_membership.reload.role_list).to contain_exactly(
        "Designer"
      )
    end

    it "denies Expanded and Limited from changing access or contact designation" do
      %i[expanded limited].each do |level|
        person = create(:user, :submitter)
        create(
          :project_membership,
          permit_project: project,
          user: person,
          access: level
        )
        sign_in person

        patch "/api/permit_projects/#{project.id}/memberships/#{membership.id}",
              params: {
                membership: {
                  contact_designation: "alternate"
                }
              },
              headers: headers,
              as: :json

        expect(response).to have_http_status(:forbidden)
        expect(membership.reload.contact_designation).to eq("none")

        patch "/api/permit_projects/#{project.id}/memberships/#{membership.id}",
              params: {
                membership: {
                  access: "limited"
                }
              },
              headers: headers,
              as: :json

        expect(response).to have_http_status(:forbidden)
        expect(membership.reload.access).to eq("full")
      end
    end

    it "rejects an unknown access level" do
      sign_in owner

      patch "/api/permit_projects/#{project.id}/memberships/#{membership.id}",
            params: {
              membership: {
                access: "admin"
              }
            },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(membership.reload.access).to eq("full")
    end

    it "lets the creator keep primary while updating roles" do
      creator_membership = project.project_memberships.find_by!(user: owner)
      sign_in owner

      patch "/api/permit_projects/#{project.id}/memberships/#{creator_membership.id}",
            params: {
              membership: {
                role_tags: ["Owner"],
                contact_designation: "primary"
              }
            },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:ok)
      expect(creator_membership.reload.contact_designation).to eq("primary")
      expect(creator_membership.role_list).to contain_exactly("Owner")
    end

    it "transfers primary contact to another member" do
      creator_membership = project.project_memberships.find_by!(user: owner)
      membership.update!(project_contact_email: "mina@example.com")
      sign_in owner

      patch "/api/permit_projects/#{project.id}/memberships/#{membership.id}",
            params: {
              membership: {
                contact_designation: "primary"
              }
            },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:ok)
      expect(membership.reload.contact_designation).to eq("primary")
      expect(creator_membership.reload.contact_designation).to eq("none")
    end

    it "clears primary on the current primary contact" do
      creator_membership = project.project_memberships.find_by!(user: owner)
      creator_membership.update!(project_contact_email: "olivia@example.com")
      sign_in owner

      patch "/api/permit_projects/#{project.id}/memberships/#{creator_membership.id}",
            params: {
              membership: {
                contact_designation: "alternate"
              }
            },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:ok)
      expect(creator_membership.reload.contact_designation).to eq("alternate")
    end

    it "forbids a reviewer who can see the project" do
      sign_in create(:user, :reviewer, jurisdiction: jurisdiction)

      get "/api/permit_projects/#{project.id}/memberships", headers: headers
      expect(response).to have_http_status(:ok)

      patch "/api/permit_projects/#{project.id}/memberships/#{membership.id}",
            params: {
              membership: {
                contact_designation: "alternate"
              }
            },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:forbidden)
      expect(membership.reload.contact_designation).to eq("none")
    end

    it "denies a Full member of a different project" do
      outsider, _other_application = full_member_of_another_project
      sign_in outsider

      patch "/api/permit_projects/#{project.id}/memberships/#{membership.id}",
            params: {
              membership: {
                access: "limited"
              }
            },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:forbidden)
      expect(membership.reload.access).to eq("full")
      expect(membership.contact_designation).to eq("none")
    end
  end

  describe "DELETE /api/permit_projects/:id/memberships/:id" do
    it "removes another member from the project" do
      sign_in owner

      delete "/api/permit_projects/#{project.id}/memberships/#{membership.id}",
             headers: headers

      expect(response).to have_http_status(:ok)
      expect(ProjectMembership.exists?(membership.id)).to be(false)

      ProjectMembership.reindex

      get "/api/permit_projects/#{project.id}/memberships", headers: headers

      expect(response).to have_http_status(:ok)
      names = json_response["data"].map { |row| row["name"] }
      expect(names).to include("Olivia Owner")
      expect(names).not_to include("Mina Member")
    end

    it "denies Expanded and Limited from removing another member" do
      %i[expanded limited].each do |level|
        person = create(:user, :submitter)
        create(
          :project_membership,
          permit_project: project,
          user: person,
          access: level
        )
        sign_in person

        delete "/api/permit_projects/#{project.id}/memberships/#{membership.id}",
               headers: headers

        expect(response).to have_http_status(:forbidden)
        expect(ProjectMembership.exists?(membership.id)).to be(true)
      end
    end

    it "removes the primary contact when another Full member remains" do
      creator_membership = project.project_memberships.find_by!(user: owner)
      sign_in owner

      delete "/api/permit_projects/#{project.id}/memberships/#{creator_membership.id}",
             headers: headers

      expect(response).to have_http_status(:ok)
      expect(ProjectMembership.exists?(creator_membership.id)).to be(false)
    end

    it "forbids a reviewer who can see the project" do
      sign_in create(:user, :reviewer, jurisdiction: jurisdiction)

      get "/api/permit_projects/#{project.id}/memberships", headers: headers
      expect(response).to have_http_status(:ok)

      delete "/api/permit_projects/#{project.id}/memberships/#{membership.id}",
             headers: headers

      expect(response).to have_http_status(:forbidden)
      expect(ProjectMembership.exists?(membership.id)).to be(true)
    end

    it "denies a Full member of a different project" do
      outsider, _other_application = full_member_of_another_project
      sign_in outsider

      delete "/api/permit_projects/#{project.id}/memberships/#{membership.id}",
             headers: headers

      expect(response).to have_http_status(:forbidden)
      expect(ProjectMembership.exists?(membership.id)).to be(true)
    end
  end

  describe "POST /api/permit_projects/:id/memberships and /api/project_invitations/:token" do
    it "creates a pending membership without creating a User, resends it, and lets a signed-in user accept or decline" do
      sign_in owner

      expect do
        post "/api/permit_projects/#{project.id}/memberships",
             params: {
               membership: {
                 first_name: "Wanda",
                 last_name: "Walls",
                 email: "wanda@example.com",
                 role_tags: ["Architect"],
                 contact_designation: "primary",
                 access: "expanded"
               }
             },
             headers: headers,
             as: :json
      end.to change(ProjectMembership, :count).by(1).and change(
              User,
              :count
            ).by(0)

      expect(response).to have_http_status(:created)
      expect(json_response["data"]).to include(
        "user_id" => nil,
        "name" => "Wanda Walls",
        "access" => "expanded",
        "contact_designation" => "none",
        "status" => "pending",
        "role_tags" => ["Architect"]
      )
      expect(json_response["data"]).not_to have_key("email")
      expect(json_response["data"]).not_to have_key("invited_email")

      creator_membership = project.project_memberships.find_by!(user: owner)
      expect(creator_membership.reload.contact_designation).to eq("primary")

      pending = ProjectMembership.find(json_response["data"]["id"])
      expect(pending.project_grants.invite).to be_empty
      expect(json_response["data"]["allow_invite"]).to be(false)
      raw_token = enqueued_invitation_raw_token
      expect(pending.invitation_token).to eq(
        Devise.token_generator.digest(
          ProjectMembership,
          :invitation_token,
          raw_token
        )
      )
      expect(pending.invitation_token).not_to eq(raw_token)
      old_digest = pending.invitation_token

      post "/api/permit_projects/#{project.id}/memberships/#{pending.id}/reinvite",
           params: {
             membership: {
               email: "wanda.updated@example.com"
             }
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:ok)
      expect(json_response["data"]).not_to have_key("email")
      expect(json_response["data"]).not_to have_key("invited_email")
      expect(pending.reload.invited_email).to eq("wanda@example.com")
      raw_token = enqueued_invitation_raw_token
      expect(pending.reload.invitation_token).not_to eq(old_digest)
      expect(pending.invitation_token).to eq(
        Devise.token_generator.digest(
          ProjectMembership,
          :invitation_token,
          raw_token
        )
      )

      invitee =
        create(
          :user,
          :submitter,
          first_name: "Wanda",
          last_name: "Different",
          email: "different-account@example.com"
        )
      sign_in invitee

      get "/api/project_invitations/#{raw_token}", headers: headers

      expect(response).to have_http_status(:ok)
      expect(json_response["data"]).to include(
        "project_id" => project.id,
        "project_title" => project.title,
        "invited_by_name" => "Olivia Owner",
        "status" => "pending"
      )
      expect(json_response["data"]).not_to have_key("invited_email")

      post "/api/project_invitations/#{raw_token}/accept",
           headers: headers,
           as: :json

      expect(response).to have_http_status(:ok)
      expect(json_response["data"]).to include(
        "permit_project_id" => project.id,
        "project_title" => project.title,
        "membership_id" => pending.id
      )

      pending.reload
      expect(pending.user_id).to eq(invitee.id)
      expect(pending.invitation_token).to be_nil
      expect(pending.contact_designation).to eq("none")
      expect(pending.project_contact_email).to be_nil
      expect(pending.project_contact_phone).to be_nil
      expect(creator_membership.reload.contact_designation).to eq("primary")
    end

    it "rejects accepting an invitation when the person is already a member" do
      raw = SecureRandom.urlsafe_base64(32)
      invite =
        create(
          :project_membership,
          :pending_invitation,
          permit_project: project,
          raw_invitation_token: raw
        )
      member = create(:user, :submitter)
      create(
        :project_membership,
        permit_project: project,
        user: member,
        access: :limited
      )
      sign_in member

      get "/api/project_invitations/#{raw}", headers: headers

      expect(response).to have_http_status(:ok)
      expect(json_response.dig("data", "already_member")).to be true

      expect {
        post "/api/project_invitations/#{raw}/accept",
             headers: headers,
             as: :json
      }.not_to change(ProjectMembership, :count)

      expect(response).to have_http_status(:unprocessable_content)
      expect(invite.reload.user_id).to be_nil
    end

    it "rejects accepting an expired invitation and destroys a declined invitation" do
      expired_raw = SecureRandom.urlsafe_base64(32)
      expired =
        create(
          :project_membership,
          :pending_invitation,
          permit_project: project,
          invitation_sent_at: 4.days.ago,
          raw_invitation_token: expired_raw
        )
      declinable_raw = SecureRandom.urlsafe_base64(32)
      declinable =
        create(
          :project_membership,
          :pending_invitation,
          permit_project: project,
          raw_invitation_token: declinable_raw
        )
      expect(expired.invitation_token).to eq(
        Devise.token_generator.digest(
          ProjectMembership,
          :invitation_token,
          expired_raw
        )
      )

      invitee = create(:user, :submitter)
      sign_in invitee

      post "/api/project_invitations/#{expired_raw}/accept",
           headers: headers,
           as: :json
      expect(response).to have_http_status(:unprocessable_content)

      post "/api/project_invitations/#{declinable_raw}/decline",
           headers: headers,
           as: :json
      expect(response).to have_http_status(:ok)
      expect(ProjectMembership.exists?(declinable.id)).to be(false)
    end

    it "creates an invite grant when an Expanded invitation allows inviting" do
      sign_in owner

      post "/api/permit_projects/#{project.id}/memberships",
           params: {
             membership: {
               first_name: "Wanda",
               last_name: "Walls",
               email: "wanda-invite@example.com",
               access: "expanded",
               allow_invite: true
             }
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:created)
      pending = ProjectMembership.find(json_response["data"]["id"])
      expect(pending.access).to eq("expanded")
      expect(pending.project_grants.invite.count).to eq(1)
      expect(json_response["data"]["allow_invite"]).to be(true)
    end

    it "lets an Expanded inviter pass an invite grant to a new Expanded member" do
      inviter = create(:user, :submitter)
      inviter_membership =
        create(
          :project_membership,
          permit_project: project,
          user: inviter,
          access: :expanded
        )
      create(:project_grant, :invite, project_membership: inviter_membership)
      sign_in inviter

      post "/api/permit_projects/#{project.id}/memberships",
           params: {
             membership: {
               first_name: "Wanda",
               last_name: "Walls",
               email: "wanda-from-expanded@example.com",
               access: "expanded",
               allow_invite: true
             }
           },
           headers: headers,
           as: :json

      expect(response).to have_http_status(:created)
      pending = ProjectMembership.find(json_response["data"]["id"])
      expect(pending.project_grants.invite.count).to eq(1)
    end

    it "denies Expanded and Limited from inviting with an access level" do
      %i[expanded limited].each do |level|
        person = create(:user, :submitter)
        create(
          :project_membership,
          permit_project: project,
          user: person,
          access: level
        )
        sign_in person

        expect {
          post "/api/permit_projects/#{project.id}/memberships",
               params: {
                 membership: {
                   first_name: "Wanda",
                   last_name: "Walls",
                   email: "wanda-#{level}@example.com",
                   access: "full"
                 }
               },
               headers: headers,
               as: :json
        }.not_to change(ProjectMembership, :count)

        expect(response).to have_http_status(:forbidden)
      end
    end

    it "denies a Full member of a different project from inviting" do
      outsider, _other_application = full_member_of_another_project
      sign_in outsider

      expect {
        post "/api/permit_projects/#{project.id}/memberships",
             params: {
               membership: {
                 first_name: "Wanda",
                 last_name: "Walls",
                 email: "wanda-outsider@example.com",
                 access: "expanded"
               }
             },
             headers: headers,
             as: :json
      }.not_to change(ProjectMembership, :count)

      expect(response).to have_http_status(:forbidden)
    end

    it "denies Expanded and Limited from resending or canceling an invitation" do
      %i[expanded limited].each do |level|
        person = create(:user, :submitter)
        create(
          :project_membership,
          permit_project: project,
          user: person,
          access: level
        )
        pending =
          create(
            :project_membership,
            :pending_invitation,
            permit_project: project
          )
        sign_in person

        post "/api/permit_projects/#{project.id}/memberships/#{pending.id}/reinvite",
             headers: headers,
             as: :json

        expect(response).to have_http_status(:forbidden)
        expect(pending.reload).to be_pending

        delete "/api/permit_projects/#{project.id}/memberships/#{pending.id}",
               headers: headers

        expect(response).to have_http_status(:forbidden)
        expect(ProjectMembership.exists?(pending.id)).to be(true)
      end
    end

    it "denies a Full member of a different project from reinviting" do
      pending =
        create(
          :project_membership,
          :pending_invitation,
          permit_project: project
        )
      outsider, _other_application = full_member_of_another_project
      sign_in outsider

      post "/api/permit_projects/#{project.id}/memberships/#{pending.id}/reinvite",
           headers: headers,
           as: :json

      expect(response).to have_http_status(:forbidden)
      expect(pending.reload).to be_pending
    end
  end

  describe "project contact details" do
    it "lets the member share an email or phone and keeps the account contact private" do
      sign_in member
      member.update!(phone_number: "2505551212")

      patch "/api/permit_projects/#{project.id}/memberships/#{membership.id}/share_contact_details",
            params: {
              membership: {
                project_contact_email: "project@example.com"
              }
            },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:ok)
      expect(json_response["data"]).to include(
        "project_contact_email" => "project@example.com",
        "project_contact_phone" => nil
      )
      expect(json_response["data"]).not_to have_key("email")
      expect(json_response["data"]["project_contact_email"]).not_to eq(
        member.email
      )
      expect(membership.reload.project_contact_phone).to be_nil

      patch "/api/permit_projects/#{project.id}/memberships/#{membership.id}/share_contact_details",
            params: {
              membership: {
                project_contact_email: "",
                project_contact_phone: "2505551212"
              }
            },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:ok)
      expect(membership.reload.project_contact_email).to be_nil
      expect(membership.project_contact_phone).to eq("+12505551212")
    end

    it "refuses another member and ignores contact fields on the standing update" do
      sign_in owner

      patch "/api/permit_projects/#{project.id}/memberships/#{membership.id}/share_contact_details",
            params: {
              membership: {
                project_contact_email: "stolen@example.com"
              }
            },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:forbidden)
      expect(membership.reload.project_contact_email).to be_nil

      patch "/api/permit_projects/#{project.id}/memberships/#{membership.id}",
            params: {
              membership: {
                project_contact_email: "stolen@example.com",
                role_tags: ["Architect"]
              }
            },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:ok)
      expect(membership.reload.project_contact_email).to be_nil
    end

    it "refuses to designate a member who has not shared a contact method" do
      sign_in owner

      patch "/api/permit_projects/#{project.id}/memberships/#{membership.id}",
            params: {
              membership: {
                contact_designation: "alternate"
              }
            },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:unprocessable_content)
      expect(membership.reload.contact_designation).to eq("none")

      membership.update!(project_contact_email: "mina@example.com")

      patch "/api/permit_projects/#{project.id}/memberships/#{membership.id}",
            params: {
              membership: {
                contact_designation: "alternate"
              }
            },
            headers: headers,
            as: :json

      expect(response).to have_http_status(:ok)
      expect(membership.reload.contact_designation).to eq("alternate")
    end
  end

  def enqueued_invitation_raw_token
    job =
      ActiveJob::Base.queue_adapter.enqueued_jobs.reverse.find do |enqueued|
        enqueued[:args][0] == "PermitHubMailer" &&
          enqueued[:args][1] == "notify_project_membership_invitation"
      end
    delivery_args = job[:args][3]
    (delivery_args["args"] || delivery_args[:args]).last
  end
end
