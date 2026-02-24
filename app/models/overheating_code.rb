class OverheatingCode < ApplicationRecord
  attribute :status, :integer
  enum :status, { draft: 0, submitted: 1 }

  attribute :submittal_type, :integer
  enum :submittal_type, { whole_house: 0, room_by_room: 1 }, prefix: true

  attribute :units, :integer
  enum :units, { imperial: 0, metric: 1 }, prefix: true

  # [OVERHEATING TODO] Confirm attachment enum values with domain expert
  attribute :attachment, :integer
  enum :attachment,
       {
         detached: 0,
         left: 1,
         right: 2,
         mid_row: 3,
         top: 4,
         bottom: 5,
         mid_level: 6
       },
       prefix: true

  attribute :front_facing, :integer
  enum :front_facing,
       {
         north: 0,
         northeast: 1,
         east: 2,
         southeast: 3,
         south: 4,
         southwest: 5,
         west: 6,
         northwest: 7
       },
       prefix: true

  attribute :air_tightness_category, :integer
  enum :air_tightness_category,
       { test: 0, loose: 1, average: 2, present: 3, energy_tight: 4 },
       prefix: true

  attribute :wind_exposure, :integer
  enum :wind_exposure,
       {
         open_sea: 0,
         mud_flats: 1,
         open_flat_terrain: 2,
         low_crops: 3,
         high_crops: 4,
         parkland: 5,
         suburban: 6,
         city_centre: 7
       },
       prefix: true

  attribute :wind_sheltering, :integer
  enum :wind_sheltering,
       { none: 0, light: 1, heavy: 2, very_heavy: 3, complete: 4 },
       prefix: true

  attribute :internal_shading, :integer
  enum :internal_shading,
       { none: 0, light_translucent: 1, opaque_reflective: 2 },
       prefix: true

  attribute :calculation_units, :integer
  enum :calculation_units, { imperial: 0, metric: 1 }, prefix: true

  attribute :soil_conductivity, :integer
  enum :soil_conductivity, { normal: 0, high: 1 }, prefix: true

  attribute :water_table_depth, :integer
  enum :water_table_depth, { shallow: 0, normal: 1, deep: 2 }, prefix: true

  belongs_to :creator, class_name: "User", foreign_key: "creator_id"
  belongs_to :jurisdiction, optional: true

  validates :creator, presence: true
  validates :postal_code,
            format: {
              with: /\AV\d[A-Z]\s?\d[A-Z]\d\z/i,
              message: "must be a valid BC postal code (e.g. V7L 1C3)"
            },
            allow_blank: true
end
