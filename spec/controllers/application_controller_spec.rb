require "rails_helper"

RSpec.describe ApplicationController, type: :controller do
  controller(ApplicationController) do
    def index
      render plain: "ok"
    end
  end

  before { routes.draw { get "index" => "anonymous#index" } }

  it "can render a basic action" do
    get :index
    expect(response).to have_http_status(:ok)
    expect(response.body).to eq("ok")
  end
end
