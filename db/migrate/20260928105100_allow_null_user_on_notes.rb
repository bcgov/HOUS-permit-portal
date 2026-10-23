class AllowNullUserOnNotes < ActiveRecord::Migration[7.2]
  def change
    change_column_null :notes, :user_id, true
  end
end
