class Part3StepCodePolicy < StepCodePolicy
  def qa_autofill?
    return false unless ENV["VITE_QA_MODE"] == "true"
    return false unless SiteConfiguration.qa_tools_enabled?

    update?
  end
end
