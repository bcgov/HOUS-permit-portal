# frozen_string_literal: true

# Puts the database into the "ambiguous project" shape that
# MoveSandboxIdToProjects (20260416183037) is designed to resolve, so we can
# run that migration and verify it splits the project into a live project plus
# one spin-off per sandbox bucket.
#
# What it does:
#   * Finds the review_manager user and the Corporation of the City of North
#     Vancouver jurisdiction.
#   * Picks the first permit_project owned by that user in that jurisdiction
#     that has >= 3 permit_applications.
#   * Rewrites permit_applications.sandbox_id on those PAs so they straddle
#     three buckets: published sandbox, scheduled sandbox, and nil (live).
#   * Resets permit_projects.sandbox_id back to NULL on that project so the
#     migration's split logic has something to do.
#
# Everything is written via update_columns so we bypass validations and
# searchkick/reindex callbacks — the resulting DB state intentionally looks
# "wrong" to the app (that's the whole point; the migration is what fixes it).
#
# Only runs against the pre-migration schema (i.e. permit_applications.sandbox_id
# still exists).
#
# Usage:
#   bundle exec rake sandbox:contrive_ambiguous_project
#
namespace :sandbox do
  desc "Scramble an existing project's PA sandbox_ids to create an ambiguous project for MoveSandboxIdToProjects to resolve"
  task contrive_ambiguous_project: :environment do
    unless PermitApplication.columns_hash.key?("sandbox_id")
      abort "permit_applications.sandbox_id column is gone — this task only runs against the pre-migration schema."
    end

    reviewer = User.find_by!(omniauth_username: "review_manager")
    jurisdiction =
      Jurisdiction.find_by!(slug: "corporation-of-the-city-of-north-vancouver")

    published_sandbox = jurisdiction.sandboxes.published.first
    scheduled_sandbox = jurisdiction.sandboxes.scheduled.first
    unless published_sandbox && scheduled_sandbox
      abort "Jurisdiction #{jurisdiction.slug} is missing a published or scheduled sandbox."
    end

    # Find any project in the jurisdiction with enough permit_applications to
    # scatter across three buckets. We don't require it to already be owned by
    # the reviewer; we reassign ownership below so the contrived project is
    # visible when you sign in as review_manager.
    project =
      PermitProject
        .where(jurisdiction: jurisdiction)
        .joins(:permit_applications)
        .group("permit_projects.id")
        .having("COUNT(permit_applications.id) >= 3")
        .order("permit_projects.created_at ASC")
        .first

    abort <<~MSG unless project
      No project in #{jurisdiction.slug} has at least 3 permit_applications.
      Seed or create one (through the UI) and re-run.
    MSG

    # Bypass validations/callbacks (notably searchkick reindex and the
    # owner_cannot_be_jurisdiction_staff_without_sandbox validation) so we can
    # leave the project in the intentionally-broken pre-migration shape.
    # Note: permit_projects.sandbox_id does not exist yet pre-migration, so we
    # only touch owner_id here — the migration is what adds the column.
    project.update_columns(owner_id: reviewer.id)
    puts "Reassigned project #{project.id} (#{project.title.inspect}) to review_manager"

    pas = project.permit_applications.order(:created_at).to_a
    buckets = [published_sandbox.id, scheduled_sandbox.id, nil]

    puts "Scattering #{pas.size} permit_application(s) across " \
           "published / scheduled / nil buckets"

    pas.each_with_index do |pa, i|
      bucket = buckets[i % buckets.length]
      pa.update_columns(sandbox_id: bucket)
      puts "    pa #{pa.id} -> sandbox_id=#{bucket.inspect}"
    end

    puts "Done. Rename the migration back to .rb and run " \
           "`bundle exec rails db:migrate` to verify MoveSandboxIdToProjects."
  end
end
