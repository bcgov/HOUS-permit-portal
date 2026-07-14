FactoryBot.define do
  factory :template_version do
    transient do
      snapshot_blocks { {} }
      snapshot_sections { [] }
    end

    form_json do
      requirement_components =
        snapshot_blocks
          .values
          .flat_map { |block| block.fetch("requirements", []) }
          .filter_map do |requirement|
            { "id" => requirement["id"] } if requirement["id"].present?
          end

      if requirement_components.empty?
        {}
      else
        { "components" => requirement_components }
      end
    end
    snapshot_json do
      {
        "schema_version" => 1,
        "template" => {
          "id" => requirement_template.id,
          "nickname" => requirement_template.nickname,
          "description" => requirement_template.description,
          "tags" => requirement_template.tag_list
        },
        "sections" => snapshot_sections,
        # ponytail: callers often pass sparse block hashes; stamp key as id for Validator
        "blocks" =>
          snapshot_blocks.to_h do |block_id, block|
            next block_id, block unless block.is_a?(Hash)

            [block_id, block.merge("id" => block_id)]
          end
      }
    end
    version_diff { {} }
    version_date { "2024-02-15" }
    status { 1 }
    requirement_template do
      RequirementTemplate.first || association(:requirement_template)
    end
  end
end
