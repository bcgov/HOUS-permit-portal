class RequirementBlockRequirement < ApplicationRecord
  belongs_to :requirement
  belongs_to :requirement_block

  acts_as_list scope: :requirement_block, top_of_list: 0

  validates_uniqueness_of :requirement, scope: :requirement_block

  validate :one_requirement_block_per_non_reusable_requirement

  after_destroy :destroy_non_reusable_requirement

  private

  def one_requirement_block_per_non_reusable_requirement
    return unless requirement.present? && !requirement.reusable

    existing_relationship = RequirementBlockRequirement.where(requirement: requirement).where.not(id: id).exists?

    if existing_relationship
      errors.add(:requirement, "is marked as non reusable and already associated with a requirement block.")
    end
  end

  def destroy_non_reusable_requirement
    return unless requirement.present? && !requirement.reusable

    requirement.destroy
  end
end
