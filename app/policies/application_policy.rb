# frozen_string_literal: true

class ApplicationPolicy
  attr_reader :user, :sandbox, :record

  def initialize(user_context, record)
    @user = user_context.user
    @sandbox = user_context.sandbox
    @record = record
  end

  def index?
    false
  end

  def show?
    false
  end

  def create?
    false
  end

  def new?
    create?
  end

  def update?
    false
  end

  def edit?
    update?
  end

  def destroy?
    false
  end

  class Scope
    attr_accessor :user, :sandbox, :scope

    def initialize(user_context, scope)
      @user = user_context.user
      @sandbox = user_context.sandbox
      @scope = scope
    end

    def resolve
      scope.all
    end
  end
end
