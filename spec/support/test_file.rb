module TestData
  module_function
  #https://shrinerb.com/docs/testing
  def file_data
    attacher = Shrine::Attacher.new
    attacher.set(uploaded_file)

    attacher.data # or attacher.data in case of postgres jsonb column
  end

  def uploaded_file
    file = File.open("spec/support/signed_converted.pdf", binmode: true)

    # for performance we skip metadata extraction and assign test metadata
    uf = Shrine.upload(file, :store, metadata: false)
    uf.metadata.merge!(
      "size" => File.size(file.path),
      "mime_type" => "application/pdf",
      "filename" => "test.jpg"
    )

    uf
  end

  def cached_file_data(filename: "site-plan.pdf")
    file = File.open("spec/support/signed_converted.pdf", binmode: true)
    uploaded_file = Shrine.upload(file, :cache, metadata: false)
    uploaded_file.metadata.merge!(
      "size" => File.size(file.path),
      "mime_type" => "application/pdf",
      "filename" => filename
    )
    uploaded_file.data
  ensure
    file&.close
  end
end
