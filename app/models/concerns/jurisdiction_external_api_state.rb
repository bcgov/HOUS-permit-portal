module JurisdictionExternalApiState
  extend ActiveSupport::Concern
  included do
    enum external_api_state: { g_off: "g_off", j_on: "j_on", j_off: "j_off" }

    # Update the after_save callback
    after_save :create_integration_mappings_async, if: :external_api_just_enabled?

    # AASM configuration
    include AASM

    aasm column: "external_api_state", enum: true do
      state :g_off, initial: true
      state :j_on
      state :j_off

      # Transition from g_off to j_on
      event :_enable_external_api do
        transitions from: :g_off, to: :j_on
      end

      # Transition from j_on to j_off
      event :_disable_external_api do
        transitions from: :j_on, to: :j_off
      end

      # Transition from j_off to j_on
      event :_enable_again_external_api do
        transitions from: :j_off, to: :j_on
      end

      # Transition from j_on or j_off to g_off
      event :_reset_external_api do
        transitions from: %i[j_on j_off], to: :g_off
      end
    end

    # Define methods to check user permissions
    # These methods will receive the user performing the action
    # We'll define a context for the user when triggering events

    # Custom methods to handle transitions with user context
    def enable_external_api!(user)
      if user.super_admin?
        _enable_external_api!
      else
        raise Pundit::NotAuthorizedError, I18n.t("misc.user_not_authorized_error")
      end
    end

    def disable_external_api!(user)
      if user.manager?
        _disable_external_api!
      else
        raise Pundit::NotAuthorizedError, I18n.t("misc.user_not_authorized_error")
      end
    end

    def enable_again_external_api!(user)
      if user.manager? || user.super_admin?
        _enable_again_external_api!
      else
        raise Pundit::NotAuthorizedError, I18n.t("misc.user_not_authorized_error")
      end
    end

    def reset_external_api!(user)
      if user.super_admin?
        _reset_external_api!
      else
        raise Pundit::NotAuthorizedError, I18n.t("misc.user_not_authorized_error")
      end
    end

    def create_integration_mappings_async
      return unless external_api_enabled?

      if Rails.env.test?
        ModelCallbackJob.new.perform(self.class.name, id, "create_integration_mappings")
      else
        ModelCallbackJob.perform_async(self.class.name, id, "create_integration_mappings")
      end
    end

    def external_api_enabled?
      j_on?
    end

    def external_api_just_enabled?
      saved_change_to_external_api_state? && external_api_state == "j_on"
    end
  end
end
