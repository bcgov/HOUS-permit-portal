require "shrine"
require "shrine/storage/file_system"
require "shrine/storage/s3"

# TODO: CDN Cache images?
# url_options = {
#   public: true,
#   host: ENV['CDN_HOST_URL']
# }

if Rails.env.test? || ENV["SKIP_DEPENDENCY_INITIALIZERS"].present? || ENV["BCGOV_OBJECT_STORAGE_ACCESS_KEY_ID"].blank?
  Shrine.storages = {
    cache: Shrine::Storage::FileSystem.new("public", prefix: "uploads/cache"), # temporary
    store: Shrine::Storage::FileSystem.new("public", prefix: "uploads/store"), # permanent
  }
else
  s3_options = {
    bucket: ENV["BCGOV_OBJECT_STORAGE_BUCKET"],
    endpoint: ENV["BCGOV_OBJECT_STORAGE_ENDPOINT"],
    region: ENV["BCGOV_OBJECT_STORAGE_REGION"] || "no-region-needed", # We are using Object Storage which does not require this, put in a dummy variable.  For dev testing will need a region.
    access_key_id: ENV["BCGOV_OBJECT_STORAGE_ACCESS_KEY_ID"],
    secret_access_key: ENV["BCGOV_OBJECT_STORAGE_SECRET_ACCESS_KEY"],
    force_path_style: true,
  }
  Shrine.storages = {
    cache: Shrine::Storage::S3.new(public: false, prefix: "cache", **s3_options),
    store: Shrine::Storage::S3.new(public: false, **s3_options),
  }
end

Shrine.plugin :activerecord
Shrine.plugin :cached_attachment_data
Shrine.plugin :restore_cached_data
Shrine.plugin :rack_file
Shrine.plugin :backgrounding
Shrine.plugin :derivatives
Shrine.plugin :determine_mime_type
Shrine.plugin :add_metadata
# Shrine.plugin :url_options, cache: url_options, store: url_options
Shrine.plugin :form_assign
Shrine.plugin :data_uri
Shrine.plugin :remote_url, max_size: (ENV["VITE_FILE_UPLOAD_MAX_SIZE"].to_d || 100) * 1024 * 1024 # https://shrinerb.com/docs/plugins/remote_url

Shrine.plugin :presign_endpoint,
              presign_options:
                lambda { |request|
                  filename = request.params["filename"]
                  type = request.params["type"]

                  {
                    method: :put,
                    content_disposition: ContentDisposition.attachment(filename),
                    content_type: type,
                    # content_md5: request.params["checksum"],
                    # transfer_encoding: "chunked",
                  }
                }

class Shrine::Storage::S3
  def presign_put(id, options)
    obj = object(id)

    signed_urls = [obj.presigned_url(:put, options)]
    url = Shrine.storages[:cache].url(id, public: false, expires_in: 3600)
    # When any of these options are specified, the corresponding request
    # headers must be included in the upload request.
    headers = {}
    headers["Content-Length"] = options[:content_length] if options[:content_length]
    headers["Content-Type"] = options[:content_type] if options[:content_type]
    headers["Content-Disposition"] = options[:content_disposition] if options[:content_disposition]
    headers["Content-Encoding"] = options[:content_encoding] if options[:content_encoding]
    headers["Content-Language"] = options[:content_language] if options[:content_language]
    headers["Content-MD5"] = options[:content_md5] if options[:content_md5]

    { method: :put, url: url, signedUrls: signed_urls, headers: headers, key: obj.key }
  end

  # ECS S3 copy function does not take as many params, it works when its plain.  You can test in the code below to verify.
  # s3_client= Shrine.storages[:cache].client
  # s3_client.copy_object({
  #   copy_source: "#{ENV["BCGOV_OBJECT_STORAGE_BUCKET"]}/4ff7582a03d0aa90e13d179f1268381c.pdf",
  #   bucket: ENV["BCGOV_OBJECT_STORAGE_BUCKET"],
  #   key: "test.pdf"
  # })
  #itnercepted
  # {:copy_source=>"housing-bssb-ex-permithub-dev-bkt/4ff7582a03d0aa90e13d179f1268381c.pdf",
  #  :bucket=>"housing-bssb-ex-permithub-dev-bkt",
  #  :key=>"test.pdf"}

  def copy(io, id, **copy_options)
    # don't inherit source object metadata or AWS tags
    options = {
      # metadata_directive: "REPLACE",  #OVERRIDE COPY DO NOT ALLOW THESE DIRECTIVE OPTIONS
      # tagging_directive: "REPLACE"  #OVERRIDE COPY DO NOT ALLOW THESE DIRECTIVE OPTIONS
    }

    if io.size && io.size >= @multipart_threshold[:copy]
      # pass :content_length on multipart copy to avoid an additional HEAD request
      options.merge!(multipart_copy: true, content_length: io.size)
    end

    options.merge!(copy_options)
    object(id).copy_from(io.storage.object(io.id), **options)
  end
end
