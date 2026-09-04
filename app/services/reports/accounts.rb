module Reports
  class Accounts < Base
    def headline_figures
      [
        figure("total_accounts", User.kept.count),
        figure("new_accounts", new_accounts.count)
      ]
    end

    def charts
      [
        chart(
          "new_by_month",
          "stacked_bar",
          x_key: "period",
          series:
            role_keys.map { |role| { key: role, label: role_label(role) } },
          data: new_by_month_rows,
          record_count: new_accounts.count
        )
      ]
    end

    def tables
      [
        table(
          "new_by_month",
          [
            column("period"),
            *role_keys.map { |role| { key: role, label: role_label(role) } }
          ],
          new_by_month_rows
        ),
        table(
          "cumulative_by_month",
          [
            column("period"),
            *role_keys.map { |role| { key: role, label: role_label(role) } }
          ],
          cumulative_by_month_rows
        ),
        table(
          "by_jurisdiction",
          [column("jurisdiction"), column("role"), column("count")],
          by_jurisdiction_rows
        )
      ]
    end

    def notes
      [
        note("accounts_not_activity", "definition"),
        note("discarded_excluded", "definition"),
        note("active_users", "not_measured")
      ]
    end

    def empty?
      User.kept.none?
    end

    private

    def column(key)
      { key: key, label: I18n.t("reports.accounts.columns.#{key}") }
    end

    def new_accounts
      @new_accounts ||= range.apply(User.kept, "users.created_at")
    end

    def role_keys
      User.roles.keys
    end

    def role_label(role)
      role.to_s.humanize
    end

    def new_by_month_rows
      @new_by_month_rows ||= monthly_role_rows(new_accounts)
    end

    def cumulative_by_month_rows
      @cumulative_by_month_rows ||=
        begin
          months = months_in_range(User.kept, "users.created_at")
          running = role_keys.index_with { 0 }
          if months.any?
            User
              .kept
              .where("users.created_at < ?", months.first)
              .group(:role)
              .count
              .each do |role, count|
                running[normalize_role(role)] += count.to_i
              end
          end

          monthly_role_rows(User.kept).map do |row|
            next_row = { "period" => row["period"] }
            role_keys.each do |role|
              running[role] += row[role].to_i
              next_row[role] = running[role]
            end
            next_row
          end
        end
    end

    def monthly_role_rows(scope)
      grouped =
        scope.group(
          Arel.sql("date_trunc('month', users.created_at)"),
          :role
        ).count
      by_month = Hash.new { |hash, key| hash[key] = Hash.new(0) }
      grouped.each do |(timestamp, role), count|
        next if timestamp.blank?

        month = timestamp.to_date.beginning_of_month
        by_month[month][normalize_role(role)] += count.to_i
      end

      months_in_range(scope, "users.created_at").map do |month|
        row = { "period" => month.strftime("%Y-%m") }
        role_keys.each { |role| row[role] = by_month[month][role].to_i }
        row
      end
    end

    def by_jurisdiction_rows
      grouped =
        User
          .kept
          .joins(jurisdiction_memberships: :jurisdiction)
          .group("jurisdictions.name", "users.role")
          .count

      grouped
        .map do |(jurisdiction_name, role), count|
          {
            "jurisdiction" => jurisdiction_name.to_s,
            "role" => role_label(normalize_role(role)),
            "count" => count.to_i
          }
        end
        .sort_by { |row| [row["jurisdiction"], row["role"]] }
    end

    def normalize_role(role)
      return role.to_s if role.present? && User.roles.key?(role.to_s)

      User.roles.key(role.to_i).to_s
    end
  end
end
