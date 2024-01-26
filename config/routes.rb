require "sidekiq/web"

Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  mount Sidekiq::Web => "/sidekiq"
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
                 invitations: "api/invitations",
                 omniauth_callbacks: "api/omniauth_callbacks",
               }

    devise_scope :user do
      get "/validate_token" => "sessions#validate_token"
      delete "/invitation/remove" => "invitations#remove"
      put "/invitation/resend" => "invitations#resend"
      get "/validate_invitation_token" => "invitations#validate_invitation_token"
    end

    resources :requirement_blocks, only: %i[create show update] do
      post "search", on: :collection, to: "requirement_blocks#index"
    end

    resources :requirement_templates, only: %i[create] do
      post "search", on: :collection, to: "requirement_templates#index"
    end

    resources :jurisdictions, only: %i[index show create] do
      post "search", on: :collection, to: "jurisdictions#index"
      post "users/search", on: :member, to: "jurisdictions#search_users"
      get "locality_type_options", on: :collection
    end

    resources :permit_classifications, only: %i[] do
      get "permit_type_options", on: :collection
      get "activity_options", on: :collection
    end

    resources :permit_applications, only: %i[index create show update]

    resource :profile, only: [:update], controller: "users"
    post "tags/search", to: "tags#index", as: :tags_search
  end

  root to: "home#index"

  get "/reset-password" => "home#index", :as => :reset_password
  get "/login" => "home#index", :as => :login
  get "/accept-invitation" => "home#index", :as => :accept_invitation
  get "/*path", to: "home#index", format: false, constraints: ->(req) { !req.path.include?("/rails") }
end
