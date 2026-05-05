# Adds sandbox_id to permit_projects, migrates existing data so every
# permit_project is associated with at most one sandbox, and drops the now
# redundant permit_applications.sandbox_id column.
#
# Behaviour for existing data:
#   * For any permit_project whose permit_applications span more than one
#     distinct sandbox_id (treating NULL as its own bucket), we keep the
#     "live" (nil) bucket on the original project and clone the project for
#     each additional sandbox bucket. The cloned projects take their bucket's
#     sandbox_id and their permit_applications are reparented onto them.
#   * Projects with a single distinct sandbox_id simply have that value
#     copied onto permit_projects.sandbox_id.
#   * After the data moves, permit_applications.sandbox_id is dropped. Going
#     forward, sandbox is a property of the parent PermitProject and
#     PermitApplication exposes it via the ProjectItem concern.
#
# Caveats:
#   * The `down` cannot perfectly undo the project splitting; it re-adds the
#     permit_applications.sandbox_id column, repopulates it from each PA's
#     parent project, then removes the project-level column. Projects that
#     were cloned during the up will remain as separate projects.
class MoveSandboxIdToProjects < ActiveRecord::Migration[7.2]
  class MigrationPermitProject < ActiveRecord::Base
    self.table_name = "permit_projects"
  end

  class MigrationPermitApplication < ActiveRecord::Base
    self.table_name = "permit_applications"
  end

  def up
    unless column_exists?(:permit_projects, :sandbox_id)
      add_reference :permit_projects,
                    :sandbox,
                    type: :uuid,
                    null: true,
                    foreign_key: true,
                    index: true
    end

    MigrationPermitProject.reset_column_information
    MigrationPermitApplication.reset_column_information

    split_ambiguous_projects!
    copy_unambiguous_sandbox_ids!

    if column_exists?(:permit_applications, :sandbox_id)
      remove_foreign_key :permit_applications, :sandboxes
      remove_reference :permit_applications, :sandbox, type: :uuid, index: true
    end
  end

  def down
    unless column_exists?(:permit_applications, :sandbox_id)
      add_reference :permit_applications,
                    :sandbox,
                    type: :uuid,
                    null: true,
                    index: true
    end

    # Push the project-level sandbox_id back onto every permit_application.
    # This does not reverse project splits created by `up`.
    execute <<~SQL
      UPDATE permit_applications pa
      SET sandbox_id = pp.sandbox_id
      FROM permit_projects pp
      WHERE pa.permit_project_id = pp.id
        AND pp.sandbox_id IS NOT NULL;
    SQL

    unless foreign_key_exists?(:permit_applications, :sandboxes)
      add_foreign_key :permit_applications, :sandboxes
    end

    remove_reference :permit_projects, :sandbox, foreign_key: true
  end

  private

  def split_ambiguous_projects!
    ambiguous_project_ids =
      MigrationPermitApplication
        .where.not(permit_project_id: nil)
        .group(:permit_project_id)
        .having("COUNT(DISTINCT COALESCE(sandbox_id::text, '__nil__')) > 1")
        .pluck(:permit_project_id)

    say "Found #{ambiguous_project_ids.size} ambiguous permit_project(s) to split"

    ambiguous_project_ids.each { |pp_id| split_project!(pp_id) }
  end

  def split_project!(project_id)
    project = MigrationPermitProject.find(project_id)

    # Group permit_applications by sandbox_id; nil is its own bucket.
    buckets =
      MigrationPermitApplication
        .where(permit_project_id: project.id)
        .pluck(:id, :sandbox_id)
        .group_by { |(_id, sandbox_id)| sandbox_id }
        .transform_values { |rows| rows.map(&:first) }

    # Preferred strategy: keep the live (nil) bucket on the original project.
    # Fallback when there is no live bucket: keep the first sandboxed bucket
    # (deterministically ordered) on the original project and set the project's
    # sandbox_id to match so we never leave the original empty.
    if buckets.key?(nil)
      original_sandbox_id = nil
      buckets.delete(nil)
    else
      original_sandbox_id = buckets.keys.sort_by(&:to_s).first
      buckets.delete(original_sandbox_id)
    end

    say "  Splitting project #{project.id} (#{project.title.inspect}): original keeps sandbox_id=#{original_sandbox_id.inspect}, spinning off #{buckets.size} bucket(s)"

    # Deterministic ordering so re-runs / reviews are stable.
    sandboxed_bucket_entries =
      buckets.sort_by { |sandbox_id, _pa_ids| sandbox_id.to_s }

    suffix_index = 2
    sandboxed_bucket_entries.each do |(sandbox_id, pa_ids)|
      clone_attrs =
        clonable_attributes(project).merge(
          "title" => "#{project.title} (#{suffix_index})",
          "number" => "#{project.number}-#{suffix_index}",
          "sandbox_id" => sandbox_id,
          "created_at" => Time.current,
          "updated_at" => Time.current
        )

      new_project = MigrationPermitProject.create!(clone_attrs)
      say "    Created clone #{new_project.id} (#{new_project.title.inspect}) for sandbox_id=#{sandbox_id}"

      MigrationPermitApplication.where(id: pa_ids).update_all(
        permit_project_id: new_project.id
      )

      suffix_index += 1
    end

    project.update_columns(sandbox_id: original_sandbox_id)
  end

  def clonable_attributes(project)
    # Copy every column except id and number/title/sandbox_id which we override,
    # and timestamps which we refresh.
    skipped = %w[id title number sandbox_id created_at updated_at]
    project.attributes.except(*skipped)
  end

  def copy_unambiguous_sandbox_ids!
    # For every permit_project still without a sandbox_id, copy the single
    # distinct sandbox_id from its permit_applications onto the project.
    # (Projects whose sole bucket is nil are left with sandbox_id = NULL.)
    # Postgres has no MAX(uuid); cast to text to aggregate, then back to uuid.
    # Safe because the HAVING clause guarantees all values in the group are
    # identical.
    execute <<~SQL
      UPDATE permit_projects pp
      SET sandbox_id = sub.sandbox_id
      FROM (
        SELECT permit_project_id,
               MAX(sandbox_id::text)::uuid AS sandbox_id
        FROM permit_applications
        WHERE permit_project_id IS NOT NULL
          AND sandbox_id IS NOT NULL
        GROUP BY permit_project_id
        HAVING COUNT(DISTINCT sandbox_id) = 1
      ) sub
      WHERE pp.id = sub.permit_project_id
        AND pp.sandbox_id IS NULL;
    SQL
  end
end
