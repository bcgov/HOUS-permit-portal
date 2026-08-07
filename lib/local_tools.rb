# frozen_string_literal: true

# Local-only console helpers. Refuses to run outside development/test.
#
#   LocalTools.help
#   LocalTools.reindex_all
#   LocalTools.reindex(PermitApplication)
#   LocalTools.cache_clear
class LocalTools
  class NotLocalError < StandardError
  end

  class << self
    def help
      ensure_local!
      puts <<~HELP
        LocalTools (development/test only)
          .reindex_all          Full Searchkick reindex of all models
          .reindex(Model)       Reindex one Searchkick model (Class or name)
          .cache_clear          Rails.cache.clear
          .help                 This list
      HELP
      nil
    end

    def reindex_all
      ensure_local!
      models = searchkick_models
      puts "Reindexing #{models.size} models..."
      models.each do |model|
        puts "  #{model.name}..."
        model.reindex
      end
      puts "Done."
      models.map(&:name)
    end

    def reindex(model)
      ensure_local!
      klass = model.is_a?(Class) ? model : model.to_s.constantize
      unless searchkick_models.include?(klass)
        raise ArgumentError, "#{klass.name} is not a Searchkick model"
      end

      puts "Reindexing #{klass.name}..."
      klass.reindex
      puts "Done."
      klass.name
    end

    def cache_clear
      ensure_local!
      Rails.cache.clear
      puts "Rails.cache cleared."
      true
    end

    private

    def ensure_local!
      return if Rails.env.local?

      raise NotLocalError,
            "LocalTools is only available in development/test (current: #{Rails.env})"
    end

    # Searchkick registers models lazily; eager load so the list is complete.
    def searchkick_models
      if Rails.respond_to?(:autoloaders) && Rails.autoloaders.zeitwerk_enabled?
        Zeitwerk::Loader.eager_load_all
      else
        Rails.application.eager_load!
      end
      Searchkick.models
    end
  end
end
