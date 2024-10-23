# epoch in milliseconds needed for js FE
Blueprinter.configure do |config|
  config.datetime_format = ->(datetime) do
    (datetime.respond_to?(:to_i) ? datetime.to_i : datetime.to_time.to_i) * 1000
  end
end
