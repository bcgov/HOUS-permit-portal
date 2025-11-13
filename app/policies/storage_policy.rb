class StoragePolicy < ApplicationPolicy
  def upload?
    user.present?
  end

  def create_multipart_upload?
    user.present?
  end

  def batch_presign_multipart_parts?
    user.present?
  end

  def complete_multipart_upload?
    user.present?
  end

  def abort_multipart_upload?
    user.present?
  end

  # download is handled by the individual model controller policies for various document classes
end
