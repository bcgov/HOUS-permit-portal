class PreCheckPolicy < ApplicationPolicy
  def index?
    user.present?
  end

  def show?
    same_sandbox? && record.creator_id == user.id
  end

  def create?
    user.present?
  end

  def update?
    same_sandbox? && record.creator_id == user.id
  end

  def submit?
    update?
  end

  def mark_viewed?
    update?
  end

  def pdf_report_url?
    show?
  end

  def download_pre_check_user_consent_csv?
    user.super_admin?
  end

  class Scope < Scope
    def resolve
      relation = scope.where(creator_id: user.id)
      return relation if user.super_admin?

      relation.where(sandbox_id: sandbox&.id)
    end
  end

  private

  def same_sandbox?
    return true if user&.super_admin?

    record.sandbox_id == sandbox&.id
  end
end
