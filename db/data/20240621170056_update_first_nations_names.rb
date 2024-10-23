# frozen_string_literal: true

class UpdateFirstNationsNames < ActiveRecord::Migration[7.1]
  def up
    Jurisdiction.find_by_name("Tsleil-Waututh Nation")&.update(
      name: "Tsleil-Waututh (tSLAY-way-tooth) səlilwətaɬ"
    )
  end

  def down
    Jurisdiction.find_by_name(
      "Tsleil-Waututh (tSLAY-way-tooth) səlilwətaɬ"
    )&.update(name: "Tsleil-Waututh Nation")
  end
end
