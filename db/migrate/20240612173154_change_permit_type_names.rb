class ChangePermitTypeNames < ActiveRecord::Migration[7.1]
  def change
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
  end
end
