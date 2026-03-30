class CreatePart3OccupancyRequiredSteps < ActiveRecord::Migration[7.1]
  def change
    create_table :part3_occupancy_required_steps, id: :uuid do |t|
      t.references :jurisdiction,
                   null: false,
                   foreign_key: {
                     on_delete: :cascade
                   },
                   type: :uuid
      t.string :occupancy_key, null: false
      t.integer :energy_step_required, null: false
      t.integer :zero_carbon_step_required

      t.timestamps
    end

    add_index :part3_occupancy_required_steps,
              %i[jurisdiction_id occupancy_key],
              name: "idx_part3_occ_req_steps_jurisdiction_occupancy"
  end
end
