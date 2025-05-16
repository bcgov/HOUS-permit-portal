class CreateProjectRelatedEntitiesAndPaymentDetails < ActiveRecord::Migration[
  7.1
]
  def change
    # Table for PropertyPlanLocalJurisdiction
    create_table :property_plan_local_jurisdictions, id: :uuid do |t|
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

    # Table for PermitProject
    create_table :permit_projects, id: :uuid do |t|
      t.text :description
      t.text :notes
      t.string :permit_project_status
      t.references :property_plan_local_jurisdiction,
                   type: :uuid,
                   foreign_key: true,
                   null: true

      t.timestamps
    end

    # Join table for PermitApplication and PermitProject (PermitProjectPermitApplication)
    create_table :permit_project_permit_applications, id: :uuid do |t|
      t.references :permit_application,
                   null: false,
                   foreign_key: true,
                   type: :uuid,
                   index: {
                     name: "idx_proj_app_on_app_id"
                   }
      t.references :permit_project,
                   null: false,
                   foreign_key: true,
                   type: :uuid,
                   index: {
                     name: "idx_proj_app_on_proj_id"
                   }

      t.timestamps
    end
    # Add a unique index to ensure a permit application is associated with a project only once
    add_index :permit_project_permit_applications,
              %i[permit_application_id permit_project_id],
              unique: true,
              name: "index_permit_project_apps_on_app_id_and_project_id"

    # Table for PaymentDetail
    create_table :payment_details, id: :uuid do |t|
      t.string :external_service_name
      t.string :payment_service
      t.string :payment_status

      t.timestamps
    end

    # Table for PermitProjectPaymentDetail (connects PermitProject and PaymentDetail)
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

    # Table for PaymentDetailTransaction
    create_table :payment_detail_transactions, id: :uuid do |t|
      t.string :transaction_type
      t.decimal :transaction_amount, precision: 10, scale: 2
      t.string :transaction_status
      t.text :transaction_service_response
      t.references :payment_detail, null: false, foreign_key: true, type: :uuid

      t.timestamps
    end
  end
end
