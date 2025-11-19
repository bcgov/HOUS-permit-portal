module CurrentSandbox
  extend ActiveSupport::Concern

  # Method to retrieve the current sandbox ID from request headers
  def current_sandbox
    if current_user.blank? || current_user.submitter?
      @current_sandbox = nil
    else
      @current_sandbox ||= Sandbox.find_by_id(request.headers["X-Sandbox-ID"])
    end
  end
end
