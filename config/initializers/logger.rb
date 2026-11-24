# Configure logs so that we get request-id (log tags configured in application.rb)
# Tests configure their own logger in config/environments/test.rb.
unless Rails.env.test?
  Rails.application.config.logger =
    ActiveSupport::TaggedLogging.new(
      ActiveSupport::Logger
        .new(STDOUT)
        .tap do |logger|
          logger.formatter =
            proc do |severity, datetime, progname, msg|
              "#{severity} [#{datetime}]: #{msg}\n"
            end
        end
    )

  Rails.logger = Rails.application.config.logger
end
