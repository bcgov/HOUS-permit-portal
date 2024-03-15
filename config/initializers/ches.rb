require File.expand_path("../../../lib/ches_email_delivery.rb", __FILE__)
ActionMailer::Base.add_delivery_method :ches, ChesEmailDelivery
