require "shrine"
require "shrine/storage/file_system"
require "shrine/storage/s3"

# TODO: CDN Cache images?
# url_options = {
#   public: true,
#   host: ENV['CDN_HOST_URL']
# }

module Constants
  module Sizes
    FILE_UPLOAD_MAX_SIZE =
      ENV["VITE_APP_FILE_UPLOAD_MAX_SIZE_MB"].presence&.to_d || 200

    FILE_UPLOAD_CHUNK_SIZE =
      ENV["VITE_APP_FILE_UPLOAD_CHUNK_SIZE_MB"].presence&.to_d || 10

    FILE_UPLOAD_ZIP_MAX_SIZE = FILE_UPLOAD_MAX_SIZE * 10
  end
end

SHRINE_USE_S3 =
  !(
    Rails.env.test? || ENV["IS_DOCKER_BUILD"].present? ||
      ENV["BCGOV_OBJECT_STORAGE_ACCESS_KEY_ID"].blank?
  )

if SHRINE_USE_S3
  s3_options = {
    bucket: ENV["BCGOV_OBJECT_STORAGE_BUCKET"],
    endpoint: ENV["BCGOV_OBJECT_STORAGE_ENDPOINT"],
    region: ENV["BCGOV_OBJECT_STORAGE_REGION"] || "no-region-needed", # We are using Object Storage which does not require this, put in a dummy variable.  For dev testing will need a region.
    access_key_id: ENV["BCGOV_OBJECT_STORAGE_ACCESS_KEY_ID"],
    secret_access_key: ENV["BCGOV_OBJECT_STORAGE_SECRET_ACCESS_KEY"],
    force_path_style: true,
    upload_options: { # Default options for all uploads to this storage
      # Restore the lambda for dynamic content_disposition
      content_disposition: ->(io, metadata) do
        # Ensure filename is reasonably sanitized just in case, although Shrine/AWS might handle it
        filename = metadata[:filename] || "download"
        # Basic sanitization: replace double quotes to prevent header issues
        sanitized_filename = filename.gsub(/["\\]/, "_") # Replace quotes and backslashes
        "attachment; filename=\"#{sanitized_filename}\""
      end
    }
  }
  Shrine.storages = {
    cache:
      Shrine::Storage::S3.new(public: false, prefix: "cache", **s3_options),
    store: Shrine::Storage::S3.new(public: false, **s3_options)
  }
else
  Shrine.storages = {
    cache: Shrine::Storage::FileSystem.new("public", prefix: "uploads/cache"), # temporary
    store: Shrine::Storage::FileSystem.new("public", prefix: "uploads/store") # permanent
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
Shrine.plugin :form_assign
Shrine.plugin :data_uri
Shrine.plugin :remote_url,
              max_size: Constants::Sizes::FILE_UPLOAD_MAX_SIZE * 1024 * 1024 # https://shrinerb.com/docs/plugins/remote_url
Shrine.plugin :upload_options,
              store: ->(io, context = {}) do
                # This lambda is called for uploads to :store (including promotion)
                if context[:action] == :store
                  metadata =
                    begin
                      context[:metadata] || io.metadata
                    rescue StandardError
                      {}
                    end
                  filename = metadata["filename"] || "download"
                  sanitized_filename = filename.gsub(/["\\]/, "_")
                  {
                    content_disposition:
                      "attachment; filename=\"#{sanitized_filename}\""
                  }
                else
                  {}
                end
              end

Shrine.plugin :presign_endpoint,
              presign_options:
                lambda { |request|
                  filename = request.params["filename"]
                  type = request.params["type"]
                  size_str = request.params["size"]

                  options = {
                    method: :put,
                    content_disposition:
                      ContentDisposition.attachment(filename),
                    content_type: type
                  }

                  # Ensure size is a positive integer before setting content_length
                  if size_str.present? && size_str.match?(/\A\d+\z/) &&
                       size_str.to_i > 0
                    options[:content_length] = size_str.to_i
                  end
                  # If size is not valid or not present, content_length will not be set.
                  # S3 might require Content-Length for PUTs unless using chunked transfer,
                  # but Uppy typically sets Content-Length header itself during the PUT.
                  # Presigning with Content-Length makes the URL more specific.

                  options
                }

# Shrine.plugin :url_options, cache: url_options, store: url_options

class Shrine::Storage::S3
  def presign_put(id, options) # options here comes from the presign_endpoint plugin's presign_options lambda
    obj = object(id)

    # Filter options to only include those valid for Aws::S3::Presigner#presigned_url for :put_object
    # The `options` hash from the lambda might include other keys like :method for the final response.
    s3_presign_options = {}
    s3_presign_options[:content_type] = options[:content_type] if options[
      :content_type
    ]
    s3_presign_options[:content_disposition] = options[
      :content_disposition
    ] if options[:content_disposition]
    s3_presign_options[:content_length] = options[:content_length] if options[
      :content_length
    ]
    s3_presign_options[:content_md5] = options[:content_md5] if options[
      :content_md5
    ] # If you plan to use it
    # Add any other S3-specific PUT options you need, e.g., :acl, :cache_control, :expires, etc.
    # s3_presign_options[:acl] = "public-read" # Example

    signed_url = obj.presigned_url(:put, s3_presign_options)

    # The `url` here is a local URL, not the S3 one. Uppy typically needs the S3 direct upload URL.
    # The response from Shrine's presign_endpoint usually provides `url` (the signed S3 URL) and `fields` (for POSTs).
    # For PUTs, just the `signed_url` is primary.
    # Our `use-uppy-s3.ts` expects `signed_url` specifically in the response from `/api/s3/params`.

    # Construct headers for the client to use when making the PUT request to S3.
    # These should generally match what was used to generate the signature.
    # However, for a PUT to a presigned URL, the client often only needs to set Content-Type
    # and Content-Length matching the file, and the presigned URL handles the auth.
    # The headers in the response are more for guiding the client if it constructs its own request from scratch
    # or for POST policies.
    response_headers = {}
    response_headers["Content-Type"] = s3_presign_options[
      :content_type
    ] if s3_presign_options[:content_type]
    # Content-Length is usually set by the client (Uppy) based on the actual file part.
    # response_headers["Content-Length"] = s3_presign_options[:content_length] if s3_presign_options[:content_length]
    response_headers["Content-Disposition"] = s3_presign_options[
      :content_disposition
    ] if s3_presign_options[:content_disposition]

    {
      method: :put, # This is for the Uppy client, indicating it should use PUT
      url: signed_url, # This should be the S3 presigned URL that Uppy will PUT to
      # fields: {}, # Fields are typically for POST policies, not PUTs
      headers: response_headers, # Headers Uppy might need to set on its PUT request to S3 (often minimal for PUTs)
      key: obj.key, # The object key in S3
      signed_url: signed_url # Redundant if url is the signed_url, but our use-uppy-s3.ts specifically looks for signed_url
    }
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
