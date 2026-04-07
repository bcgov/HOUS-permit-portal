# frozen_string_literal: true

class RepairBoundaryPoints < ActiveRecord::Migration[7.2]
  MAX_BOUNDARY_POINTS = 200

  def up
    updated = 0
    skipped = 0
    errored = 0

    bc_boundaries = Wrappers::BcAdminBoundaries.new

    Jurisdiction
      .where("boundary_points = '[]'::jsonb")
      .find_each do |jurisdiction|
        if jurisdiction.ltsa_matcher.blank?
          Rails.logger.warn(
            "  RepairBoundaryPoints: no ltsa_matcher for #{jurisdiction.qualified_name}, skipping"
          )
          skipped += 1
          next
        end

        layer_id =
          if jurisdiction.is_a?(RegionalDistrict)
            Wrappers::BcAdminBoundaries::REGIONAL_DISTRICTS_LAYER
          else
            Wrappers::BcAdminBoundaries::MUNICIPALITIES_LAYER
          end

        terms = search_terms_for(jurisdiction.ltsa_matcher)

        begin
          geometry = nil

          terms.each do |term|
            geometry =
              bc_boundaries.fetch_feature_geometry(
                layer_id: layer_id,
                search_term: term
              )
            break if geometry && geometry["rings"].present?
            sleep(0.1)
          end

          unless geometry && geometry["rings"].present?
            Rails.logger.warn(
              "  RepairBoundaryPoints: no geometry for #{jurisdiction.qualified_name} " \
                "(tried: #{terms.map { |t| "'#{t}'" }.join(", ")} on layer #{layer_id})"
            )
            skipped += 1
            next
          end

          rings = geometry["rings"]
          outer_ring = rings.first
          centroid = compute_centroid(outer_ring)
          zoom = zoom_for_extent(outer_ring)
          simplified_boundary = simplify_ring(outer_ring, MAX_BOUNDARY_POINTS)

          updates = { boundary_points: simplified_boundary, map_zoom: zoom }

          if jurisdiction.map_position.blank? ||
               jurisdiction.map_position == [0, 0]
            updates[:map_position] = [centroid[:lng], centroid[:lat]]
          end

          jurisdiction.update_columns(updates)

          Rails.logger.info(
            "  RepairBoundaryPoints: updated #{jurisdiction.qualified_name} " \
              "(#{simplified_boundary.length} boundary points, map_position #{updates[:map_position] ? "replaced" : "kept"})"
          )
          updated += 1
        rescue => e
          Rails.logger.error(
            "  RepairBoundaryPoints: error for #{jurisdiction.qualified_name}: #{e.message}"
          )
          errored += 1
        end

        sleep(0.2)
      end

    Rails.logger.info(
      "RepairBoundaryPoints complete: #{updated} updated, #{skipped} skipped, #{errored} errors"
    )
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end

  private

  # Simplified search terms: core name first (proven to work), then the full
  # sanitized name as fallback. Fixes the word-order mismatch that caused the
  # original migration to miss RegionalDistricts and some SubDistricts.
  def search_terms_for(ltsa_matcher)
    terms = []

    if ltsa_matcher.include?(",")
      core_name, type_suffix = ltsa_matcher.split(",", 2).map(&:strip)

      clean_core = sanitize_name(core_name)
      terms << clean_core

      full_name = sanitize_name("#{type_suffix} #{core_name}")
      terms << full_name if full_name != clean_core
    else
      core_name =
        ltsa_matcher
          .sub(/\s*Regional District$/i, "")
          .sub(/^Regional District of\s+/i, "")
          .sub(/^District of\s+/i, "")
          .sub(/^The\s+/i, "")

      terms << sanitize_name(core_name)
    end

    terms.uniq
  end

  def sanitize_name(name)
    name
      .sub(/^Corporation of the\s+/i, "")
      .sub(/^The\s+/i, "")
      .gsub(".", "")
      .gsub("'", "")
      .gsub("\u2019", "")
      .strip
  end

  def zoom_for_extent(ring)
    lngs = ring.map { |coord| coord[0] }
    lats = ring.map { |coord| coord[1] }
    max_span = [[lngs.max - lngs.min, lats.max - lats.min].max, 0].max

    case max_span
    when 0..0.03
      12
    when 0.03..0.08
      11
    when 0.08..0.15
      10
    when 0.15..0.4
      9
    when 0.4..0.8
      8
    when 0.8..1.5
      7
    when 1.5..3.0
      6
    when 3.0..6.0
      5
    when 6.0..10.0
      4
    else
      3
    end
  end

  def compute_centroid(ring)
    return { lng: 0, lat: 0 } if ring.blank?

    sum_lng = ring.sum { |coord| coord[0] }
    sum_lat = ring.sum { |coord| coord[1] }
    count = ring.length.to_f

    { lng: sum_lng / count, lat: sum_lat / count }
  end

  def simplify_ring(ring, max_points)
    return ring if ring.length <= max_points

    step = (ring.length.to_f / max_points).ceil
    simplified =
      ring.each_with_index.filter_map { |coord, i| coord if (i % step).zero? }

    simplified << ring.last if simplified.last != ring.last
    simplified
  end
end
