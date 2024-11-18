# frozen_string_literal: true

class ExternalApi::ApplicationPolicy
  attr_reader :external_api_key, :record, :sandbox

  def initialize(external_api_key, record)
    @external_api_key = external_api_key
    @sandbox = external_api_key.sandbox
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
    attr_accessor :external_api_key, :scope

    def initialize(external_api_key, scope)
      @external_api_key = external_api_key
      @scope = scope
    end

    def resolve
      scope.all
    end
  end
end
