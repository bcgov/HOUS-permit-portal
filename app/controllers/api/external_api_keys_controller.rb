class Api::ExternalApiKeysController < Api::ApplicationController
  before_action :set_external_api_key, except: %i[index create]

  def index
    # Only authorized to query own jurisdiction for review managers
    if (
         current_user.review_manager? || current_user.regional_review_manager?
       ) && params[:jurisdiction_id].present? &&
         !current_user.jurisdictions.find(params[:jurisdiction_id])
      raise Pundit::NotAuthorizedError
    end

    @external_api_key =
      (
        if params[:jurisdiction_id].present?
          policy_scope(ExternalApiKey).where(
            jurisdiction_id: params[:jurisdiction_id]
          )
        else
          policy_scope(ExternalApiKey)
        end
      )

    render_success @external_api_key,
                   nil,
                   { blueprint: ExternalApiKeyBlueprint }
  end

  def show
    authorize @external_api_key

    render_success @external_api_key,
                   nil,
                   {
                     blueprint: ExternalApiKeyBlueprint,
                     blueprint_opts: {
                       view: :with_token
                     }
                   }
  end

  def create
    @external_api_key = ExternalApiKey.build(external_api_key_create_params)

    authorize @external_api_key

    if @external_api_key.save
      render_success @external_api_key,
                     "external_api_key.create_success",
                     {
                       blueprint: ExternalApiKeyBlueprint,
                       blueprint_opts: {
                         view: :with_token
                       }
                     }
    else
      render_error "external_api_key.create_error",
                   message_opts: {
                     error_message:
                       @external_api_key.errors.full_messages.join(", ")
                   }
    end
  end

  def update
    authorize @external_api_key

    if @external_api_key.update(external_api_key_update_params)
      render_success @external_api_key,
                     "external_api_key.update_success",
                     {
                       blueprint: ExternalApiKeyBlueprint,
                       blueprint_opts: {
                         view: :with_token
                       }
                     }
    else
      render_error "external_api_key.update_error",
                   message_opts: {
                     error_message:
                       @external_api_key.errors.full_messages.join(", ")
                   }
    end
  end

  def destroy
    authorize @external_api_key

    if @external_api_key.destroy
      render json: {}, status: :ok
    else
      render_error "external_api_key.delete_error",
                   message_opts: {
                     error_message:
                       @external_api_key.errors.full_messages.join(", ")
                   }
    end
  end

  def revoke
    authorize @external_api_key

    if @external_api_key.revoke
      render_success @external_api_key,
                     "external_api_key.revoke_success",
                     {
                       blueprint: ExternalApiKeyBlueprint,
                       blueprint_opts: {
                         view: :with_token
                       }
                     }
    else
      render_error "external_api_key.revoke_error",
                   message_opts: {
                     error_message:
                       @external_api_key.errors.full_messages.join(", ")
                   }
    end
  end

  private

  def set_external_api_key
    @external_api_key = ExternalApiKey.find(params[:id])
  end

  def external_api_key_create_params
    params.require(:external_api_key).permit(
      :name,
      :expired_at,
      :connecting_application,
      :notification_email,
      :jurisdiction_id,
      :webhook_url,
      :sandbox_id
    )
  end

  def external_api_key_update_params
    params.require(:external_api_key).permit(
      :name,
      :expired_at,
      :connecting_application,
      :notification_email,
      :jurisdiction_id,
      :webhook_url
    )
  end
end
