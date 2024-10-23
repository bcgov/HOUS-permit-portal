module BaseControllerMethods
  extend ActiveSupport::Concern

  included do
    include ActionController::Cookies
    include ActionController::RequestForgeryProtection

    protect_from_forgery with: :exception
    after_action :set_csrf_cookie
  end

  def frontend_flash_message(message_key, message_type, opts = {})
    msg =
      ArbitraryMessageConstruct.message(
        key: message_key,
        type: message_type,
        options: opts[:message_opts]
      ).to_json
    { flash: msg }
  end

  def render_success(resource, message_key = nil, opts = {})
    opts.reverse_merge!(
      { blueprint: nil, blueprint_opts: {}, status: 200, meta: {} }
    )
    message =
      (
        if message_key
          { key: message_key, type: "success", options: opts[:message_opts] }
        else
          nil
        end
      )
    meta = opts[:meta].deep_merge(default_meta(message))
    if resource.blank?
      success_payload = { data: resource, meta: meta }
      status = opts[:status] || :ok
      render json: success_payload, status: status
    else
      if opts[:blueprint].blank?
        begin
          single_resource =
            resource.respond_to?(:first) ? resource.first : resource
          model_instance =
            (
              if single_resource.respond_to?(:__getobj__)
                single_resource.__getobj__
              else
                single_resource
              end
            )
          opts[:blueprint] = "#{model_instance.class.name}Blueprint".constantize
        rescue NameError
          raise "Error - cannot infer blueprint, please pass a blueprint class in"
        end
      end
      blueprint_opts = opts[:blueprint_opts].merge({ root: "data", meta: meta })
      render json: opts[:blueprint].render(resource, blueprint_opts),
             status: opts[:status]
    end
  end

  # error_key maps to a translation key in en.yml
  def render_error(error_key = nil, opts = {}, exception = nil)
    if exception.present?
      Rails.logger.error "#{exception.message}\n#{exception.backtrace}"
    end
    opts.reverse_merge!({ status: 400, meta: {} })
    message =
      (
        if error_key
          { key: error_key, type: "error", options: opts[:message_opts] }
        else
          nil
        end
      )
    meta = opts[:meta].merge(default_meta(message))
    render json: { data: {}, meta: meta }, status: opts[:status]
  end

  def render_flash_message(message_key, message_type, opts = {})
    msg =
      ArbitraryMessageConstruct.message(
        key: message_key,
        type: message_type,
        options: opts[:message_opts]
      ).to_json
    { flash: msg }
  end

  def store_currents
    Current.user = current_user
  end

  private

  def set_csrf_cookie
    cookies["CSRF-TOKEN"] = {
      value: form_authenticity_token,
      secure: Rails.env.production?,
      httponly: false, # Allow frontend to read the cookie
      same_site: :lax
    }
  end

  private

  def default_meta(message)
    meta = {}
    meta[:message] = ArbitraryMessageConstruct.message(**message) if message
    meta
  end
end
