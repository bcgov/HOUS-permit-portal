class CreatePermitTypeRequiredStep < ActiveRecord::Migration[7.1]
  def up
    create_table :permit_type_required_steps, id: :uuid do |t|
      t.references :jurisdiction, null: false, foreign_key: true, type: :uuid
      t.references :permit_type,
                   foreign_key: {
                     to_table: :permit_classifications
                   },
                   type: :uuid
      t.integer :energy_step_required
      t.integer :zero_carbon_step_required
      t.boolean :default

      t.timestamps
    end

    change_table :jurisdictions do |t|
      t.remove :energy_step_required, :zero_carbon_step_required
    end
  end

  def down
    change_table :jurisdictions do |t|
      t.integer :energy_step_required
      t.integer :zero_carbon_step_required
    end

    drop_table :permit_type_required_steps
  end

  def data
    PermitTypeRequiredStepSeeder.seed
  end
end
