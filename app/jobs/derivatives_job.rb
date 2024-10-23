class DerivativesJob
  include Sidekiq::Worker
  sidekiq_options queue: :file_processing

  def perform(attacher_class, record_class, record_id, name, file_data)
    attacher_class = Object.const_get(attacher_class)
    record = Object.const_get(record_class).find(record_id) # if using Active Record

    attacher =
      attacher_class.retrieve(model: record, name: name, file: file_data)
    attacher.create_derivatives # perform processing
    attacher.atomic_promote
  rescue Shrine::AttachmentChanged, ActiveRecord::RecordNotFound
    attacher&.destroy_attached # delete now orphaned derivatives
  end
end
