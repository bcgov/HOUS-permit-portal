require "rails_helper"

RSpec.describe Api::PermitProjectsController, type: :controller do
  let(:jurisdiction) { create(:sub_district) }
  let(:reviewer) { create(:user, :reviewer, jurisdiction: jurisdiction) }
  let(:submitter) { create(:user) }
  let(:project) do
    create(:permit_project, jurisdiction: jurisdiction, owner: submitter)
  end

  describe "POST #transition_state" do
    context "as a reviewer" do
      before { sign_in reviewer }

      it "transitions project to a valid target state" do
        project.update_column(:state, PermitProject.states[:queued])

        post :transition_state,
             params: {
               id: project.id,
               target_state: "in_progress"
             }

        expect(response).to have_http_status(:success)
        expect(project.reload.state).to eq("in_progress")
      end

      it "returns forbidden for draft project (not visible to reviewers)" do
        project.update_column(:state, PermitProject.states[:draft])

        post :transition_state,
             params: {
               id: project.id,
               target_state: "queued"
             }

        expect(response).to have_http_status(:forbidden)
        expect(project.reload.state).to eq("draft")
      end

      it "returns error for nonexistent target state" do
        project.update_column(:state, PermitProject.states[:queued])

        post :transition_state,
             params: {
               id: project.id,
               target_state: "bogus"
             }

        expect(response).to have_http_status(422)
      end

      it "transitions from waiting to any valid manual target" do
        project.update_column(:state, PermitProject.states[:waiting])

        post :transition_state,
             params: {
               id: project.id,
               target_state: "queued"
             }

        expect(response).to have_http_status(:success)
        expect(project.reload.state).to eq("queued")
      end

      it "transitions from closed to queued (reopen escape hatch)" do
        project.update_column(:state, PermitProject.states[:closed])

        post :transition_state,
             params: {
               id: project.id,
               target_state: "queued"
             }

        expect(response).to have_http_status(:success)
        expect(project.reload.state).to eq("queued")
      end
    end

    context "as a submitter (unauthorized)" do
      before { sign_in submitter }

      it "returns forbidden" do
        project.update_column(:state, PermitProject.states[:queued])

        post :transition_state,
             params: {
               id: project.id,
               target_state: "in_progress"
             }

        expect(response).to have_http_status(:forbidden).or have_http_status(
               :unauthorized
             )
      end
    end
  end
end
