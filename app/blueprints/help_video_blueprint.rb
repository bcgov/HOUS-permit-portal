class HelpVideoBlueprint < Blueprinter::Base
  identifier :id

  fields :title,
         :description,
         :sort_order,
         :published_at,
         :created_at,
         :updated_at

  field :help_video_section_id

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
      video.transcript_document&.file_url
    end

    association :video_document, blueprint: HelpVideoDocumentBlueprint
    association :caption_document, blueprint: HelpVideoDocumentBlueprint
    association :transcript_document, blueprint: HelpVideoDocumentBlueprint
  end
end
