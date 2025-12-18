# frozen_string_literal: true

class UpdateTemplateVersionPermitTypes < ActiveRecord::Migration[7.1]
  def up
    description_field = description_field_name

    PermitType.find_by_code("low_residential")&.update(
      :name => "1-4 Unit detached housing",
      description_field => "1-4 units: Detatched dwellings, duplexes"
    )
    PermitType.find_by_code("medium_residential")&.update(
      :name => "4+ Unit housing",
      description_field => "Part 9 townhouses, small apartment buildings"
    )
    PermitType.find_by_code("high_residential")&.update(
      :name => "High density appartment buildings",
      description_field => "Highest density residential structures"
    )

    update_template_version_jsons
  end

  def down
    description_field = description_field_name

    PermitType.find_by_code("low_residential")&.update(
      :name => "Low desnity residential",
      description_field => "1-4 units: Detatched dwellings, duplexes"
    )
    PermitType.find_by_code("medium_residential")&.update(
      :name => "Medium density Residential",
      description_field => "Part 9 townhouses, small apartment buildings"
    )
    PermitType.find_by_code("high_residential")&.update(
      :name => "High density residential",
      description_field => "Highest density residential structures"
    )

    update_template_version_jsons
  end

  def description_field_name
    # Check if description_html column exists, otherwise use description
    if PermitType.column_names.include?("description_html")
      :description_html
    else
      :description
    end
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

      # Handle both description and description_html fields
      permit_type = template_version.requirement_template.permit_type
      description_value =
        (
          if permit_type.respond_to?(:description_html)
            permit_type.description_html
          else
            permit_type.description
          end
        )
      json["permit_type"]["description"] = description_value

      # Save the updated json back to the model
      template_version.update(denormalized_template_json: json)
    end
  end
end
