class MakeJurisdictionPrefixNotNull < ActiveRecord::Migration[7.1]
  def change
    change_column_null :jurisdictions, :prefix, false
  end
end
