class ModelCallbackJob
  include Sidekiq::Worker
  sidekiq_options lock: :until_and_while_executing,
                  queue: :model_callbacks,
                  on_conflict: {
                    client: :log,
                    server: :reject
                  }

  def perform(model_name, model_id, callback_name)
    model = model_name.constantize.find_by_id(model_id)

    return if model.blank?

    model.send(callback_name)
  end
end
