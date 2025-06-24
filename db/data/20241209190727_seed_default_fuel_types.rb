# frozen_string_literal: true

class SeedDefaultFuelTypes < ActiveRecord::Migration[7.1]
  def up
    Part3StepCode::FuelType::DEFAULTS.each do |ft|
      Part3StepCode::FuelType.where(key: ft[:key]).first_or_create!(ft)
    end
  end

  def down
    Part3StepCode::FuelType.defaults.destroy_all
  end
end
