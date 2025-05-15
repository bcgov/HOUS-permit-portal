module SearchableAudit
  extend ActiveSupport::Concern

  included do
    # For Searchkick:
    # - :callbacks can be :async (default background job), :inline (sync), :queue (custom background job like Sidekiq)
    # - :index_name can be customized, default is model_name_#{Rails.env} (e.g., "audits_development")
    searchkick callbacks: :async

    def search_data
      {
        # Ids and types
        auditable_id: auditable_id,
        auditable_type: auditable_type,
        associated_id: associated_id,
        associated_type: associated_type,
        user_id: user_id,
        user_type: user_type,
        username: username,
        # Action and changes
        action: action,
        # audited_changes is often a hash/JSON. Searchkick attempts to map this to an Elasticsearch object.
        # If issues arise, consider serializing to a string or extracting specific sub-fields.
        audited_changes: audited_changes,
        # Other details
        version: version,
        comment: comment,
        remote_address: remote_address,
        request_uuid: request_uuid,
        created_at: created_at
      }
    end
  end
end
