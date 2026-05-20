class HelpVideoSectionBlueprint < Blueprinter::Base
  identifier :id

  fields :title, :description, :sort_order, :created_at, :updated_at

  association :help_videos, blueprint: HelpVideoBlueprint do |section, options|
    videos = section.help_videos.ordered
    options[:include_unpublished] ? videos : videos.published
  end
end
