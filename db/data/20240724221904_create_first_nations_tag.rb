# frozen_string_literal: true

class CreateFirstNationsTag < ActiveRecord::Migration[7.1]
  def up
    ActsAsTaggableOn::Tag.find_or_create_by!(name: "first_nations")
  end

  def down
    ActsAsTaggableOn::Tag.find_by(name: "first_nations")&.destroy
  end
end
