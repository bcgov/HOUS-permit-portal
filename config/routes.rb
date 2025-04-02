require "sidekiq/web"
require "sidekiq/cron/web"

Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  if Rails.env.production?
    Sidekiq::Web.use Rack::Auth::Basic do |username, password|
      ActiveSupport::SecurityUtils.secure_compare(
        ::Digest::SHA256.hexdigest(username),
        ::Digest::SHA256.hexdigest(ENV["SIDEKIQ_USERNAME"])
      ) &
        ActiveSupport::SecurityUtils.secure_compare(
          ::Digest::SHA256.hexdigest(password),
          ::Digest::SHA256.hexdigest(ENV["SIDEKIQ_PASSWORD"])
        )
    end
  end

  mount Sidekiq::Web => "/sidekiq"
  mount Rswag::Ui::Engine => "/integrations/api_docs"
  mount Rswag::Api::Engine => "/integrations/api_docs"
  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", :as => :rails_health_check

  scope module: :api, path: :api do
    devise_for :users,
               defaults: {
                 format: :json
               },
               path: "",
               path_names: {
                 sign_in: "login",
                 sign_out: "logout"
               },
               controllers: {
                 sessions: "api/sessions",
                 invitations: "api/invitations",
                 omniauth_callbacks: "api/omniauth_callbacks"
               }

    devise_scope :user do
      get "/validate_token" => "sessions#validate_token"
      delete "/invitation/remove" => "invitations#remove"
      get "/invitations/:invitation_token" => "invitations#show"
      get "/logout" => "sessions#destroy"
    end

    get "/permit_type_submission_contacts/confirm",
        to: "permit_type_submission_contacts#confirm",
        as: :permit_type_submission_contact_confirmation

    resources :requirement_blocks, only: %i[create show update destroy] do
      post "restore", on: :member, to: "requirement_blocks#restore"
      post "search", on: :collection, to: "requirement_blocks#index"
      get "auto_compliance_module_configurations",
          on: :collection,
          to: "requirement_blocks#auto_compliance_module_configurations"
    end

    resources :notifications, only: %i[index] do
      post "reset_last_read",
           on: :collection,
           to: "notifications#reset_last_read"
    end

    resources :notifications, only: %i[index] do
      post "reset_last_read",
           on: :collection,
           to: "notifications#reset_last_read"
    end

    resources :requirement_templates, only: %i[show create destroy update] do
      post "search", on: :collection, to: "requirement_templates#index"
      post "schedule", to: "requirement_templates#schedule", on: :member
      post "force_publish_now",
           to: "requirement_templates#force_publish_now",
           on: :member
      post "invite_previewers",
           to: "requirement_templates#invite_previewers",
           on: :member
      patch "restore", on: :member
      post "template_versions/:id/unschedule",
           on: :collection,
           to: "requirement_templates#unschedule_template_version"
      post "copy", on: :collection
    end

    resources :early_access_previews do
      member do
        post :revoke_access
        post :unrevoke_access
        post :extend_access
      end
    end

    resources :template_versions, only: %i[index show] do
      get "compare_requirements",
          to: "template_versions#compare_requirements",
          on: :member
      get "download_requirement_summary_csv",
          to: "template_versions#download_summary_csv",
          on: :member

      member do
        resources :jurisdictions, only: [] do
          get "jurisdiction_template_version_customization",
              to:
                "template_versions#show_jurisdiction_template_version_customization"
          post "jurisdiction_template_version_customization",
               to:
                 "template_versions#create_or_update_jurisdiction_template_version_customization"
          post "jurisdiction_template_version_customization/promote",
               to:
                 "template_versions#promote_jurisdiction_template_version_customization"
          post "copy_jurisdiction_template_version_customization",
               to:
                 "template_versions#copy_jurisdiction_template_version_customization"
          get "download_customization_csv",
              to: "template_versions#download_customization_csv"
          get "download_customization_json",
              to: "template_versions#download_customization_json"
          get "integration_mapping",
              to: "template_versions#show_integration_mapping"
        end
      end
    end

    resources :integration_mappings, only: [:update]

    resources :jurisdictions, only: %i[index update show create] do
      post "search", on: :collection, to: "jurisdictions#index"
      post "users/search", on: :member, to: "jurisdictions#search_users"
      post "permit_applications/search",
           on: :member,
           to: "jurisdictions#search_permit_applications"
      patch "update_external_api_enabled",
            on: :member,
            to: "jurisdictions#update_external_api_enabled"
      get "locality_type_options", on: :collection
      get "jurisdiction_options", on: :collection
    end

    resources :contacts, only: %i[create update destroy] do
      get "contact_options", on: :collection
    end

    resources :permit_classifications, only: %i[index] do
      post "permit_classification_options", on: :collection
    end

    resources :geocoder, only: %i[] do
      get "site_options", on: :collection
      get "pids", on: :collection
      get "jurisdiction", on: :collection
      get "pin", on: :collection
      get "pid_details", on: :collection
    end

    resources :permit_applications, only: %i[create update show] do
      post "generate_missing_pdfs",
           on: :member,
           to: "permit_applications#generate_missing_pdfs"
      post "permit_collaborations",
           on: :member,
           to: "permit_applications#create_permit_collaboration"
      post "permit_block_status",
           on: :member,
           to: "permit_applications#create_or_update_permit_block_status"
      delete "permit_collaborations/remove_collaborator_collaborations",
             on: :member,
             to: "permit_applications#remove_collaborator_collaborations"
      post "permit_collaborations/invite",
           on: :member,
           to: "permit_applications#invite_new_collaborator"
      post "search", on: :collection, to: "permit_applications#index"
      post "submit", on: :member
      post "mark_as_viewed", on: :member
      patch "upload_supporting_document", on: :member
      patch "update_version", on: :member
      patch "revision_requests",
            on: :member,
            to: "permit_applications#update_revision_requests"
      post "revision_requests/finalize",
           on: :member,
           to: "permit_applications#finalize_revision_requests"
      get "download_application_metrics_csv",
          on: :collection,
          to: "permit_applications#download_application_metrics_csv"
    end

    resources :permit_collaborations, only: %i[destroy] do
      post "reinvite", on: :member, to: "permit_collaborations#reinvite"
    end

    patch "profile", to: "users#profile"

    resources :users, only: %i[] do
      get "current_user/license_agreements",
          on: :collection,
          to: "users#license_agreements"
      get "super_admins", on: :collection, to: "users#super_admins"
    end
    resources :users, only: %i[destroy update] do
      patch "restore", on: :member
      patch "accept_eula", on: :member
      post "search", on: :collection, to: "users#index"
      post "resend_confirmation", on: :member
      post "reinvite", on: :member
      post "accept_invitation", on: :member
    end

    resources :end_user_license_agreement, only: %i[index]

    resources :step_codes, only: %i[index create destroy], shallow: true do
      resources :step_code_checklists, only: %i[index show update]
      get "download_step_code_summary_csv",
          on: :collection,
          to: "step_codes#download_step_code_summary_csv"
    end

    post "tags/search", to: "tags#index", as: :tags_search

    get "storage/s3" => "storage#upload" # use a storage controller instead of shrine mount since we want api authentication before being able to access
    get "storage/s3/download" => "storage#download"
    delete "storage/s3/delete" => "storage#delete"

    if SHRINE_USE_S3
      mount Shrine.uppy_s3_multipart(:cache) => "/storage/s3/multipart"
    end
    resources :site_configuration, only: [] do
      get :show, on: :collection
      put :update, on: :collection
    end

    resources :external_api_keys do
      post "revoke", on: :member
    end

    resources :collaborators, only: %i[] do
      collection do
        resources :collaboratorable, only: %i[] do
          post "search", to: "collaborators#collaborator_search"
        end
      end
    end
  end

  scope module: :external_api, path: :external_api do
    namespace :v1 do
      resources :permit_applications, only: %i[show] do
        post "search", on: :collection, to: "permit_applications#index"
        collection do
          resources :versions, as: "template_versions", only: [] do
            get "integration_mapping",
                to: "permit_applications#show_integration_mapping"
          end
        end
      end
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
      constraints: ->(req) do
        !req.path.include?("/rails") && !req.path.start_with?("/public")
      end
end
