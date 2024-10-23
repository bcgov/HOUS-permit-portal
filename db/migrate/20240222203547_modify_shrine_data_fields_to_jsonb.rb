class ModifyShrineDataFieldsToJsonb < ActiveRecord::Migration[7.1]
  def change
    change_column :supporting_documents,
                  :file_data,
                  :jsonb,
                  using: "file_data::text::jsonb"
  end
end
