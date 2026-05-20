# frozen_string_literal: true

class PostClassificationRemovalCleanup < ActiveRecord::Migration[7.2]
  def up
    # Backfill blank nicknames from tags
    RequirementTemplate
      .where(nickname: [nil, ""])
      .find_each do |rt|
        derived = rt.tag_list.join(" | ").presence || "New template"
        rt.update_column(:nickname, derived)
      end

    # Update denormalized template JSON blobs to replace permitType/activity with tags
    TemplateVersion.find_each do |tv|
      next if tv.denormalized_template_json.blank?

      json = tv.denormalized_template_json.dup
      rt = tv.requirement_template

      if rt
        json.delete("permitType")
        json.delete("permit_type")
        json.delete("activity")
        json.delete("firstNations")
        json.delete("first_nations")
        json.delete("label")
        json["tags"] = rt.tag_list
        json["nickname"] = rt.nickname
        tv.update_column(:denormalized_template_json, json)
      end
    end

    # Reindex search indices
    RequirementTemplate.reindex
    PermitApplication.reindex
    PreCheck.reindex if PreCheck.respond_to?(:reindex)
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
