require "sidekiq/web"
require "sidekiq/cron/web"

Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  if Rails.env.production?
    Sidekiq::Web.use Rack::Auth::Basic do |username, password|
      ActiveSupport::SecurityUtils.secure_compare(
        ::Digest::SHA256.hexdigest(username),
        ::Digest::SHA256.hexdigest(ENV["SIDEKIQ_USERNAME"]),
      ) &
        ActiveSupport::SecurityUtils.secure_compare(
          ::Digest::SHA256.hexdigest(password),
          ::Digest::SHA256.hexdigest(ENV["SIDEKIQ_PASSWORD"]),
        )
    end
  end

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
               },
               controllers: {
                 sessions: "api/sessions",
                 invitations: "api/invitations",
                 omniauth_callbacks: "api/omniauth_callbacks",
               }

    devise_scope :user do
      get "/validate_token" => "sessions#validate_token"
      delete "/invitation/remove" => "invitations#remove"
      get "/invitations/:invitation_token" => "invitations#show"
    end

    get "/permit_type_submission_contacts/confirm",
        to: "permit_type_submission_contacts#confirm",
        as: :permit_type_submission_contact_confirmation

    resources :requirement_blocks, only: %i[create show update] do
      post "search", on: :collection, to: "requirement_blocks#index"
      get "auto_compliance_module_configurations",
          on: :collection,
          to: "requirement_blocks#auto_compliance_module_configurations"
    end

    resources :requirement_templates, only: %i[show create destroy update] do
      post "search", on: :collection, to: "requirement_templates#index"
      post "schedule", to: "requirement_templates#schedule", on: :member
      post "force_publish_now", to: "requirement_templates#force_publish_now", on: :member
      patch "restore", on: :member
    end

    resources :template_versions, only: %i[index show]

    get "template_versions/:id/jurisdictions/:jurisdiction_id/jurisdiction_template_version_customization" =>
          "template_versions#show_jurisdiction_template_version_cutomization"
    post "template_versions/:id/jurisdictions/:jurisdiction_id/jurisdiction_template_version_customization" =>
           "template_versions#create_or_update_jurisdiction_template_version_cutomization"
    get "template_versions/:id/download_requirement_summary_csv" => "template_versions#download_summary_csv"
    get "template_versions/:id/jurisdictions/:jurisdiction_id/download_customization_csv" =>
          "template_versions#download_customization_csv"
    get "template_versions/:id/jurisdictions/:jurisdiction_id/download_customization_json" =>
          "template_versions#download_customization_json"

    resources :jurisdictions, only: %i[index update show create] do
      post "search", on: :collection, to: "jurisdictions#index"
      post "users/search", on: :member, to: "jurisdictions#search_users"
      post "permit_applications/search", on: :member, to: "jurisdictions#search_permit_applications"
      patch "update_external_api_enabled", on: :member, to: "jurisdictions#update_external_api_enabled"
      get "locality_type_options", on: :collection
      get "jurisdiction_options", on: :collection
    end

    resources :contacts, only: %i[create] do
      get "contact_options", on: :collection
    end

    resources :permit_classifications, only: %i[index] do
      post "permit_classification_options", on: :collection
    end

    resources :geocoder, only: %i[] do
      get "site_options", on: :collection
      get "pids", on: :collection
      get "jurisdiction", on: :collection
    end

    resources :permit_applications, only: %i[create update show] do
      post "search", on: :collection, to: "permit_applications#index"
      post "submit", on: :member
      post "mark_as_viewed", on: :member
      patch "upload_supporting_document", on: :member
    end

    patch "profile", to: "users#profile"
    resources :users, only: %i[destroy update] do
      patch "restore", on: :member
      patch "accept_eula", on: :member
      post "search", on: :collection, to: "users#index"
      post "resend_confirmation", on: :member
    end

    resources :end_user_license_agreement, only: %i[index]

    resources :step_codes, only: %i[index create destroy], shallow: true do
      resources :step_code_checklists, only: %i[index show update]
    end

    post "tags/search", to: "tags#index", as: :tags_search

    get "storage/s3" => "storage#upload" # use a storage controller instead of shrine mount since we want api authentication before being able to access
    get "storage/s3/download" => "storage#download"
    delete "storage/s3/delete" => "storage#delete"

    mount Shrine.uppy_s3_multipart(:cache) => "/storage/s3/multipart" if SHRINE_USE_S3
    resources :site_configuration, only: [] do
      get :show, on: :collection
      put :update, on: :collection
    end

    resources :external_api_keys do
      post "revoke", on: :member
    end
  end

  scope module: :external_api, path: :external_api do
    resources :permit_applications, only: %i[show] do
      post "search", on: :collection, to: "permit_applications#index"
    end
  end

  root to: "home#index"

  get "/reset-password" => "home#index", :as => :reset_password
  get "/login" => "home#index", :as => :login
  get "/confirmed" => "home#index", :as => :confirmed
  get "/accept-invitation" => "home#index", :as => :accept_invitation
  get "/*path",
      to: "home#index",
      format: false,
      constraints: ->(req) { !req.path.include?("/rails") && !req.path.start_with?("/public") }
end
