require "logger"

class MultiLogger < Logger
  def initialize(*loggers)
    @loggers = loggers
  end

  def add(severity, message = nil, progname = nil, &block)
    @loggers.each { |logger| logger.add(severity, message, progname, &block) }
  end
end
