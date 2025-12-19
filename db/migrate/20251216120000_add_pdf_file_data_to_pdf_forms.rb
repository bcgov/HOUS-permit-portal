class AddPdfFileDataToPdfForms < ActiveRecord::Migration[7.1]
  def change
    # [OVERHEATING REVIEW] Mini-lesson: index only what you query.
    # A GIN index on a JSONB blob can be expensive; add it when you have a concrete query that needs it
    # (e.g. filtering by a key inside `pdf_file_data`). If not needed, prefer no index or a targeted expression index.
    add_column :pdf_forms, :pdf_file_data, :jsonb
    add_index :pdf_forms, :pdf_file_data, using: :gin
  end
end
