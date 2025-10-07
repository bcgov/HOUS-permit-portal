class AddLtsaMatcherToJurisdictions < ActiveRecord::Migration[7.2]
  def up
    add_column :jurisdictions, :ltsa_matcher, :string
    add_index :jurisdictions, :ltsa_matcher

    Jurisdiction.find_each(&:save)
  end

  def down
    remove_index :jurisdictions, :ltsa_matcher
    remove_column :jurisdictions, :ltsa_matcher
  end
end
