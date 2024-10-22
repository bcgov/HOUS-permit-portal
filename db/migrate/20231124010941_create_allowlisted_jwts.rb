class CreateAllowlistedJwts < ActiveRecord::Migration[7.1]
  def change
    create_table :allowlisted_jwts, id: :uuid do |t|
      t.string :jti, null: false
      t.string :aud
      t.datetime :exp, null: false
      t.references :user,
                   foreign_key: {
                     on_delete: :cascade
                   },
                   null: false,
                   type: :uuid
      t.timestamps
    end

    add_index :allowlisted_jwts, :jti, unique: true
  end
end
