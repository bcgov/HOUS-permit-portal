class AddDiscardedAtToPdfForms < ActiveRecord::Migration[7.2]
  def up
    unless column_exists?(:pdf_forms, :discarded_at)
      add_column :pdf_forms, :discarded_at, :datetime
      add_index :pdf_forms, :discarded_at
    end
  end

  def down
    if column_exists?(:pdf_forms, :discarded_at)
      remove_column :pdf_forms, :discarded_at
    end
  end
end
