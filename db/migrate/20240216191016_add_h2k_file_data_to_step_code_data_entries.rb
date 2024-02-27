class AddH2kFileDataToStepCodeDataEntries < ActiveRecord::Migration[7.1]
  def change
    add_column :step_code_data_entries, :h2k_file_data, :string
  end
end
