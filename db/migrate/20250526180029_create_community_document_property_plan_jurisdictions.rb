class CreateCommunityDocumentPropertyPlanJurisdictions < ActiveRecord::Migration[
  7.1
]
  def change
    create_table :community_document_property_plan_jurisdictions,
                 id: :uuid do |t|
      t.references :community_document,
                   null: false,
                   foreign_key: true,
                   type: :uuid
      t.references :property_plan_jurisdiction,
                   null: false,
                   foreign_key: true,
                   type: :uuid

      t.timestamps
    end
  end
end
