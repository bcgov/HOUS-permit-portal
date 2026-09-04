module Reports
  class PlatformHealth < Base
    SIZE_SQL = "COALESCE((file_data -> 'metadata' ->> 'size')::bigint, 0)"

    def headline_figures
      [
        figure(
          "collaborated_applications",
          collaborated_application_ids.length
        ),
        figure(
          "collaboration_rate",
          percent_value(collaborated_application_ids.length, application_count)
        ),
        figure("application_collaborations", application_collaboration_count),
        figure("project_collaborations", project_collaboration_count),
        figure("average_documents", average_documents),
        figure("average_total_size_bytes", average_total_size),
        figure("maximum_total_size_bytes", maximum_total_size)
      ]
    end

    def charts
      []
    end

    def tables
      [
        table(
          "document_profile",
          [column("metric"), column("value")],
          [
            {
              "metric" => I18n.t("reports.platform_health.metrics.documents"),
              "value" => document_count
            },
            {
              "metric" =>
                I18n.t("reports.platform_health.metrics.average_documents"),
              "value" => average_documents
            },
            {
              "metric" =>
                I18n.t("reports.platform_health.metrics.average_size"),
              "value" => average_total_size
            },
            {
              "metric" =>
                I18n.t("reports.platform_health.metrics.maximum_size"),
              "value" => maximum_total_size
            }
          ]
        )
      ]
    end

    def notes
      [
        note("collaboration_scope", "definition"),
        note("shrine_sizes", "definition"),
        note("failed_submissions", "not_measured"),
        note("errors", "not_measured")
      ]
    end

    def empty?
      application_count.zero?
    end

    private

    def column(key)
      { key: key, label: I18n.t("reports.platform_health.columns.#{key}") }
    end

    def application_count
      @application_count ||= created_in_range.count
    end

    def application_collaboration_count
      PermitCollaboration
        .kept
        .where(permit_application_id: created_in_range.select(:id))
        .count
    end

    def project_collaboration_count
      PermitProjectCollaboration
        .kept
        .where(permit_project_id: created_in_range.select(:permit_project_id))
        .count
    end

    def collaborated_application_ids
      @collaborated_application_ids ||=
        begin
          from_applications =
            PermitCollaboration
              .kept
              .where(permit_application_id: created_in_range.select(:id))
              .distinct
              .pluck(:permit_application_id)
          project_ids =
            PermitProjectCollaboration
              .kept
              .where(
                permit_project_id: created_in_range.select(:permit_project_id)
              )
              .distinct
              .pluck(:permit_project_id)
          from_projects =
            created_in_range.where(permit_project_id: project_ids).pluck(:id)
          (from_applications + from_projects).uniq
        end
    end

    def documents
      SupportingDocument.where(
        permit_application_id: created_in_range.select(:id)
      )
    end

    def document_count
      @document_count ||= documents.count
    end

    def sizes_by_application
      @sizes_by_application ||=
        documents.group(:permit_application_id).sum(Arel.sql(SIZE_SQL))
    end

    def average_documents
      return nil if application_count.zero?

      (document_count.to_f / application_count).round(1)
    end

    def average_total_size
      return nil if application_count.zero?

      (sizes_by_application.values.sum.to_f / application_count).round
    end

    def maximum_total_size
      sizes_by_application.values.max
    end
  end
end
