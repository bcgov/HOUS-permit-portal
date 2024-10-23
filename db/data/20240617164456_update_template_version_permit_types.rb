# frozen_string_literal: true

class UpdateTemplateVersionPermitTypes < ActiveRecord::Migration[7.1]
  def up
    PermitType.find_by_code("low_residential")&.update(
      name: "1-4 Unit detached housing",
      description: "1-4 units: Detatched dwellings, duplexes"
    )
    PermitType.find_by_code("medium_residential")&.update(
      name: "4+ Unit housing",
      description: "Part 9 townhouses, small apartment buildings"
    )
    PermitType.find_by_code("high_residential")&.update(
      name: "High density appartment buildings",
      description: "Highest density residential structures"
    )

    update_template_version_jsons
  end

  def down
    PermitType.find_by_code("low_residential")&.update(
      name: "Low desnity residential",
      description: "1-4 units: Detatched dwellings, duplexes"
    )
    PermitType.find_by_code("medium_residential")&.update(
      name: "Medium density Residential",
      description: "Part 9 townhouses, small apartment buildings"
    )
    PermitType.find_by_code("high_residential")&.update(
      name: "High density residential",
      description: "Highest density residential structures"
    )

    update_template_version_jsons
  end

  def update_template_version_jsons
    TemplateVersion.find_each do |template_version|
      json = template_version.denormalized_template_json

      # Update the fields
      json["label"] = template_version.requirement_template.label
      json["permit_type"]["name"] = template_version
        .requirement_template
        .permit_type
        .name
      json["permit_type"]["description"] = template_version
        .requirement_template
        .permit_type
        .description

      # Save the updated json back to the model
      template_version.update(denormalized_template_json: json)
    end
  end
end
