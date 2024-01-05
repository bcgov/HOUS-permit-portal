class DestroyAssetJob
  include Sidekiq::Worker
  sidekiq_options queue: :destroy_asset

  def perform(attacher_class, data)
    attacher_class = Object.const_get(attacher_class)
    attacher = attacher_class.from_data(data)
    attacher.destroy
  end
end
