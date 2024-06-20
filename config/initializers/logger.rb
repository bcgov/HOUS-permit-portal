Rails.application.configure { config.log_tags = [:request_id] } if Rails.env.production?
