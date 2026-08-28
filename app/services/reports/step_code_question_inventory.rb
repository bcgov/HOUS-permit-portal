module Reports
  class StepCodeQuestionInventory
    PATH = Rails.root.join("docs/step-code-question-inventory.md")

    def self.markdown
      new.markdown
    end

    def self.write!
      PATH.write(markdown)
      PATH
    end

    def markdown
      lines = [
        "# Step Code Part 9 question inventory",
        "",
        "Generated from the Part 9 checklist schema. Columns marked **Yes** under Feeds reports are used by the Super Admin compliance report or the characteristics export.",
        "",
        "| Question | Field type | Feeds reports |",
        "| --- | --- | --- |"
      ]

      checklist_fields.each { |row| lines << table_row(row) }
      data_entry_fields.each { |row| lines << table_row(row) }
      lines +
        [
          "",
          "Checklist enums: building type, compliance path, and stage are stored as integers with the names above.",
          "Characteristics not captured for a submission are exported as empty cells, never as zero."
        ]
    end

    private

    def table_row(row)
      feeds = row[:feeds] ? "Yes" : "No"
      "| #{row[:question]} | #{row[:field_type]} | #{feeds} |"
    end

    def checklist_fields
      [
        {
          question: "Stage",
          field_type: "enum (pre_construction, mid_construction, as_built)",
          feeds: false
        },
        { question: "Building type", field_type: "enum", feeds: true },
        { question: "Compliance path", field_type: "enum", feeds: true },
        {
          question: "Checklist status",
          field_type: "enum (draft, complete)",
          feeds: false
        },
        {
          question: "Energy step achieved",
          field_type: "computed integer",
          feeds: true
        },
        {
          question: "Zero carbon step achieved",
          field_type: "computed integer",
          feeds: true
        },
        {
          question: "Compliance outcome",
          field_type: "computed (pass / fail / incomplete)",
          feeds: true
        }
      ]
    end

    def data_entry_fields
      Reports::StepCodePart9::DETAIL_COLUMNS.map do |column|
        {
          question: column[:label],
          field_type: "export column",
          feeds: column[:feeds_report]
        }
      end
    end
  end
end
