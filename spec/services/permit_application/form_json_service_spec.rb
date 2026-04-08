require "rails_helper"

RSpec.describe PermitApplication::FormJsonService do
  let(:template_version) { instance_double("TemplateVersion") }
  let(:permit_application) do
    instance_double("PermitApplication", template_version: template_version)
  end

  def build_service(
    form_json:,
    requirement_blocks_json:,
    energy_required: false,
    form_customizations: nil,
    current_user: nil,
    permissions: nil
  )
    allow(template_version).to receive(:form_json).and_return(form_json)
    allow(template_version).to receive(:requirement_blocks_json).and_return(
      requirement_blocks_json
    )
    allow(permit_application).to receive(
      :energy_step_code_required?
    ).and_return(energy_required)
    allow(permit_application).to receive(:form_customizations).and_return(
      form_customizations
    )
    if current_user
      allow(permit_application).to receive(
        :submission_requirement_block_edit_permissions
      ).with(user_id: current_user.id).and_return(permissions)
    end
    described_class.new(
      permit_application: permit_application,
      current_user: current_user
    )
  end

  it "removes blocks that are empty based on elective enablement and removes empty sections" do
    form_json = {
      "components" => [
        { "components" => [{ "id" => "rb1" }, { "id" => "rb2" }] },
        { "components" => [] }
      ]
    }

    requirement_blocks_json = {
      "rb1" => {
        "requirements" => [{ "id" => "e1", "elective" => true }],
        "sku" => "RB1"
      },
      "rb2" => {
        "requirements" => [{ "id" => "e2", "elective" => true }],
        "sku" => "RB2"
      }
    }

    form_customizations = {
      "requirement_block_changes" => {
        "rb1" => {
          "enabled_elective_field_ids" => []
        },
        "rb2" => {
          "enabled_elective_field_ids" => ["missing"]
        } # invalid => block removed
      }
    }

    service =
      build_service(
        form_json: form_json,
        requirement_blocks_json: requirement_blocks_json,
        form_customizations: form_customizations
      )

    service.call

    # both sections become empty and are removed
    expect(service.form_json["components"]).to eq([])
  end

  it "adds collaboration-based filtering when current_user is provided" do
    form_json = {
      "components" => [
        { "components" => [{ "id" => "rb1" }, { "id" => "rb2" }] }
      ]
    }

    requirement_blocks_json = {
      "rb1" => {
        "requirements" => [{ "id" => "r1", "elective" => false }]
      },
      "rb2" => {
        "requirements" => [{ "id" => "r2", "elective" => false }]
      }
    }

    user = instance_double("User", id: "u1")
    service =
      build_service(
        form_json: form_json,
        requirement_blocks_json: requirement_blocks_json,
        current_user: user,
        permissions: ["rb1"]
      )

    service.call

    expect(service.form_json.dig("components", 0, "components")).to eq(
      [{ "id" => "rb1" }]
    )
  end

  it "sets energy step code fields required based on permit_application.energy_step_code_required?" do
    form_json = {
      "components" => [
        {
          "key" => "x_energy_step_code_method",
          "components" => [{ "key" => "y_energy_step_code_report_file" }]
        }
      ]
    }

    requirement_blocks_json = {}

    service =
      build_service(
        form_json: form_json,
        requirement_blocks_json: requirement_blocks_json,
        energy_required: true
      )

    service.call

    expect(
      service.form_json.dig("components", 0, "validate", "required")
    ).to eq(true)
    expect(
      service.form_json.dig(
        "components",
        0,
        "components",
        0,
        "validate",
        "required"
      )
    ).to eq(true)
  end
end
