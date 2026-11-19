class UserContext
  attr_reader :user, :sandbox

  def initialize(user, sandbox)
    @user = user
    @sandbox = sandbox
  end

  def access
    @access ||= Access.new(self)
  end
end
