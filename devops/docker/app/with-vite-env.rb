require "json"

begin
  frontend = JSON.parse(ENV.fetch("FRONTEND_BUILD_ENV_JSON", "{}"))
rescue JSON::ParserError
  abort "Frontend configuration must be valid JSON"
end
unless frontend.is_a?(Hash) &&
         frontend.all? { |name, value|
           name.match?(/\AVITE_[A-Z0-9_]+\z/) && value.is_a?(String)
         }
  abort "Frontend configuration must contain only VITE_ names and string values"
end

abort "Usage: with-vite-env.rb command [args...]" if ARGV.empty?

ENV.delete("FRONTEND_BUILD_ENV_JSON")
exec(frontend, *ARGV)
