class HelpVideoTranscriptDocument < HelpVideoDocument
  def allowed_extensions
    %w[pdf txt]
  end

  def allowed_mime_types
    %w[application/pdf text/plain]
  end
end
