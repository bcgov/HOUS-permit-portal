class CreateMechanicalEnergyUseIntensityReferences < ActiveRecord::Migration[
  7.1
]
  def change
    create_table :mechanical_energy_use_intensity_references, id: :uuid do |t|
      t.int4range :hdd
      t.numrange :conditioned_space_percent
      t.integer :step
      t.int4range :conditioned_space_area
      t.integer :meui
      t.timestamps
    end

    add_index :mechanical_energy_use_intensity_references,
              %i[hdd conditioned_space_percent step conditioned_space_area],
              unique: true,
              name: "meui_composite_index"
  end
end
