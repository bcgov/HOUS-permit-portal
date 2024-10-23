class CreateThermalEnergyDemandIntensityReferences < ActiveRecord::Migration[
  7.1
]
  def change
    create_table :thermal_energy_demand_intensity_references, id: :uuid do |t|
      t.int4range :hdd
      t.integer :step
      t.decimal :ach
      t.decimal :nla
      t.decimal :nlr
      t.integer :ltrh_over_300 # meui percent lower than reference house
      t.integer :ltrh_under_300
      t.integer :tedi
      t.integer :hdd_adjusted_tedi
      t.integer :gshl_over_300
      t.integer :gshl_under_300
      t.timestamps
    end

    add_index :thermal_energy_demand_intensity_references,
              %i[hdd step],
              unique: true,
              name: "tedi_composite_index"
  end
end
