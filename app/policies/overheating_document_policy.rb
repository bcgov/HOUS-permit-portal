class OverheatingDocumentPolicy < ApplicationPolicy
  def download?
    # [OVERHEATING REVIEW] Mini-lesson: authorize via the *parent* record ownership.
    # This is a good baseline: OverheatingDocument is attached to a PdfForm, so we can
    # check ownership through `record.pdf_form.user_id`.
    #
    # One extra thought: consider whether review staff should be allowed to download these
    # (similar to PdfFormPolicy#show?), and keep the rules consistent across both models.
    user.present? && record.pdf_form.user_id == user.id
  end
end
