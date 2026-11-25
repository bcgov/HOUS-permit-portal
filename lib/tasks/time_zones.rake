namespace :time_zones do
  desc "Read-only verification of Vancouver rules in Rails, PostgreSQL and PDF Chromium"
  task check: :environment do
    failures = []
    checks = {
      "2026-01-15T20:00:00Z" => "2026-01-15T12:00:00-08:00",
      "2026-11-01T09:00:00Z" => "2026-11-01T02:00:00-07:00",
      "2027-02-01T07:30:00Z" => "2027-02-01T00:30:00-07:00"
    }
    checks.each do |instant, expected|
      unless Time.iso8601(instant).in_time_zone.iso8601 == expected
        failures << "Rails: #{instant}"
      end
      sql =
        ActiveRecord::Base.sanitize_sql_array(
          [
            "SELECT to_char(?::timestamptz AT TIME ZONE 'America/Vancouver', 'YYYY-MM-DD\"T\"HH24:MI:SS')",
            instant
          ]
        )
      unless ActiveRecord::Base.connection.select_value(sql) == expected[0, 19]
        failures << "PostgreSQL: #{instant}"
      end
    end

    report = {
      kind: "application",
      identity: {
        submission_version_id: "timezone-check",
        submitted_at: "2027-02-01T07:30:00Z"
      },
      form_json: {
        components: [
          { type: "datetime", key: "instant", label: "Vancouver rule check" }
        ]
      },
      submission_data: {
        data: {
          instant: "2027-02-01T07:30:00Z"
        }
      }
    }
    begin
      PrintReports::Renderer
        .new
        .render(report) do |path|
          text = PDF::Reader.new(path).pages.map(&:text).join(" ")
          unless text.include?("2027-02-01") && !text.include?("2027-01-31")
            failures << "PDF Chromium: winter midnight"
          end
        end
    rescue PrintReports::Renderer::Error => error
      failures << "PDF Chromium: #{error.message}"
    end

    if failures.any?
      abort("Vancouver time checks failed:\n#{failures.join("\n")}")
    end
    puts "Vancouver time checks passed: Rails, PostgreSQL, PDF Chromium. No application records changed."
  end
end
