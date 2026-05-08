require "rails_helper"

RSpec.describe Api::HelpVideoSectionsController, type: :controller do
  describe "GET #index" do
    it "returns published sections ordered by section and video sort order" do
      later_section = create(:help_video_section, sort_order: 2)
      earlier_section = create(:help_video_section, sort_order: 1)
      later_video =
        create(
          :help_video,
          :published,
          help_video_section: earlier_section,
          sort_order: 2
        )
      earlier_video =
        create(
          :help_video,
          :published,
          help_video_section: earlier_section,
          sort_order: 1
        )
      create(:help_video, :published, help_video_section: later_section)
      draft_section = create(:help_video_section, sort_order: 0)
      create(:help_video, help_video_section: draft_section)

      get :index, format: :json

      expect(response).to have_http_status(:ok)
      expect(json_response["data"].pluck("id")).to eq(
        [earlier_section.id, later_section.id]
      )
      expect(json_response.dig("data", 0, "help_videos").pluck("id")).to eq(
        [earlier_video.id, later_video.id]
      )
    end
  end

  describe "POST #create" do
    it "allows super admins to create sections" do
      sign_in create(:user, :super_admin)

      post :create,
           params: {
             help_video_section: {
               title: "Getting started",
               sort_order: 1
             }
           },
           format: :json

      expect(response).to have_http_status(:ok)
      expect(HelpVideoSection.find_by(title: "Getting started")).to be_present
    end

    it "prevents non-super admins from creating sections" do
      sign_in create(:user)

      post :create,
           params: {
             help_video_section: {
               title: "Getting started"
             }
           },
           format: :json

      expect(response).to have_http_status(:forbidden)
    end
  end
end
