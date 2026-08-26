# frozen_string_literal: true

namespace :question_bank do
  desc <<~DESC.squish
    Rollback HUB-4234 requirement_question backfill: nulls requirement_question_id
    and deletes exclusively-linked (1:1) bank rows. Safe for staging before
    intentional multi-use catalogue questions are created. Prefer a DB snapshot
    restore for production rollback.
  DESC
  task rollback_backfill: :environment do
    unless ActiveRecord::Base.connection.table_exists?(:requirement_questions) &&
             ActiveRecord::Base.connection.column_exists?(
               :requirements,
               :requirement_question_id
             )
      puts "Skipping question_bank:rollback_backfill: schema prerequisites missing."
      next
    end

    unlinked = 0
    deleted = 0

    ActiveRecord::Base.transaction do
      Requirement
        .where.not(requirement_question_id: nil)
        .find_each do |requirement|
          question_id = requirement.requirement_question_id
          requirement.update_columns(
            requirement_question_id: nil,
            updated_at: Time.current
          )
          unlinked += 1

          still_linked =
            Requirement.where(requirement_question_id: question_id).exists?
          next if still_linked

          RequirementQuestion.where(id: question_id).delete_all
          deleted += 1
        end
    end

    if defined?(RequirementQuestion) && RequirementQuestion.respond_to?(:reindex)
      RequirementQuestion.reindex
    end

    puts "question_bank:rollback_backfill complete. unlinked=#{unlinked}, deleted_questions=#{deleted}."
  end
end
