class CreateJurisdictionTemplateRequiredStep < ActiveRecord::Migration[7.1]
  def up
    create_table :jurisdiction_template_required_steps, id: :uuid do |t|
      t.references :jurisdiction, null: false, foreign_key: true, type: :uuid
      t.references :requirement_template, null: false, foreign_key: true, type: :uuid
      t.integer :energy_step_required
      t.integer :zero_carbon_step_required

      t.timestamps
    end

    JurisdictionTemplateRequiredStepSeeder.seed

    change_table :jurisdictions do |t|
      t.remove :energy_step_required, :zero_carbon_step_required
    end
  end

  def down
    change_table :jurisdictions do |t|
      t.integer :energy_step_required
      t.integer :zero_carbon_step_required
    end

    drop_table :jurisdiction_template_required_steps
  end
end
