# spec/support/customization_helpers.rb
module CustomizationHelpers
  include TestConstants

  def build_requirement_block_changes(
    include_electives: false,
    include_tips: false
  )
    changes = {
      REQUIREMENT_BLOCK_IDS[0] => {
      }, # No changes for the first block
      REQUIREMENT_BLOCK_IDS[1] => {
      }
    }

    if include_electives
      changes[REQUIREMENT_BLOCK_IDS[1]][
        "enabled_elective_field_ids"
      ] = REQUIREMENT_IDS
      changes[REQUIREMENT_BLOCK_IDS[1]]["enabled_elective_field_reasons"] = {
        REQUIREMENT_IDS[2] => "policy",
        REQUIREMENT_IDS[1] => "zoning",
        REQUIREMENT_IDS[0] => "zoning"
      }
    end

    if include_tips
      changes[REQUIREMENT_BLOCK_IDS[1]]["tip"] = "This is a tip for block 2"
    end

    changes
  end
end
