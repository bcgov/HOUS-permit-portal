module Reports
  class ReviewProcess < Base
    IN_FLIGHT_STATUSES = %w[newly_submitted resubmitted in_review].freeze
    RESOLVED_STATUSES = %w[approved issued withdrawn].freeze
    SUCCESS_STATUSES = %w[approved issued].freeze

    def headline_figures
      [
        figure(
          "queue",
          queue_count,
          help_overrides: {
            as_of: Time.current.strftime("%Y-%m-%d %H:%M")
          }
        ),
        figure(
          "revision_request_rate",
          percent_value(revised_count, resolved_ids.length)
        ),
        figure("mean_revision_rounds", mean_revision_rounds),
        figure(
          "resubmission_success_rate",
          percent_value(
            resubmission_success_count,
            resubmitted_resolved_ids.length
          )
        ),
        figure(
          "withdrawal_rate",
          percent_value(withdrawn_count, resolved_ids.length)
        ),
        figure("median_days_to_first_review", median_days_to_first_review),
        figure("median_days_to_resolution", median_days_to_resolution),
        figure(
          "excluded_timing",
          excluded_timing_count,
          help_overrides: {
            start_date: timing_start_label
          }
        )
      ]
    end

    def charts
      [
        chart(
          "outcomes",
          "bar",
          x_key: "outcome",
          series: [
            {
              key: "count",
              label: I18n.t("reports.review_process.series.applications")
            }
          ],
          data: outcome_rows,
          record_count: resolved_ids.length
        )
      ]
    end

    def tables
      [table("outcomes", [column("outcome"), column("count")], outcome_rows)]
    end

    def notes
      [
        note("aggregate_only", "definition"),
        note("in_flight_excluded", "definition"),
        note("queue_independent", "definition"),
        note("timing_start", "definition"),
        note("timing_exclusions", "definition")
      ]
    end

    def empty?
      submitted_in_range.none? && queue_count.zero?
    end

    private

    def column(key)
      { key: key, label: I18n.t("reports.review_process.columns.#{key}") }
    end

    def queue_count
      @queue_count ||= live_applications.where(status: IN_FLIGHT_STATUSES).count
    end

    def resolved_ids
      @resolved_ids ||=
        submitted_in_range.where(status: RESOLVED_STATUSES).pluck(:id)
    end

    def submitted_ids
      @submitted_ids ||= submitted_in_range.pluck(:id)
    end

    def submission_counts
      @submission_counts ||=
        SubmissionVersion
          .where(permit_application_id: submitted_ids)
          .group(:permit_application_id)
          .count
    end

    def revised_count
      resolved_ids.count { |id| submission_counts[id].to_i > 1 }
    end

    def mean_revision_rounds
      return nil if resolved_ids.empty?

      rounds = resolved_ids.map { |id| [submission_counts[id].to_i - 1, 0].max }
      (rounds.sum.to_f / rounds.length).round(1)
    end

    def resubmitted_resolved_ids
      @resubmitted_resolved_ids ||=
        resolved_ids.select { |id| submission_counts[id].to_i > 1 }
    end

    def resubmission_success_count
      submitted_in_range.where(
        id: resubmitted_resolved_ids,
        status: SUCCESS_STATUSES
      ).count
    end

    def withdrawn_count
      submitted_in_range.where(id: resolved_ids, status: :withdrawn).count
    end

    def outcome_rows
      counts = submitted_in_range.where(id: resolved_ids).group(:status).count
      RESOLVED_STATUSES.map do |status|
        {
          "outcome" => status.humanize,
          "count" => count_for_status(counts, status)
        }
      end
    end

    def count_for_status(counts, status)
      counts[status].to_i + counts[status.to_sym].to_i +
        counts[PermitApplication.statuses[status]].to_i
    end

    def first_submitted_at_by_id
      @first_submitted_at_by_id ||=
        submitted_in_range.pluck(:id, Arel.sql(FIRST_SUBMITTED_AT_SQL)).to_h
    end

    def first_viewed_at_by_id
      @first_viewed_at_by_id ||=
        SubmissionVersion
          .where(permit_application_id: submitted_ids)
          .where.not(viewed_at: nil)
          .group(:permit_application_id)
          .minimum(:viewed_at)
    end

    def resolution_at_by_id
      @resolution_at_by_id ||=
        begin
          result = {}
          ApplicationAudit
            .where(auditable_type: "PermitApplication")
            .where("audited_changes ? 'status'")
            .find_each do |audit|
              status = new_status_from(audit.audited_changes)
              next unless RESOLVED_STATUSES.include?(status)

              id = audit.auditable_id
              result[id] = [result[id], audit.created_at].compact.min
            end
          result
        end
    end

    def new_status_from(changes)
      raw = Array.wrap(changes["status"]).last
      return raw.to_s if PermitApplication.statuses.key?(raw.to_s)

      PermitApplication.statuses.key(raw.to_i).to_s
    end

    def median_days_to_first_review
      seconds =
        submitted_ids.filter_map do |id|
          viewed = first_viewed_at_by_id[id]
          submitted = first_submitted_at_by_id[id]
          next if viewed.blank? || submitted.blank?

          viewed - submitted
        end
      round_days(median(seconds))
    end

    def median_days_to_resolution
      seconds =
        resolved_ids.filter_map do |id|
          resolved_at = resolution_at_by_id[id]
          submitted = first_submitted_at_by_id[id]
          next if resolved_at.blank? || submitted.blank?

          resolved_at - submitted
        end
      round_days(median(seconds))
    end

    def excluded_timing_count
      missing_review =
        submitted_ids.count { |id| first_viewed_at_by_id[id].blank? }
      missing_resolution =
        resolved_ids.count { |id| resolution_at_by_id[id].blank? }
      missing_review + missing_resolution
    end

    def timing_start_label
      earliest =
        ApplicationAudit.where(auditable_type: "PermitApplication").minimum(
          :created_at
        )
      earliest&.to_date&.iso8601 ||
        I18n.t("reports.review_process.timing_unavailable")
    end
  end
end
