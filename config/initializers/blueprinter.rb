Blueprinter.configure { |config| config.datetime_format = ->(datetime) { datetime.to_i * 1000 } }
