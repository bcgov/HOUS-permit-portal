module Constants
  module ExternalApi
    PARTNER_SYSTEM_ACTOR = "Partner system"

    APPLICATION_STATUS_LABELS = {
      "new_draft" => "Draft",
      "newly_submitted" => "Submitted",
      "in_review" => "In review",
      "revisions_requested" => "Revisions requested",
      "resubmitted" => "Resubmitted",
      "approved" => "Approved",
      "issued" => "Issued",
      "withdrawn" => "Withdrawn"
    }.freeze

    PARTNER_WRITABLE_APPLICATION_STATUSES = %w[
      in_review
      approved
      issued
      withdrawn
      revisions_requested
    ].freeze

    PROJECT_STATE_LABELS = {
      "draft" => "Draft",
      "queued" => "Queued",
      "waiting" => "Waiting",
      "in_progress" => "In progress",
      "ready" => "Ready",
      "permit_issued" => "Permit issued",
      "active" => "Active",
      "complete" => "Completed",
      "closed" => "Closed"
    }.freeze

    def self.available_statuses_for(permit_application)
      current = permit_application.status.to_sym
      PARTNER_WRITABLE_APPLICATION_STATUSES.select do |code|
        status_reachable?(current, code)
      end
    end

    def self.status_reachable?(current, code)
      event_name =
        if code == "revisions_requested"
          :finalize_revision_requests
        else
          PermitApplicationStatus::STATUS_EVENT_MAP[code]
        end
      return false if event_name.nil?

      event =
        PermitApplication.aasm.events.find do |candidate|
          candidate.name == event_name
        end
      return false if event.nil?

      event
        .transitions_from_state(current)
        .any? { |transition| transition.to.to_sym == code.to_sym }
    end
    private_class_method :status_reachable?
  end
end
