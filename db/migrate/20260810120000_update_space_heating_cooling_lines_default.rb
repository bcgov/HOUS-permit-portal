# HUB-5472: New BCS records get four open heating/cooling lines instead of
# principal/secondary variant placeholders. Existing rows are left unchanged.
class UpdateSpaceHeatingCoolingLinesDefault < ActiveRecord::Migration[7.2]
  def change
    change_column_default :step_code_building_characteristics_summaries,
                          :space_heating_cooling_lines,
                          from: [
                            { "variant" => "principal" },
                            { "variant" => "secondary" }
                          ],
                          to: [{}, {}, {}, {}]
  end
end
