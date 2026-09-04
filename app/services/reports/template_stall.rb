module Reports
  class TemplateStall < Base
    STUCK_AFTER = 30.days
    ABANDONED_AFTER = 90.days

    ELAPSED_OUR_COURT_SECONDS_SQL = <<~SQL.squish
      COALESCE(permit_applications.queue_time_seconds, 0)
      + CASE
        WHEN permit_applications.queue_clock_started_at IS NOT NULL
        THEN EXTRACT(EPOCH FROM (NOW() - permit_applications.queue_clock_started_at))
        ELSE 0
      END
    SQL

    def headline_figures
      [
        figure("applications", range_count),
        figure("stuck_our_court", stuck_our_court_records.length),
        figure("stuck_revisions", stuck_revisions_records.length),
        figure(
          "withdrawal_rate",
          percent_value(withdrawn_in_range_count, range_count)
        )
      ]
    end

    def charts
      []
    end

    def tables
      [
        table(
          "templates",
          template_columns,
          template_rows,
          sortable: true,
          default_sort: {
            key: "stuck_our_court",
            direction: "desc"
          }
        ),
        table(
          "versions",
          version_columns,
          version_rows,
          sortable: true,
          default_sort: {
            key: "stuck_our_court",
            direction: "desc"
          }
        )
      ]
    end

    def notes
      [
        note("queue_clock", "definition"),
        note("stuck_thresholds", "definition"),
        note("no_cancelled", "definition"),
        note("small_n", "caveat"),
        note("failed_submissions", "not_measured")
      ]
    end

    def empty?
      range_count.zero? && stuck_our_court_records.empty? &&
        stuck_revisions_records.empty?
    end

    private

    def column(key)
      { key: key, label: I18n.t("reports.template_stall.columns.#{key}") }
    end

    def template_columns
      [
        column("template"),
        column("applications"),
        column("status_mix"),
        column("withdrawal_rate"),
        column("abandoned_rate"),
        column("median_our_court_days"),
        column("stuck_our_court"),
        column("stuck_revisions")
      ]
    end

    def version_columns
      [
        column("template"),
        column("version_date"),
        column("applications"),
        column("status_mix"),
        column("withdrawal_rate"),
        column("abandoned_rate"),
        column("median_our_court_days"),
        column("stuck_our_court"),
        column("stuck_revisions")
      ]
    end

    def template_rows
      @template_rows ||= grouped_rows(include_version: false)
    end

    def version_rows
      @version_rows ||= grouped_rows(include_version: true)
    end

    def range_count
      range_records.length
    end

    def withdrawn_in_range_count
      range_records.count { |record| record[:status] == "withdrawn" }
    end

    def range_records
      @range_records ||= load_records(created_in_range, abandoned: true)
    end

    def stuck_our_court_records
      @stuck_our_court_records ||=
        load_records(
          live_applications.where(
            status: PermitApplication.our_court_statuses
          ).where("#{ELAPSED_OUR_COURT_SECONDS_SQL} >= ?", STUCK_AFTER.to_i)
        )
    end

    def stuck_revisions_records
      @stuck_revisions_records ||=
        load_records(
          live_applications.where(status: :revisions_requested).where(
            "permit_applications.revisions_requested_at <= ?",
            STUCK_AFTER.ago
          )
        )
    end

    def with_templates(scope)
      scope.joins(:template_version).joins(
        "INNER JOIN requirement_templates ON requirement_templates.id = template_versions.requirement_template_id"
      )
    end

    def load_records(scope, abandoned: false)
      rows =
        with_templates(scope).pluck(
          "requirement_templates.id",
          "requirement_templates.nickname",
          "template_versions.id",
          "template_versions.version_date",
          "permit_applications.status",
          "permit_applications.updated_at",
          Arel.sql(ELAPSED_OUR_COURT_SECONDS_SQL)
        )

      rows.map do |row|
        status = status_name(row[4])
        updated_at = row[5]
        {
          template_id: row[0],
          nickname: row[1].to_s,
          version_id: row[2],
          version_date: row[3]&.to_date&.iso8601,
          status: status,
          elapsed: row[6].to_f,
          abandoned:
            abandoned && status == "new_draft" && updated_at.present? &&
              updated_at <= ABANDONED_AFTER.ago
        }
      end
    end

    def grouped_rows(include_version:)
      buckets = Hash.new { |hash, key| hash[key] = blank_bucket }

      range_records.each do |record|
        bucket = buckets[group_key(record, include_version)]
        fill_identity(bucket, record)
        bucket[:applications] += 1
        bucket[:statuses][record[:status].to_s] += 1
        bucket[:withdrawn] += 1 if record[:status] == "withdrawn"
        bucket[:abandoned] += 1 if record[:abandoned]
        bucket[:elapsed] << record[:elapsed]
      end

      stuck_our_court_records.each do |record|
        bucket = buckets[group_key(record, include_version)]
        fill_identity(bucket, record)
        bucket[:stuck_our_court] += 1
      end

      stuck_revisions_records.each do |record|
        bucket = buckets[group_key(record, include_version)]
        fill_identity(bucket, record)
        bucket[:stuck_revisions] += 1
      end

      buckets
        .values
        .map { |bucket| serialize(bucket, include_version: include_version) }
        .sort_by { |row| [-row["stuck_our_court"].to_i, row["template"].to_s] }
    end

    def group_key(record, include_version)
      include_version ? record[:version_id] : record[:template_id]
    end

    def fill_identity(bucket, record)
      bucket[:template] ||= record[:nickname]
      bucket[:version_date] ||= record[:version_date]
    end

    def blank_bucket
      {
        template: nil,
        version_date: nil,
        applications: 0,
        statuses: Hash.new(0),
        withdrawn: 0,
        abandoned: 0,
        elapsed: [],
        stuck_our_court: 0,
        stuck_revisions: 0
      }
    end

    def serialize(bucket, include_version:)
      applications = bucket[:applications]
      row = {
        "template" => bucket[:template],
        "applications" => applications,
        "status_mix" => status_mix(bucket[:statuses]),
        "withdrawal_rate" => percent_value(bucket[:withdrawn], applications),
        "abandoned_rate" => percent_value(bucket[:abandoned], applications),
        "median_our_court_days" => round_days(median(bucket[:elapsed])),
        "stuck_our_court" => bucket[:stuck_our_court],
        "stuck_revisions" => bucket[:stuck_revisions]
      }
      row["version_date"] = bucket[:version_date] if include_version
      row
    end

    def status_mix(counts)
      PermitApplication
        .statuses
        .keys
        .filter_map do |status|
          count = counts[status.to_s].to_i
          next if count.zero?

          "#{status.to_s.humanize}: #{count}"
        end
        .join(", ")
    end

    def status_name(value)
      value.is_a?(Integer) ? PermitApplication.statuses.key(value) : value.to_s
    end
  end
end
