class CreatePermitApplications < ActiveRecord::Migration[7.1]
  def change
    create_table :permit_applications, id: :uuid do |t|
      t.integer :status, default: 0
      t.references :submitter,
                   null: false,
                   foreign_key: {
                     to_table: :users
                   },
                   type: :uuid
      t.references :jurisdiction, null: false, foreign_key: true, type: :uuid
      t.timestamps
    end
  end
end
