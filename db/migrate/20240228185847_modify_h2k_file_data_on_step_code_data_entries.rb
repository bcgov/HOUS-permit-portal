class ModifyH2kFileDataOnStepCodeDataEntries < ActiveRecord::Migration[7.1]
  def change
    change_column :step_code_data_entries,
                  :h2k_file_data,
                  :jsonb,
                  using: "h2k_file_data::text::jsonb"
  end
end
