class CreateAssets < ActiveRecord::Migration[7.1]
  def change
    create_table :assets, id: :uuid do |t|
      t.timestamps
    end
  end
end
