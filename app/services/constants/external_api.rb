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
  end
end
