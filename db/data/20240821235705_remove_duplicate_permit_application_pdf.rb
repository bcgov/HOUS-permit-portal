# frozen_string_literal: true

class RemoveDuplicatePermitApplicationPdf < ActiveRecord::Migration[7.1]
  def up
    duplicate_record_ids =
      SupportingDocument
        .where(data_key: SupportingDocument::APPLICATION_PDF_DATA_KEY)
        .group(:permit_application_id, :data_key)
        .having("COUNT(*) > 1")
        .pluck(:permit_application_id)

    duplicate_record_ids.each do |permit_application_id|
      duplicates =
        SupportingDocument.where(
          permit_application_id: permit_application_id,
          data_key: SupportingDocument::APPLICATION_PDF_DATA_KEY,
        ).order(created_at: :desc)

      # Keep the latest record (the first one in the ordered list)
      latest = duplicates.first

      # Destroy all older records
      duplicates.where.not(id: latest.id).destroy_all
    end
  end

  def down
  end
end
