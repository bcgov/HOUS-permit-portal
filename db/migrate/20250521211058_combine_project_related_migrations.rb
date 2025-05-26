class CombineProjectRelatedMigrations < ActiveRecord::Migration[7.1]
  def change
    # From 20250509210248_create_project_related_entities_and_payment_details.rb
    create_table :property_plan_jurisdictions, id: :uuid do |t|
      t.references :jurisdiction,
                   null: false,
                   foreign_key: true,
                   type: :uuid,
                   index: {
                     name: "idx_pplj_on_jurisdiction_id"
                   }
      t.string :principal_use
      t.string :accessory_use
      t.string :setbacks
      t.string :elevations
      t.boolean :supporting_documents_required
      t.string :ocp_status

      t.timestamps
    end

    create_table :permit_projects, id: :uuid do |t|
      t.text :description
      t.text :notes
      t.string :permit_project_status
      t.references :property_plan_jurisdiction,
                   type: :uuid,
                   foreign_key: true,
                   null: true

      t.timestamps
    end

    # From 20250521211057_add_owner_to_permit_projects.rb
    # Added owner_id to permit_projects
    add_reference :permit_projects,
                  :owner,
                  null: false, # Assuming owner is mandatory
                  foreign_key: {
                    to_table: :users
                  },
                  type: :uuid

    # Table for PaymentDetail from 20250509210248
    create_table :payment_details, id: :uuid do |t|
      t.string :external_service_name
      t.string :payment_service
      t.string :payment_status

      t.timestamps
    end

    # Table for PermitProjectPaymentDetail from 20250509210248
    create_table :permit_project_payment_details, id: :uuid do |t|
      t.references :permit_project,
                   null: false,
                   foreign_key: true,
                   type: :uuid,
                   index: {
                     unique: true
                   }
      t.references :payment_detail,
                   null: false,
                   foreign_key: true,
                   type: :uuid,
                   index: {
                     unique: true
                   }

      t.timestamps
    end

    # Table for PaymentDetailTransaction from 20250509210248
    create_table :payment_detail_transactions, id: :uuid do |t|
      t.string :transaction_type
      t.decimal :transaction_amount, precision: 10, scale: 2
      t.string :transaction_status
      t.text :transaction_service_response
      t.references :payment_detail, null: false, foreign_key: true, type: :uuid

      t.timestamps
    end

    # From 20250521165640_create_project_memberships_and_drop_old_join_table.rb
    # Create the new project_memberships table
    create_table :project_memberships, id: :uuid do |t|
      t.references :permit_project, null: false, foreign_key: true, type: :uuid
      t.uuid :item_id, null: false
      t.string :item_type, null: false
      # t.boolean :is_primary_item, default: false # We'll determine primary dynamically for now

      t.timestamps
    end

    add_index :project_memberships, %i[item_id item_type]
    add_index :project_memberships,
              %i[permit_project_id item_id item_type],
              unique: true,
              name: "index_project_memberships_on_project_and_item"
  end
end
