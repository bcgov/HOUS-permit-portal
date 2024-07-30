class AddDiscardToRevisionReasons < ActiveRecord::Migration[7.1]
  def change
    add_column :revision_reasons, :_discard, :boolean
  end
end
