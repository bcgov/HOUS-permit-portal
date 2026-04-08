module PolicySpecHelpers
  def policy_for(policy_class, user:, record:, sandbox:)
    policy_class.new(UserContext.new(user, sandbox), record)
  end

  def scope_for(policy_class, user:, scope:, sandbox:)
    policy_class::Scope.new(UserContext.new(user, sandbox), scope).resolve
  end

  def external_api_policy_for(policy_class, external_api_key:, record:)
    policy_class.new(external_api_key, record)
  end
end
