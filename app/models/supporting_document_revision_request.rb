class SupportingDocumentRevisionRequest < RevisionRequest
  validates :title, presence: true

  # Fulfillment files are SupportingDocuments (revision_request_id).
  # Reference files stay RevisionReferenceDocuments and are not in the zip.
end
