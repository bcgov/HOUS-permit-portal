class RemovePropertyPlanJurisdictionReferences < ActiveRecord::Migration[7.2]
  def change
    # Remove foreign key from permit_projects if it exists
    if foreign_key_exists?(:permit_projects, :property_plan_jurisdictions)
      remove_foreign_key :permit_projects, :property_plan_jurisdictions
    end

    # Remove the column if it exists
    if column_exists?(:permit_projects, :property_plan_jurisdiction_id)
      remove_reference :permit_projects,
                       :property_plan_jurisdiction,
                       type: :uuid
    end

    # Drop join table if it exists
    if table_exists?(:jurisdiction_document_property_plan_jurisdictions)
      drop_table :jurisdiction_document_property_plan_jurisdictions do |t|
        # Table definition would be here if needed for rollback
      end
    end

    # Drop property_plan_jurisdictions table if it exists
    if table_exists?(:property_plan_jurisdictions)
      drop_table :property_plan_jurisdictions do |t|
        # Table definition would be here if needed for rollback
      end
    end
  end
end
