class HelpVideoBlueprint < Blueprinter::Base
  identifier :id

  fields :title,
         :slug,
         :description,
         :about_html,
         :sort_order,
         :published_at,
         :created_at,
         :updated_at

  field :help_video_section_id

  field :previous_help_video do |video, options|
    if options[:include_navigation_neighbors]
      pair =
        (
          options[:help_video_adjacent_pair] ||= video.adjacent_help_videos_for(
            options[:current_user]
          )
        )
      HelpVideoBlueprint.neighbor_preview(pair.first)
    end
  end

  field :next_help_video do |video, options|
    if options[:include_navigation_neighbors]
      pair =
        (
          options[:help_video_adjacent_pair] ||= video.adjacent_help_videos_for(
            options[:current_user]
          )
        )
      HelpVideoBlueprint.neighbor_preview(pair.last)
    end
  end

  def self.neighbor_preview(video)
    return nil if video.blank?

    { id: video.id, title: video.title, slug: video.slug }
  end

  view :detail do
    field :video_url do |video, _options|
      video.video_document&.file_url(
        disposition: "inline",
        response_content_type: "video/mp4"
      )
    end

    field :caption_url do |video, _options|
      video.caption_document&.file_url(
        disposition: "inline",
        response_content_type: "text/vtt"
      )
    end

    field :transcript_url do |video, _options|
      video.transcript_document&.file_url(disposition: "attachment")
    end

    association :video_document, blueprint: HelpVideoDocumentBlueprint
    association :caption_document, blueprint: HelpVideoDocumentBlueprint
    association :transcript_document, blueprint: HelpVideoDocumentBlueprint
  end
end
