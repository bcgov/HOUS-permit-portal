class LinkItemBlueprint < Blueprinter::Base
  # Correctly accessing the hash element, as link items are always nested jsonb hashes

  field :href do |link_item, _options|
    link_item["href"]
  end

  field :title do |link_item, _options|
    link_item["title"]
  end

  field :description do |link_item, _options|
    link_item["description"]
  end

  field :show do |link_item, _options|
    link_item["show"]
  end
end
