# app/controllers/api/early_access_previews_controller.rb

class Api::EarlyAccessPreviewsController < Api::ApplicationController
  before_action :set_early_access_preview, only: %i[revoke unrevoke extend]

  # POST /api/early_access_previews/:id/revoke
  def revoke
    authorize @early_access_preview

    if @early_access_preview.discarded_at.present?
      render_error "early_access_preview.already_revoked"
    else
      if @early_access_preview.discard
        render_success @early_access_preview,
                       "early_access_preview.revoke_success",
                       { blueprint: EarlyAccessPreviewBlueprint }
      else
        render_error "early_access_preview.revoke_error",
                     {
                       message_opts: {
                         error_message:
                           @early_access_preview.errors.full_messages.join(", ")
                       }
                     }
      end
    end
  end

  # POST /api/early_access_previews/:id/unrevoke
  def unrevoke
    authorize @early_access_preview

    if @early_access_preview.discarded_at.blank?
      render_error "early_access_preview.not_revoked"
    else
      if @early_access_preview.undiscard
        render_success @early_access_preview,
                       "early_access_preview.unrevoke_success",
                       { blueprint: EarlyAccessPreviewBlueprint }
      else
        render_error "early_access_preview.unrevoke_error",
                     {
                       message_opts: {
                         error_message:
                           @early_access_preview.errors.full_messages.join(", ")
                       }
                     }
      end
    end
  end

  # POST /api/early_access_previews/:id/extend
  def extend
    authorize @early_access_preview

    if @early_access_preview.extend
      render_success @early_access_preview,
                     "early_access_preview.extend_success",
                     { blueprint: EarlyAccessPreviewBlueprint }
    else
      render_error "early_access_preview.extend_error",
                   {
                     message_opts: {
                       error_message:
                         @early_access_preview.errors.full_messages.join(", ")
                     }
                   }
    end
  end

  private

  # Callback to set the EarlyAccessPreview based on the ID parameter
  def set_early_access_preview
    @early_access_preview = EarlyAccessPreview.find(params[:id])
  end
end
