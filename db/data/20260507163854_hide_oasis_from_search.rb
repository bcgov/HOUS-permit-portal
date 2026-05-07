# frozen_string_literal: true

class HideOasisFromSearch < ActiveRecord::Migration[7.2]
  SLUG = "resort-municipality-of-qa-test-village"

  def up
    update_hide_from_search(true)
  end

  def down
    update_hide_from_search(false)
  end

  private

  def update_hide_from_search(value)
    jurisdiction = Jurisdiction.find_by(slug: SLUG)

    unless jurisdiction
      warn "Jurisdiction #{SLUG.inspect} not found; skipping hide_from_search update"
      return
    end

    jurisdiction.update!(hide_from_search: value)
  end
end
