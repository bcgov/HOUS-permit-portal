# Keep real search in explicitly tagged examples. Non-search specs still exercise
# application callbacks, but stop at the Elasticsearch indexing boundary.
module SearchSpecSupport
  class << self
    attr_accessor :enabled, :callbacks, :explicit_indexing, :touched, :indexes

    def indexing?
      enabled && (callbacks || explicit_indexing)
    end

    def clear(index)
      # Delete by query only sees documents that have already been refreshed.
      index.refresh
      Searchkick.client.delete_by_query(
        index: index.name,
        body: {
          query: {
            match_all: {
            }
          }
        },
        refresh: true,
        conflicts: "proceed"
      )
    end
  end

  module IndexIsolation
    def reindex(...)
      return true unless SearchSpecSupport.indexing?
      SearchSpecSupport.touched&.add(name)
      super
    end

    def refresh
      return unless SearchSpecSupport.enabled
      super
    end
  end

  module SearchIsolation
    def search(...)
      unless SearchSpecSupport.enabled
        raise "Real Elasticsearch queries require search: true on the example/context"
      end
      super
    end
  end

  def reindex_search(*models)
    unless SearchSpecSupport.enabled
      raise "reindex_search requires search: true"
    end
    previous = SearchSpecSupport.explicit_indexing
    SearchSpecSupport.explicit_indexing = true
    models.each do |model|
      SearchSpecSupport.clear(model.search_index)
      model.all.reindex(refresh: true)
    end
  ensure
    SearchSpecSupport.explicit_indexing = previous
  end

  # Searchkick reports policy-filtered hits as missing rows.
  def silence_policy_filtered_search_warning(*records)
    prefix = "Records in search index do not exist in database: "
    expected_hits =
      records.map { |record| "#{record.class.model_name} #{record.id}" }.sort

    allow(Searchkick).to receive(:warn).and_wrap_original do |warn, message|
      if message.start_with?(prefix) &&
           message.delete_prefix(prefix).split(", ").sort == expected_hits &&
           records.all? { |record| record.class.unscoped.exists?(record.id) }
        next
      end

      warn.call(message)
    end
  end
end

RSpec.configure do |config|
  config.include SearchSpecSupport

  config.before(:suite) do
    Searchkick.disable_callbacks
    DatabaseCleaner.clean_with(:truncation)
    unless RSpec.world.filtered_examples.values.flatten.any? { |example|
             example.metadata[:search]
           }
      next
    end

    Rails.application.eager_load!
    SearchSpecSupport.enabled = SearchSpecSupport.explicit_indexing = true
    models = Searchkick.models.uniq { |model| model.search_index.name }
    SearchSpecSupport.indexes = models.map(&:search_index)
    models.each(&:reindex)
  ensure
    SearchSpecSupport.enabled = SearchSpecSupport.explicit_indexing = false
  end

  config.after(:suite) do
    SearchSpecSupport.indexes&.each do |index|
      index.all_indices.each { |name| Searchkick::Index.new(name).delete }
    end
  end

  config.around do |example|
    SearchSpecSupport.enabled = !!example.metadata[:search]
    SearchSpecSupport.callbacks =
      example.metadata.fetch(:search_callbacks, true)
    SearchSpecSupport.touched = Set.new
    mode = SearchSpecSupport.indexing? ? nil : false
    Searchkick.callbacks(mode) { example.run }
  ensure
    begin
      SearchSpecSupport.touched&.each do |name|
        SearchSpecSupport.clear(Searchkick::Index.new(name))
      end
    ensure
      SearchSpecSupport.enabled = SearchSpecSupport.explicit_indexing = false
      SearchSpecSupport.touched = nil
    end
  end
end
