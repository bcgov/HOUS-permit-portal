class CreateStepCodeBuildingCharacteristicsSummaries < ActiveRecord::Migration[
  7.1
]
  def change
    create_table :step_code_building_characteristics_summaries, id: :uuid do |t|
      t.references :step_code_checklist,
                   foreign_key: true,
                   null: false,
                   type: :uuid

      t.jsonb :roof_ceilings_lines, default: [{}]
      t.jsonb :above_grade_walls_lines, default: [{}]
      t.jsonb :framings_lines, default: [{}]
      t.jsonb :unheated_floors_lines, default: [{}]
      t.jsonb :below_grade_walls_lines, default: [{}]
      t.jsonb :slabs_lines, default: [{}]
      t.jsonb :windows_glazed_doors,
              default: {
                performance_type: :usi,
                lines: [{}]
              }
      t.jsonb :doors_lines, default: [{ performance_type: :rsi }]
      t.jsonb :airtightness, default: {}
      t.jsonb :space_heating_cooling_lines,
              default: [{ variant: :principal }, { variant: :secondary }]
      t.jsonb :hot_water_lines, default: [{ performance_type: :ef }]
      t.jsonb :ventilation_lines, default: [{}]
      t.jsonb :other_lines, default: [{}]
      t.jsonb :fossil_fuels, default: {}
      t.timestamps
    end
  end
end
