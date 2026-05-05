class MakePermitClassificationsCodeEnum < ActiveRecord::Migration[7.1]
  def change
    unless table_exists?(:permit_classifications)
      say "permit_classifications table no longer exists; skipping"
      return
    end

    rename_column :permit_classifications, :code, :code_string
    add_column :permit_classifications, :code, :integer

    if defined?(PermitClassification)
      PermitClassification.reset_column_information

      PermitClassification.find_each do |pc|
        pc.update(code: PermitClassification.codes[pc.code_string])
      end
    else
      say "PermitClassification class removed; skipping code backfill"
    end

    remove_column :permit_classifications, :code_string
  end
end
