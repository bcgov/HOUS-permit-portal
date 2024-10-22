module JurisdictionExternalApiState
  extend ActiveSupport::Concern
  included do
    enum external_api_state: { g_off: "g_off", j_on: "j_on", j_off: "j_off" }

    # Update the after_save callback
    after_save :create_integration_mappings_async,
               if: :external_api_just_enabled?

    # AASM configuration
    include AASM

    aasm column: "external_api_state", enum: true do
      state :g_off, initial: true ## global off
      state :j_on ## jurisdiction on
      state :j_off ## jurisdiction off

      # Transition from g_off or j_off to j_on
      event :_enable_external_api do
        transitions from: %i[g_off j_off], to: :j_on
      end

      # Transition from j_on to j_off
      event :_disable_external_api do
        transitions from: :j_on, to: :j_off
      end

      # Transition from j_on or j_off to g_off
      event :_reset_external_api do
        transitions from: %i[j_on j_off], to: :g_off
      end
    end

    def update_external_api_state!(enable_external_api:, allow_reset: false)
      # if the external API is already in the desired state, return
      if (enable_external_api && j_on?) || (!enable_external_api && g_off?) ||
           (!enable_external_api && j_off? && !allow_reset)
        return
      end

      desired_event =
        if enable_external_api
          :_enable_external_api
        else
          allow_reset ? :_reset_external_api : :_disable_external_api
        end

      self.aasm.fire!(desired_event)
    end

    def create_integration_mappings_async
      return unless external_api_enabled?

      if Rails.env.test?
        ModelCallbackJob.new.perform(
          self.class.name,
          id,
          "create_integration_mappings"
        )
      else
        ModelCallbackJob.perform_async(
          self.class.name,
          id,
          "create_integration_mappings"
        )
      end
    end

    def external_api_enabled?
      j_on?
    end

    def external_api_just_enabled?
      saved_change_to_external_api_state? && j_on?
    end
  end
end
