# frozen_string_literal: true

class ShortenProjectNames < ActiveRecord::Migration[7.1]
  def up
    PermitProject.all.each do |pp|
      pa = pp.permit_applications.first
      next unless pa.present?

      pp.update(title: "Project for: #{pa.short_address}")
    end
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
