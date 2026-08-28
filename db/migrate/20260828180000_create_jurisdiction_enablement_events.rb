# frozen_string_literal: true

class CreateJurisdictionEnablementEvents < ActiveRecord::Migration[7.2]
  def change
    create_table :jurisdiction_enablement_events, id: :uuid do |t|
      t.references :jurisdiction, null: false, foreign_key: true, type: :uuid
      t.integer :feature, null: false, default: 0
      t.boolean :enabled, null: false
      t.datetime :occurred_at, null: false
      t.integer :source, null: false
      t.timestamps
    end

    add_index :jurisdiction_enablement_events,
              %i[jurisdiction_id feature occurred_at],
              name: "idx_enablement_events_on_jurisdiction_feature_occurred"
  end
end
