class AddAddressedAtToRequestItems < ActiveRecord::Migration[7.2]
  # UX DISCUSSION ASSUMPTION: #8 assumed A (no resubmit gate) + honor-system checkboxes
  # (looks like B, does not verify artifacts).
  # Lapse: meeting still picks A/B/C; if C, addressed_at is the wrong source of truth.
  def change
    add_column :revision_requests, :addressed_at, :datetime
    add_column :supporting_information_requests, :addressed_at, :datetime
    add_column :additional_permit_requests, :addressed_at, :datetime
  end
end
