# frozen_string_literal: true

class UpdateJurisdictionMapData < ActiveRecord::Migration[7.2]
  # Maximum number of boundary points to store per jurisdiction (simplification)
  MAX_BOUNDARY_POINTS = 200

  def up
    updated = 0
    skipped = 0
    errored = 0

    bc_boundaries = Wrappers::BcAdminBoundaries.new

    Jurisdiction.find_each do |jurisdiction|
      if jurisdiction.map_position.present?
        skipped += 1
        next
      end

      if jurisdiction.ltsa_matcher.blank?
        Rails.logger.warn(
          "  No ltsa_matcher for #{jurisdiction.qualified_name}, skipping"
        )
        skipped += 1
        next
      end

      # Determine which BC boundary layer to query
      layer_id =
        (
          if jurisdiction.is_a?(RegionalDistrict)
            Wrappers::BcAdminBoundaries::REGIONAL_DISTRICTS_LAYER
          else
            Wrappers::BcAdminBoundaries::MUNICIPALITIES_LAYER
          end
        )

      # Build ordered list of search terms to try (primary, then fallbacks)
      terms = search_terms_for(jurisdiction.ltsa_matcher)

      begin
        geometry = nil
        matched_term = nil

        terms.each do |term|
          geometry =
            bc_boundaries.fetch_feature_geometry(
              layer_id: layer_id,
              search_term: term
            )
          if geometry && geometry["rings"].present?
            matched_term = term
            break
          end
          sleep(0.1)
        end

        unless geometry && geometry["rings"].present?
          # Fallback: geocode the postal address for map_position only (no boundary)
          if jurisdiction.postal_address.present?
            position = geocode_address(jurisdiction.postal_address)
            if position
              jurisdiction.update_columns(map_position: position, map_zoom: 13)
              Rails.logger.info(
                "  Fallback (postal address) #{jurisdiction.qualified_name} " \
                  "-> [#{position.map { |c| c.round(4) }.join(", ")}] zoom=13 (no boundary)"
              )
              updated += 1
              next
            end
          end

          Rails.logger.warn(
            "  No geometry for #{jurisdiction.qualified_name} (tried: #{terms.map { |t| "'#{t}'" }.join(", ")} on layer #{layer_id})"
          )
          errored += 1
          next
        end

        rings = geometry["rings"]
        outer_ring = rings.first
        centroid = compute_centroid(outer_ring)
        zoom = zoom_for_extent(outer_ring)
        simplified_boundary = simplify_ring(outer_ring, MAX_BOUNDARY_POINTS)

        jurisdiction.update_columns(
          map_position: [centroid[:lng], centroid[:lat]],
          map_zoom: zoom,
          boundary_points: simplified_boundary
        )

        Rails.logger.info(
          "  Updated #{jurisdiction.qualified_name} " \
            "-> [#{centroid[:lng].round(4)}, #{centroid[:lat].round(4)}] " \
            "zoom=#{zoom} (#{simplified_boundary.length} boundary points)"
        )
        updated += 1
      rescue => e
        Rails.logger.error(
          "  Error for #{jurisdiction.qualified_name}: #{e.message}"
        )
        errored += 1
      end

      sleep(0.2) # Throttle API requests
    end

    Rails.logger.info(
      "UpdateJurisdictionMapData complete: #{updated} updated, #{skipped} skipped, #{errored} errors"
    )
  end

  def down
    return unless Rails.env.development?

    Jurisdiction.update_all(
      map_position: nil,
      map_zoom: nil,
      boundary_points: []
    )
    Rails.logger.info(
      "UpdateJurisdictionMapData: cleared map_position, map_zoom, and boundary_points for all jurisdictions"
    )
  end

  private

  # Build an ordered list of search terms to try against the BC boundary layer.
  #
  # Strategy:
  #   1. Primary: cleaned full name (strip "Corporation of the", periods, apostrophes)
  #   2. Fallback: core place name only (the part before the comma)
  #
  # For regional districts (no comma), we strip "Regional District of" / "The " and
  # return the core name.
  #
  # The wrapper's LIKE query joins words with % wildcards, so separator differences
  # (spaces vs hyphens) are handled automatically.
  def search_terms_for(ltsa_matcher)
    terms = []

    if ltsa_matcher.include?(",")
      core_name, type_suffix = ltsa_matcher.split(",", 2).map(&:strip)

      # Primary: cleaned full name, e.g. "City of Rossland" (strips "Corporation of the")
      full_name = sanitize_name("#{type_suffix} #{core_name}")
      terms << full_name

      # Fallback: just the core place name, e.g. "Rossland"
      clean_core = sanitize_name(core_name)
      terms << clean_core if clean_core != full_name
    else
      # Regional districts / other direct formats
      core_name =
        ltsa_matcher
          .sub(/^Regional District of\s+/i, "")
          .sub(/^District of\s+/i, "")
          .sub(/^The\s+/i, "")

      terms << sanitize_name(core_name)
    end

    terms.uniq
  end

  # Strip legal prefixes and punctuation that differ between data sources.
  #
  # "Corporation of the City of Rossland" => "City of Rossland"
  # "Fort St. James" => "Fort St James"
  # "Hudson's Hope" => "Hudsons Hope"
  def sanitize_name(name)
    name
      .sub(/^Corporation of the\s+/i, "")
      .sub(/^The\s+/i, "")
      .gsub(".", "")
      .gsub("'", "")
      .gsub("\u2019", "") # right single quotation mark
      .strip
  end

  # Geocode an address string using the BC Address Geocoder.
  # Returns [lng, lat] or nil.
  def geocode_address(address)
    result = Wrappers::Geocoder.new.site_options_raw(address)
    coords = result.dig("features", 0, "geometry", "coordinates")
    return nil unless coords.is_a?(Array) && coords.length >= 2

    [coords[0], coords[1]] # [lng, lat]
  rescue => e
    Rails.logger.warn("  Geocode failed for '#{address}': #{e.message}")
    nil
  end

  # Determine an appropriate zoom level based on the geographic extent of the polygon.
  # Larger extent = more zoomed out. Uses the max span (lng or lat) in degrees.
  def zoom_for_extent(ring)
    lngs = ring.map { |coord| coord[0] }
    lats = ring.map { |coord| coord[1] }
    lng_span = lngs.max - lngs.min
    lat_span = lats.max - lats.min
    max_span = [lng_span, lat_span].max

    # Approximate mapping of degree span to zoom level
    # At BC latitudes (~49-60N), 1 degree lng ≈ 70-80km
    case max_span
    when 0..0.03
      12 # Very small (< ~2km)
    when 0.03..0.08
      11 # Small neighbourhood
    when 0.08..0.15
      10 # Small town
    when 0.15..0.4
      9 # Medium city
    when 0.4..0.8
      8 # Large city
    when 0.8..1.5
      7 # Metro area
    when 1.5..3.0
      6 # Small regional district
    when 3.0..6.0
      5 # Medium regional district
    when 6.0..10.0
      4 # Large regional district
    else
      3 # Very large (northern RDs)
    end
  end

  # Compute centroid as the average of all ring coordinates
  def compute_centroid(ring)
    return { lng: 0, lat: 0 } if ring.blank?

    sum_lng = ring.sum { |coord| coord[0] }
    sum_lat = ring.sum { |coord| coord[1] }
    count = ring.length.to_f

    { lng: sum_lng / count, lat: sum_lat / count }
  end

  # Simplify a ring by sampling every Nth point to stay under max_points.
  # Returns array of [lng, lat] tuples.
  def simplify_ring(ring, max_points)
    return ring if ring.length <= max_points

    step = (ring.length.to_f / max_points).ceil
    simplified =
      ring.each_with_index.filter_map { |coord, i| coord if (i % step).zero? }

    # Ensure the ring is closed (first point == last point)
    simplified << ring.last if simplified.last != ring.last

    simplified
  end
end
