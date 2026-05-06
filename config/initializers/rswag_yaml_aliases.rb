Rails.application.config.after_initialize do
  unless Rswag::Api::Middleware.private_method_defined?(:load_yaml)
    Rails.logger.warn("Rswag monkey-patch may be outdated: load_yaml not found")
  end

  Rswag::Api::Middleware.prepend(
    Module.new do
      private

      def load_yaml(filename)
        YAML.safe_load(File.read(filename), aliases: true)
      end
    end
  )
end
