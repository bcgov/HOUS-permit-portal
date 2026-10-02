module Reports
  class StorageFootprint < Base
    SIZE_SQL =
      "COALESCE((file_data::jsonb -> 'metadata' ->> 'size')::bigint, 0)"
    ZIP_SIZE_SQL =
      "COALESCE((submission_versions.zipfile_data -> 'metadata' ->> 'size')::bigint, 0)"
    PROJECTION_MONTHS = 3
    UNATTRIBUTED = "unattributed"

    def headline_figures
      [
        figure("total_bytes", total_bytes),
        figure("accounted_bytes", accounted_bytes),
        figure("average_bytes_per_application", average_bytes),
        figure("projected_next_12_months", projected_bytes)
      ]
    end

    def charts
      rows = monthly_rows
      [
        chart(
          "bytes_added_by_month",
          "line",
          x_key: "period",
          series: [
            {
              key: "bytes",
              label: I18n.t("reports.storage_footprint.series.bytes_added")
            }
          ],
          data: rows,
          record_count: rows.length,
          suppressed: false
        )
      ]
    end

    def tables
      [
        table(
          "excluded",
          [column("category"), column("bytes"), column("why")],
          excluded_rows
        ),
        table("by_type", [column("document_type"), column("bytes")], type_rows),
        table(
          "by_jurisdiction",
          [column("jurisdiction"), column("bytes")],
          jurisdiction_rows,
          sortable: true,
          default_sort: {
            key: "bytes",
            direction: "desc"
          }
        ),
        table("by_month", [column("period"), column("bytes")], monthly_rows)
      ]
    end

    def notes
      [
        note("accounted", "definition"),
        note("billed", "definition"),
        note("projection", "definition"),
        note("unattributed", "definition")
      ]
    end

    def empty?
      accounted_bytes.zero?
    end

    private

    def column(key)
      { key: key, label: I18n.t("reports.storage_footprint.columns.#{key}") }
    end

    def total_bytes
      @total_bytes ||= type_totals.values.sum
    end

    def average_bytes
      count = live_applications.count
      return nil if count.zero?

      (total_bytes.to_f / count).round
    end

    def projected_bytes
      months = projection_month_starts
      added = months.map { |month| all_monthly_totals[month].to_i }
      (added.sum.to_f / months.length * 12).round
    end

    # Every file row this report knows how to size. Live and sandbox totals are
    # subsets; the remainder is discarded or no longer attached to a parent.
    TRACKED = [
      SupportingDocument,
      ProjectDocument,
      ReportDocument,
      DesignDocument,
      MeetingRequestDocument,
      NoteAttachmentDocument,
      RequirementDocument,
      ResourceDocument
    ].freeze

    def accounted_bytes
      tracked_bytes + zipfile_bytes
    end

    def tracked_bytes
      @tracked_bytes ||= TRACKED.sum { |klass| sum_size(klass.all) }
    end

    def discarded_bytes
      tracked_bytes - total_bytes - sandbox_bytes
    end

    def zipfile_bytes
      @zipfile_bytes ||= SubmissionVersion.sum(Arel.sql(ZIP_SIZE_SQL)).to_i
    end

    def excluded_rows
      {
        sandbox: sandbox_bytes,
        discarded: discarded_bytes,
        zipfiles: zipfile_bytes
      }.map do |key, bytes|
        {
          "category" =>
            I18n.t("reports.storage_footprint.excluded.#{key}.category"),
          "bytes" => bytes,
          "why" => I18n.t("reports.storage_footprint.excluded.#{key}.why")
        }
      end
    end

    def type_rows
      type_totals
        .sort_by { |_key, bytes| -bytes }
        .map do |key, bytes|
          {
            "document_type" => I18n.t("reports.storage_footprint.types.#{key}"),
            "bytes" => bytes
          }
        end
    end

    def jurisdiction_rows
      names = jurisdiction_names
      bytes_by_jurisdiction
        .reject { |_id, bytes| bytes.zero? }
        .sort_by { |_id, bytes| -bytes }
        .map do |id, bytes|
          {
            "jurisdiction" => names[id] || unattributed_label,
            "bytes" => bytes
          }
        end
    end

    def monthly_rows
      months_for_trend.map do |month|
        {
          "period" => month.strftime("%Y-%m"),
          "bytes" => all_monthly_totals[month].to_i
        }
      end
    end

    def type_totals
      @type_totals ||=
        sources.each_with_object({}) do |source, memo|
          memo[source[:key]] = sum_size(source[:scope].call)
        end
    end

    def bytes_by_jurisdiction
      @bytes_by_jurisdiction ||=
        sources.each_with_object(Hash.new(0)) do |source, memo|
          add_jurisdiction_bytes(memo, source)
        end
    end

    def all_monthly_totals
      @all_monthly_totals ||=
        sources.each_with_object(Hash.new(0)) do |source, totals|
          source[:scope]
            .call
            .group(Arel.sql("date_trunc('month', #{source[:created]})"))
            .sum(Arel.sql(SIZE_SQL))
            .each do |timestamp, bytes|
              next if timestamp.blank?

              totals[timestamp.to_date.beginning_of_month] += bytes.to_i
            end
        end
    end

    def add_jurisdiction_bytes(memo, source)
      scope = source[:scope].call
      if source[:jurisdiction]
        scope
          .group(Arel.sql(source[:jurisdiction]))
          .sum(Arel.sql(SIZE_SQL))
          .each do |jurisdiction_id, bytes|
            key = jurisdiction_id.presence || UNATTRIBUTED
            memo[key] += bytes.to_i
          end
      else
        bytes = sum_size(scope)
        memo[UNATTRIBUTED] += bytes if bytes.positive?
      end
    end

    def sum_size(scope)
      scope.sum(Arel.sql(SIZE_SQL)).to_i
    end

    def jurisdiction_names
      ids = bytes_by_jurisdiction.keys - [UNATTRIBUTED]
      names =
        Jurisdiction
          .where(id: ids)
          .each_with_object({}) do |jurisdiction, memo|
            memo[jurisdiction.id] = jurisdiction.qualified_name.presence ||
              jurisdiction.name
          end
      names[UNATTRIBUTED] = unattributed_label
      names
    end

    def unattributed_label
      I18n.t("reports.storage_footprint.unattributed")
    end

    def projection_month_starts
      (0...PROJECTION_MONTHS).map do |i|
        i.months.ago.to_date.beginning_of_month
      end
    end

    def months_for_trend
      last = range.end_date.to_date.beginning_of_month
      first =
        if range.all_time?
          earliest =
            sources
              .map { |source| source[:scope].call.minimum(source[:created]) }
              .compact
              .min
          (earliest&.to_date || last).beginning_of_month
        else
          range.start_date.to_date.beginning_of_month
        end

      months = []
      current = first
      while current <= last
        months << current
        current = current.next_month
      end
      months
    end

    def sandbox_bytes
      @sandbox_bytes ||=
        sources(sandboxed: true).sum { |source| sum_size(source[:scope].call) }
    end

    def sources(sandboxed: false)
      projects =
        sandboxed ? PermitProject.kept.sandboxed : PermitProject.kept.live
      sandbox_check = sandboxed ? "IS NOT NULL" : "IS NULL"

      list = [
        {
          key: "supporting_documents",
          created: "supporting_documents.created_at",
          jurisdiction: "permit_projects.jurisdiction_id",
          scope: -> do
            SupportingDocument
              .joins(permit_application: :permit_project)
              .merge(PermitApplication.kept)
              .merge(projects)
          end
        },
        {
          key: "project_documents",
          created: "project_documents.created_at",
          jurisdiction: "permit_projects.jurisdiction_id",
          scope: -> { ProjectDocument.joins(:permit_project).merge(projects) }
        },
        {
          key: "report_documents",
          created: "report_documents.created_at",
          jurisdiction:
            "COALESCE(permit_projects.jurisdiction_id, step_codes.jurisdiction_id)",
          scope: -> do
            ReportDocument
              .joins(:step_code)
              .merge(StepCode.kept)
              .joins(<<~SQL.squish)
                LEFT JOIN permit_applications
                  ON permit_applications.id = step_codes.permit_application_id
                LEFT JOIN permit_projects
                  ON permit_projects.id = permit_applications.permit_project_id
              SQL
              .where(<<~SQL.squish)
                (
                  permit_applications.id IS NULL
                  AND step_codes.sandbox_id #{sandbox_check}
                )
                OR (
                  permit_applications.id IS NOT NULL
                  AND permit_applications.discarded_at IS NULL
                  AND permit_projects.discarded_at IS NULL
                  AND permit_projects.sandbox_id #{sandbox_check}
                )
              SQL
          end
        },
        {
          key: "design_documents",
          created: "design_documents.created_at",
          jurisdiction: "pre_checks.jurisdiction_id",
          scope: -> do
            DesignDocument.joins(:pre_check).where(
              "pre_checks.sandbox_id #{sandbox_check}"
            )
          end
        },
        {
          key: "meeting_request_documents",
          created: "meeting_request_documents.created_at",
          jurisdiction: "permit_projects.jurisdiction_id",
          scope: -> do
            MeetingRequestDocument.joins(
              project_meeting: :permit_project
            ).merge(projects)
          end
        },
        {
          key: "note_attachment_documents",
          created: "note_attachment_documents.created_at",
          jurisdiction: "permit_projects.jurisdiction_id",
          scope: -> do
            NoteAttachmentDocument.joins(note: :permit_project).merge(projects)
          end
        }
      ]
      return list if sandboxed

      list +
        [
          {
            key: "requirement_documents",
            created: "requirement_documents.created_at",
            jurisdiction: nil,
            scope: -> do
              RequirementDocument.joins(:requirement_block).merge(
                RequirementBlock.kept
              )
            end
          },
          {
            key: "resource_documents",
            created: "resource_documents.created_at",
            jurisdiction: "resources.jurisdiction_id",
            scope: -> { ResourceDocument.joins(:resource) }
          }
        ]
    end
  end
end
