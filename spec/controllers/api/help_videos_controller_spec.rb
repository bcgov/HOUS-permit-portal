require "rails_helper"

RSpec.describe Api::HelpVideosController, type: :controller do
  describe "GET #index" do
    it "returns only published videos for public users" do
      published = create(:help_video, :published)
      create(:help_video)

      get :index, format: :json

      expect(response).to have_http_status(:ok)
      expect(json_response["data"].pluck("id")).to contain_exactly(published.id)
      expect(json_response.dig("data", 0)).not_to have_key("video_url")
      expect(json_response.dig("data", 0)).not_to have_key("caption_url")
    end
  end

  describe "GET #show" do
    it "returns a published video without authentication" do
      video = create(:help_video, :published)

      get :show, params: { id: video.id }, format: :json

      expect(response).to have_http_status(:ok)
      expect(json_response.dig("data", "id")).to eq(video.id)
    end

    it "returns a published video by slug" do
      video =
        create(
          :help_video,
          :published,
          title: "Submitting a Permit Application"
        )

      get :show, params: { id: video.slug }, format: :json

      expect(response).to have_http_status(:ok)
      expect(json_response.dig("data", "id")).to eq(video.id)
      expect(json_response.dig("data", "slug")).to eq(
        "submitting-a-permit-application"
      )
    end

    it "does not return an unpublished video to public users" do
      video = create(:help_video)

      get :show, params: { id: video.id }, format: :json

      expect(response).to have_http_status(:forbidden)
    end

    it "returns inline signed playback URLs" do
      video = create(:help_video, :published)
      create(:help_video_transcript_document, help_video: video)
      allow_any_instance_of(HelpVideoVideoDocument).to receive(:file_url).with(
        disposition: "inline",
        response_content_type: "video/mp4"
      ).and_return("https://example.com/video.mp4")
      allow_any_instance_of(HelpVideoCaptionDocument).to receive(
        :file_url
      ).with(
        disposition: "inline",
        response_content_type: "text/vtt"
      ).and_return("https://example.com/captions.vtt")
      allow_any_instance_of(HelpVideoTranscriptDocument).to receive(
        :file_url
      ).with(disposition: "attachment").and_return(
        "https://example.com/transcript.pdf"
      )

      get :show, params: { id: video.id }, format: :json

      expect(json_response.dig("data", "video_url")).to eq(
        "https://example.com/video.mp4"
      )
      expect(json_response.dig("data", "caption_url")).to eq(
        "https://example.com/captions.vtt"
      )
      expect(json_response.dig("data", "transcript_url")).to eq(
        "https://example.com/transcript.pdf"
      )
    end
  end

  describe "POST #publish" do
    let(:super_admin) { create(:user, :super_admin) }

    before { sign_in super_admin }

    it "publishes a video with required documents" do
      video = create(:help_video, :with_required_documents)

      post :publish, params: { id: video.id }, format: :json

      expect(response).to have_http_status(:ok)
      expect(video.reload).to be_published
    end

    it "does not publish a video without captions" do
      video = create(:help_video)
      create(:help_video_video_document, help_video: video)

      post :publish, params: { id: video.id }, format: :json

      expect(response).to have_http_status(:bad_request)
      expect(video.reload).not_to be_published
    end
  end

  describe "PATCH #update" do
    it "prevents non-super admins from managing videos" do
      user = create(:user)
      video = create(:help_video)
      sign_in user

      patch :update,
            params: {
              id: video.id,
              help_video: {
                title: "Updated title"
              }
            },
            format: :json

      expect(response).to have_http_status(:forbidden)
    end
  end
end
