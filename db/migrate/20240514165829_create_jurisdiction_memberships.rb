class CreateJurisdictionMemberships < ActiveRecord::Migration[7.1]
  def change
    create_table :jurisdiction_memberships, id: :uuid do |t|
      t.references :jurisdiction, null: false, foreign_key: true, type: :uuid
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.timestamps
    end
  end

  def data
    User
      .where.not(jurisdiction_id: nil)
      .each { |user| user.update(jurisdiction_ids: [user.jurisdiction_id]) }
  end
end
