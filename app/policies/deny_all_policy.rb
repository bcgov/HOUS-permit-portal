class DenyAllPolicy < ApplicationPolicy
  def initialize(user_context, _record)
    super(user_context, nil)
  end

  %i[index? show? create? new? update? edit? destroy?].each do |action|
    define_method(action) { false }
  end
end
