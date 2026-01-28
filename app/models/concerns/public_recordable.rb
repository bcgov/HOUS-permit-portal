module PublicRecordable
  # This concern handles the logic for records that are considered "Public Records" in the context of
  # data retention and user deletion. It does NOT mean the record is publicly available to the internet.
  #
  # A "Public Record" is a record that must be preserved even if the creating user is deleted,
  # typically for legal or audit reasons (e.g. submitted permit applications).
  #
  # When a user is deleted:
  # 1. If the record is a "public record" (public_record? returns true):
  #    - A snapshot of the user's details (name, username) is taken.
  #    - The record is orphaned (user association set to nil).
  #    - The record becomes immutable (prevent_updates_if_orphaned).
  #    - The record is eventually deleted by OrphanCleanupJob after a retention period.
  # 2. If the record is NOT a "public record" (e.g. a draft):
  #    - It is destroyed via cascade delete when the user is destroyed.
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

        # If the user is gone, return the Mock User populated with our snapshot
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

        DeletedUser.new(
          username: public_send(username_field),
          first_name: public_send(first_name_field),
          last_name: public_send(last_name_field)
        )
      end
    end
  end

  def take_user_snapshots!
    return unless public_record?

    # Determine which user association to snapshot based on the model
    association_name = self.class.public_recordable_user_association
    return unless association_name

    # Fetch the user using the association name
    user_to_snapshot = public_send(association_name)

    return unless user_to_snapshot

    username_to_save =
      user_to_snapshot.omniauth_username.presence || user_to_snapshot.email
    first_name_to_save = user_to_snapshot.first_name
    last_name_to_save = user_to_snapshot.last_name

    if respond_to?(:omniauth_username_snapshot=)
      update_columns(
        omniauth_username_snapshot: username_to_save,
        first_name_snapshot: first_name_to_save,
        last_name_snapshot: last_name_to_save,
        orphaned_at: Time.current
      )
    end
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

  class DeletedUser
    # This class is a mock user object that is used to represent a deleted user.

    attr_reader :omniauth_username, :first_name, :last_name

    def initialize(username:, first_name:, last_name:)
      @omniauth_username = username || I18n.t("misc.removed_placeholder")
      @first_name = first_name || I18n.t("misc.removed_placeholder")
      @last_name = last_name || I18n.t("misc.removed_placeholder")
    end

    def name
      "#{first_name} #{last_name}"
    end

    def email
      I18n.t("misc.removed_placeholder")
    end

    def id
      nil
    end

    # Mock fields for UserBlueprint
    def role
      "deleted"
    end

    def organization
      nil
    end

    def certified
      false
    end

    def confirmed_at
      nil
    end

    def discarded_at
      Time.current
    end

    def unconfirmed_email
      nil
    end

    def omniauth_email
      nil
    end

    def omniauth_provider
      nil
    end

    def created_at
      nil
    end

    def confirmation_sent_at
      nil
    end

    def last_sign_in_at
      nil
    end

    def department
      nil
    end

    def preference
      nil
    end

    def eula_variant
      nil
    end

    def license_agreements
      []
    end

    def invited_by
      nil
    end

    def jurisdiction_memberships
      []
    end

    # Add other methods expected by the UI as needed
    def present?
      true
    end

    def jurisdiction_staff?
      false
    end

    def submitter?
      false
    end

    def review_staff?
      false
    end

    def super_admin?
      false
    end

    def system_admin?
      false
    end

    def method_missing(method_name, *args, &block)
      nil
    end

    def respond_to_missing?(method_name, include_private = false)
      true
    end
  end
end
