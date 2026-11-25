module Reports
  class TemplateUsage < Base
    def headline_figures
      [
        figure("applications", created_in_range.count),
        figure("templates_used", used_labels.length),
        figure("published_never_used", never_used_rows.length)
      ]
    end

    def charts
      [
        chart(
          "combined",
          "bar",
          x_key: "template",
          series: [
            {
              key: "count",
              label: I18n.t("reports.template_usage.series.applications")
            }
          ],
          data: combined_rows.reject { |row| row["count"].to_i.zero? },
          record_count: created_in_range.count
        )
      ]
    end

    def tables
      [
        table(
          "combined",
          [
            column("template"),
            column("category"),
            column("created"),
            column("submitted")
          ],
          combined_rows
        ),
        table(
          "by_jurisdiction",
          [
            column("jurisdiction"),
            column("template"),
            column("category"),
            column("count")
          ],
          jurisdiction_rows
        ),
        table(
          "published_never_used",
          [column("template"), column("category"), column("version_date")],
          never_used_rows
        )
      ]
    end

    def notes
      [
        note("permit_type_proxy", "definition"),
        note("created_and_submitted", "definition"),
        note("never_used", "definition")
      ]
    end

    def empty?
      created_in_range.none? && never_used_rows.empty?
    end

    private

    def column(key)
      { key: key, label: I18n.t("reports.template_usage.columns.#{key}") }
    end

    def created_grouped_counts
      @created_grouped_counts ||= grouped_counts(created_in_range)
    end

    def submitted_grouped_counts
      @submitted_grouped_counts ||= grouped_counts(submitted_in_range)
    end

    def grouped_counts(scope)
      scope
        .joins(:template_version)
        .joins(
          "INNER JOIN requirement_templates ON requirement_templates.id = template_versions.requirement_template_id"
        )
        .joins(
          "LEFT JOIN template_categories ON template_categories.id = requirement_templates.template_category_id"
        )
        .group(
          "permit_projects.jurisdiction_id",
          "requirement_templates.nickname",
          "template_categories.label"
        )
        .count
    end

    def jurisdiction_rows
      @jurisdiction_rows ||=
        created_grouped_counts
          .map do |(jurisdiction_id, nickname, category), count|
            {
              "jurisdiction" => jurisdiction_name(jurisdiction_id),
              "template" => nickname.to_s,
              "category" => category.to_s,
              "count" => count.to_i
            }
          end
          .sort_by { |row| [row["jurisdiction"], row["template"]] }
    end

    def combined_rows
      @combined_rows ||=
        begin
          created = rollup(created_grouped_counts)
          submitted = rollup(submitted_grouped_counts)
          (created.keys + submitted.keys)
            .uniq
            .map do |nickname, category|
              created_count = created[[nickname, category]].to_i
              {
                "template" => nickname,
                "category" => category,
                "created" => created_count,
                "submitted" => submitted[[nickname, category]].to_i,
                "count" => created_count
              }
            end
            .sort_by do |row|
              [-row["created"], -row["submitted"], row["template"]]
            end
        end
    end

    def rollup(grouped)
      grouped.each_with_object(
        Hash.new(0)
      ) do |((_id, nickname, category), count), memo|
        memo[[nickname.to_s, category.to_s]] += count.to_i
      end
    end

    def used_labels
      combined_rows.map { |row| row["template"] }.uniq
    end

    def never_used_rows
      @never_used_rows ||=
        never_used_versions
          .map do |version|
            template = version.requirement_template
            {
              "template" => template&.nickname.to_s,
              "category" => template&.template_category&.label.to_s,
              "version_date" => version.version_date&.to_date&.iso8601
            }
          end
          .sort_by { |row| [row["category"], row["template"]] }
    end

    def never_used_versions
      used_ids =
        PermitApplication.kept.live.distinct.pluck(:template_version_id)
      published =
        TemplateVersion.published_on_kept_templates.includes(
          requirement_template: :template_category
        )
      return published.to_a if used_ids.empty?

      published.where.not(id: used_ids).to_a
    end

    def jurisdiction_name(id)
      jurisdiction_names[id] ||
        I18n.t("reports.step_code_part_9.unknown_jurisdiction")
    end

    def jurisdiction_names
      @jurisdiction_names ||=
        Jurisdiction
          .where(id: created_grouped_counts.keys.map(&:first))
          .each_with_object({}) do |jurisdiction, memo|
            memo[jurisdiction.id] = jurisdiction.qualified_name.presence ||
              jurisdiction.name
          end
    end
  end
end
