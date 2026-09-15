module Reports
  class JurisdictionVolume < Base
    TOP_N = 5

    def headline_figures
      [
        figure("total_submitted", total_submitted),
        figure(
          "top_five_concentration",
          percent_value(top_n_submitted, total_submitted)
        )
      ]
    end

    def charts
      []
    end

    def tables
      [
        table(
          "jurisdictions",
          [
            column("jurisdiction"),
            column("drafts"),
            column("submitted"),
            column("revisions"),
            column("total")
          ],
          jurisdiction_rows,
          sortable: true,
          default_sort: {
            key: "submitted",
            direction: "desc"
          }
        )
      ]
    end

    def notes
      [
        note("drafts", "definition"),
        note("submitted", "definition"),
        note("revisions", "definition"),
        note("concentration", "definition"),
        note("zeros", "definition")
      ]
    end

    def empty?
      Jurisdiction.none?
    end

    private

    def column(key)
      { key: key, label: I18n.t("reports.jurisdiction_volume.columns.#{key}") }
    end

    def jurisdiction_rows
      @jurisdiction_rows ||=
        Jurisdiction
          .order(:name)
          .map { |jurisdiction| row_for(jurisdiction) }
          .sort_by { |row| -row["submitted"].to_i }
    end

    def row_for(jurisdiction)
      drafts = drafts_by_jurisdiction[jurisdiction.id].to_i
      submitted = submitted_by_jurisdiction[jurisdiction.id].to_i
      revisions = revisions_by_jurisdiction[jurisdiction.id].to_i
      {
        "jurisdiction" =>
          jurisdiction.qualified_name.presence || jurisdiction.name,
        "drafts" => drafts,
        "submitted" => submitted,
        "revisions" => revisions,
        "total" => drafts + submitted + revisions
      }
    end

    def total_submitted
      @total_submitted ||= submitted_by_jurisdiction.values.sum
    end

    def top_n_submitted
      submitted_by_jurisdiction.values.max(TOP_N).sum
    end

    def drafts_by_jurisdiction
      @drafts_by_jurisdiction ||=
        range
          .apply(
            live_applications.where("#{FIRST_SUBMITTED_AT_SQL} IS NULL"),
            "permit_applications.created_at"
          )
          .group("permit_projects.jurisdiction_id")
          .count
    end

    def submitted_by_jurisdiction
      @submitted_by_jurisdiction ||=
        submitted_in_range.group("permit_projects.jurisdiction_id").count
    end

    def revisions_by_jurisdiction
      @revisions_by_jurisdiction ||=
        range
          .apply(revision_versions, "submission_versions.created_at")
          .group("permit_projects.jurisdiction_id")
          .count
    end

    def revision_versions
      SubmissionVersion
        .joins(permit_application: :permit_project)
        .merge(PermitApplication.kept)
        .merge(PermitProject.live)
        .where("submission_versions.created_at > #{FIRST_SUBMITTED_AT_SQL}")
    end
  end
end
