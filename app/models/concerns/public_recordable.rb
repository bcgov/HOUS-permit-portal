module PublicRecordable
  # This concern handles data retention when a user is deleted. It does NOT
  # mean the record is publicly available to the internet.
  #
  # remember_user! copies the person's name. That is display only.
  # abandon! also stamps orphaned_at (and discarded_at when the model uses
  # Discard) and starts the OrphanCleanupJob clock. An orphaned record is
  # immutable until that job deletes it.
  #
  # Project work is abandoned with the project, when account deletion leaves
  # no Full member. A license agreement is abandoned with the user. A name
  # remembered on an application or a revision request does not start a clock.
  extend ActiveSupport::Concern

  # Thread-safe storage for models
  mattr_accessor :recordable_models, default: []

  included do
    class_attribute :public_recordable_user_association

    # Register the model when included
    PublicRecordable.recordable_models << self

    before_update :prevent_updates_if_orphaned
  end

  def public_record?
    raise NotImplementedError,
          "#{self.class.name} must implement #public_record? to include PublicRecordable"
  end

  class_methods do
    def public_recordable(user_association:)
      self.public_recordable_user_association = user_association

      define_method(user_association) do
        # Call the original association (super)
        real_user = super()

        # If the user exists, return it.
        return real_user if real_user.present?

        # If the user is gone, return a readonly User populated with snapshot data
        # Determine which snapshot field to use
        username_field = :omniauth_username_snapshot if respond_to?(
          :omniauth_username_snapshot
        )
        first_name_field = :first_name_snapshot if respond_to?(
          :first_name_snapshot
        )
        last_name_field = :last_name_snapshot if respond_to?(
          :last_name_snapshot
        )

        return nil unless username_field

        # Return a non-persisted, readonly User populated with snapshot data.
        # This avoids maintaining a separate DeletedUser class that must mirror User's interface.
        # We generate a synthetic ID so the frontend MST model doesn't choke on null.
        record_id = id
        User
          .new(
            omniauth_username:
              public_send(username_field) || I18n.t("misc.removed_placeholder"),
            first_name:
              public_send(first_name_field) ||
                I18n.t("misc.removed_placeholder"),
            last_name:
              public_send(last_name_field) ||
                I18n.t("misc.removed_placeholder"),
            discarded_at: Time.current
          )
          .tap do |user|
            # Override id to return a synthetic value for serialization
            user.define_singleton_method(:id) { "deleted-#{record_id}" }
            user.readonly!
          end
      end
    end
  end

  # The person's name, kept for display after the account is gone.
  # update_columns skips the orphan immutability check.
  def remember_user!(user = nil)
    return unless persisted?
    return unless respond_to?(:omniauth_username_snapshot=)

    user_to_snapshot = user || snapshot_source_user
    return unless user_to_snapshot&.persisted?

    update_columns(
      omniauth_username_snapshot:
        user_to_snapshot.omniauth_username.presence || user_to_snapshot.email,
      first_name_snapshot: user_to_snapshot.first_name,
      last_name_snapshot: user_to_snapshot.last_name,
      updated_at: Time.current
    )
    reindex if respond_to?(:search_data)
  end

  # remember_user! plus the retention clock. OrphanCleanupJob deletes the row.
  def abandon!
    remember_user!
    columns = { orphaned_at: Time.current, updated_at: Time.current }
    columns[:discarded_at] = Time.current if respond_to?(:discarded_at=)
    update_columns(columns)
    reindex if respond_to?(:search_data)
  end

  def snapshot_source_user
    association_name = self.class.public_recordable_user_association
    return if association_name.blank?

    public_send(association_name)
  end

  def orphaned?
    orphaned_at.present?
  end

  private

  def prevent_updates_if_orphaned
    return unless orphaned?

    # Allow updating orphaned_at itself (though usually set once) or if we are deleting
    # Also allow updated_at changes which happen automatically
    # Also allow nullifying the user association (orphaning process)
    allowed_keys = %w[orphaned_at updated_at]
    if self.class.public_recordable_user_association
      allowed_keys << "#{self.class.public_recordable_user_association}_id"
    end

    return if (changes.keys - allowed_keys).empty?

    errors.add(:base, "Cannot update an orphaned record")
    throw(:abort)
  end
end
