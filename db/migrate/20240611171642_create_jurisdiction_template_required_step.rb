class CreateJurisdictionTemplateRequiredStep < ActiveRecord::Migration[7.1]
  def change
    create_table :jurisdiction_template_required_steps, id: :uuid do |t|
      t.references :jurisdiction, null: false, foreign_key: true, type: :uuid
      t.references :requirement_template, null: false, foreign_key: true, type: :uuid
      t.integer :energy_step_required
      t.integer :zero_carbon_step_required

      t.timestamps
    end

    change_table :jurisdictions do |t|
      t.remove :energy_step_required, :zero_carbon_step_required
    end
  end

  def data
    Jurisdiction.find_each do |jurisdiction|
      energy_step_required = jurisdiction.energy_step_required
      zero_carbon_step_required = jurisdiction.zero_carbon_step_required

      RequirementTemplate.find_each do |requirement_template|
        JurisdictionTemplateRequiredStep.create!(
          jurisdiction: jurisdiction,
          requirement_template: requirement_template,
          energy_step_required: energy_step_required,
          zero_carbon_step_required: zero_carbon_step_required,
        )
      end
    end
  end
end
