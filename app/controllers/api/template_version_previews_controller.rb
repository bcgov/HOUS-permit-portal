# app/controllers/api/template_version_previews_controller.rb

class Api::TemplateVersionPreviewsController < Api::ApplicationController
  before_action :set_template_version_preview,
                only: %i[revoke_access unrevoke_access extend_access]

  # POST /api/template_version_previews/:id/revoke_access
  def revoke_access
    authorize @template_version_preview.template_version, :update?

    if @template_version_preview.discarded_at.present?
      render_error "template_version_preview.already_revoked"
    else
      if @template_version_preview.discard
        render_success @template_version_preview,
                       "template_version_preview.revoke_success",
                       { blueprint: TemplateVersionPreviewBlueprint }
      else
        render_error "template_version_preview.revoke_error",
                     {
                       message_opts: {
                         error_message:
                           @template_version_preview.errors.full_messages.join(
                             ", "
                           )
                       }
                     }
      end
    end
  end

  # POST /api/template_version_previews/:id/unrevoke_access
  def unrevoke_access
    authorize @template_version_preview.template_version, :update?

    if @template_version_preview.discarded_at.blank?
      render_error "template_version_preview.not_revoked"
    else
      if @template_version_preview.undiscard
        render_success @template_version_preview,
                       "template_version_preview.unrevoke_success",
                       { blueprint: TemplateVersionPreviewBlueprint }
      else
        render_error "template_version_preview.unrevoke_error",
                     {
                       message_opts: {
                         error_message:
                           @template_version_preview.errors.full_messages.join(
                             ", "
                           )
                       }
                     }
      end
    end
  end

  # POST /api/template_version_previews/:id/extend_access
  def extend_access
    authorize @template_version_preview.template_version, :update?

    if @template_version_preview.extend_access
      render_success @template_version_preview,
                     "template_version_preview.extend_success",
                     { blueprint: TemplateVersionPreviewBlueprint }
    else
      render_error "template_version_preview.extend_error",
                   {
                     message_opts: {
                       error_message:
                         @template_version_preview.errors.full_messages.join(
                           ", "
                         )
                     }
                   }
    end
  end

  private

  def set_template_version_preview
    @template_version_preview = TemplateVersionPreview.find(params[:id])
  end
end
