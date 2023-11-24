class Api::ApplicationController < ActionController::API
  include BaseControllerMethods

  before_action :authenticate_user!
end
