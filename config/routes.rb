Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", :as => :rails_health_check

  scope module: :api, path: :api do
    devise_for :users,
               defaults: {
                 format: :json,
               },
               path: "",
               path_names: {
                 sign_in: "login",
                 sign_out: "logout",
                 registration: "signup",
               },
               controllers: {
                 sessions: "api/sessions",
                 registrations: "api/registrations",
                 confirmations: "api/confirmations",
                 passwords: "api/passwords",
               }

    devise_scope :user do
      get "/validate_token" => "sessions#validate_token"
    end
  end

  root to: "home#index"

  get "/reset-password" => "home#index", :as => :reset_password
  get "/login" => "home#index", :as => :login
  get "/*path", to: "home#index", format: false, constraints: ->(req) { !req.path.include?("/rails") }
end
