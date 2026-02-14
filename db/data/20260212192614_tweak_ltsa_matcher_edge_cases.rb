# frozen_string_literal: true

class TweakLtsaMatcherEdgeCases < ActiveRecord::Migration[7.2]
  # Known name discrepancies between jurisdiction DB names and what LTSA actually
  # returns. Applied AFTER the regional district format flip (below).
  NAME_FIXES = {
    "Columbia Shuswap" => "Columbia-Shuswap", # LTSA uses hyphen
    "The Capital" => "Capital" # LTSA omits "The"
  }.freeze

  def up
    changes = 0

    # ── Fix 1: Flip regional district ltsa_matcher word order ──
    #
    # The LTSA REGIONAL_DISTRICT field returns "X Regional District"
    # (e.g. "Metro Vancouver Regional District"), but we currently store
    # "Regional District of X". Flipping makes the matcher an exact match
    # instead of relying on Searchkick tokenization to handle the word order.
    RegionalDistrict
      .where("ltsa_matcher LIKE ?", "Regional District of %")
      .find_each do |rd|
        core_name = rd.ltsa_matcher.sub(/^Regional District of\s+/, "")
        new_matcher = "#{core_name} Regional District"

        rd.update_columns(ltsa_matcher: new_matcher)
        Rails.logger.info(
          "  Flipped RD matcher: '#{rd.ltsa_matcher_before_type_cast}' → '#{new_matcher}'"
        )
        changes += 1
      end

    # ── Fix 2: Correct known name discrepancies ──
    #
    # These are cases where the jurisdiction's DB name differs from the name
    # the LTSA parcel fabric actually uses.
    NAME_FIXES.each do |old_fragment, new_fragment|
      Jurisdiction
        .where("ltsa_matcher LIKE ?", "%#{old_fragment}%")
        .find_each do |j|
          old_matcher = j.ltsa_matcher
          new_matcher = old_matcher.gsub(old_fragment, new_fragment)
          next if old_matcher == new_matcher

          j.update_columns(ltsa_matcher: new_matcher)
          Rails.logger.info(
            "  Fixed matcher: '#{old_matcher}' → '#{new_matcher}'"
          )
          changes += 1
        end
    end

    Rails.logger.info(
      "TweakLtsaMatcherEdgeCases: #{changes} ltsa_matcher values updated"
    )

    # Reindex so Searchkick picks up the changes
    if changes > 0
      Jurisdiction.reindex
      Rails.logger.info(
        "TweakLtsaMatcherEdgeCases: Searchkick reindex complete"
      )
    end
  end

  def down
    return unless Rails.env.development?

    # Re-derive all ltsa_matcher values from qualified_name / reverse_qualified_name,
    # which is the original baseline from the populate_ltsa_matchers migration.
    reset = 0

    Jurisdiction.find_each do |jurisdiction|
      matcher =
        case jurisdiction.type
        when SubDistrict.name
          jurisdiction.reverse_qualified_name
        when RegionalDistrict.name
          jurisdiction.qualified_name
        else
          nil
        end

      if matcher.present? && jurisdiction.ltsa_matcher != matcher
        jurisdiction.update_columns(ltsa_matcher: matcher)
        reset += 1
      end
    end

    Jurisdiction.reindex
    Rails.logger.info(
      "TweakLtsaMatcherEdgeCases: reset #{reset} ltsa_matcher values to original baseline"
    )
  end
end
