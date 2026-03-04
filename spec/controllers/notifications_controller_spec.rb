require "rails_helper"

RSpec.describe Api::NotificationsController, type: :controller do
  let(:user) { create(:user) }

  before { sign_in user }

  describe "GET #index" do
    it "returns notifications with feed metadata" do
      feed_object =
        instance_double(
          "SimpleFeedObject",
          unread_count: 3,
          last_read: Time.zone.now
        )
      feed_items = [
        OpenStruct.new(
          id: "1",
          action_type: "event",
          action_text: "A",
          object_data: {
          }
        )
      ]

      allow(NotificationService).to receive(:user_feed_for).and_return(
        { feed_items: feed_items, total_pages: 2, feed_object: feed_object }
      )

      get :index, params: { page: 1 }, format: :json

      expect(response).to have_http_status(:ok)
      expect(json_response["meta"]["total_pages"]).to eq(2)
      expect(json_response["meta"]["unread_count"]).to eq(3)
      expect(json_response["data"].length).to eq(1)
    end
  end

  describe "POST #reset_last_read" do
    it "resets the current user's notification feed last_read timestamp" do
      allow(NotificationService).to receive(:reset_user_feed_last_read)

      post :reset_last_read, format: :json

      expect(response).to have_http_status(:ok)
      expect(NotificationService).to have_received(
        :reset_user_feed_last_read
      ).with(user.id)
      expect(json_response["meta"]["last_read_at"]).to be_present
    end
  end
end
