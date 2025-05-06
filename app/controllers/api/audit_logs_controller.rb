class Api::AuditLogsController < Api::ApplicationController
  skip_after_action :verify_policy_scoped, only: :index

  def index
    audit_logs = Audited::Audit.all.order(created_at: :desc)

    render json: audit_logs.as_json, status: :ok
  rescue NameError => e
    if e.message.include?("Audited::Audit")
      render_error(
        "audit_logs.load_error",
        message_opts: {
          error_message:
            "Could not load Audited::Audit. Ensure the 'audited' gem is configured correctly."
        },
        status: :internal_server_error
      )
    else
      raise
    end
  rescue StandardError => e
    render_error(
      "audit_logs.generic_error",
      message_opts: {
        error_message: e.message
      },
      status: :internal_server_error
    )
  end
end
