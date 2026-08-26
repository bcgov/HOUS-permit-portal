class AddDescriptionToStepCodePathways < ActiveRecord::Migration[7.1]
  def change
    add_column :jurisdiction_step_requirements, :description, :text
    add_column :part3_occupancy_required_steps, :description, :text
  end
end
