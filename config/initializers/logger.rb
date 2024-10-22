# Configure logs so that we get request-id (log tags configured in application.rb)
Rails.application.config.logger =
  ActiveSupport::TaggedLogging.new(
    ActiveSupport::Logger
      .new(STDOUT)
      .tap do |logger|
        logger.formatter =
          proc do |severity, datetime, progname, msg|
            tags =
              (Thread.current[:activesupport_tagged_logging_tags] || []).join(
                " "
              )
            "#{severity} [#{datetime}] #{tags}: #{msg}\n"
          end
      end
  )

Rails.logger = Rails.application.config.logger
