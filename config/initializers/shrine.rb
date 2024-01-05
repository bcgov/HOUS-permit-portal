# require "shrine"
# require "shrine/storage/file_system"
# require "shrine/storage/s3"

# # TODO: CDN Cache images?
# # url_options = {
# #   public: true,
# #   host: ENV['CDN_HOST_URL']
# # }

# if Rails.env.test?
#   Shrine.storages = {
#     cache: Shrine::Storage::FileSystem.new("public", prefix: "uploads/cache"), # temporary
#     store: Shrine::Storage::FileSystem.new("public", prefix: "uploads/store"), # permanent
#   }
# else
#   s3_options = {
#     bucket: ENV["COMS_BUCKET"],
#     region: ENV["COMS_REGION"],
#     access_key_id: ENV["COMS_ACCESS_KEY_ID"],
#     secret_access_key: ENV["COMS_SECRET_ACCESS_KEY"],
#   }
#   Shrine.storages = {
#     cache: Shrine::Storage::S3.new(public: false, prefix: "cache", **s3_options),
#     store: Shrine::Storage::S3.new(public: false, **s3_options),
#   }
# end

# Shrine.plugin :activerecord
# Shrine.plugin :cached_attachment_data
# Shrine.plugin :restore_cached_data
# Shrine.plugin :rack_file
# Shrine.plugin :backgrounding
# Shrine.plugin :derivatives
# Shrine.plugin :determine_mime_type
# Shrine.plugin :add_metadata
# # Shrine.plugin :url_options, cache: url_options, store: url_options
# Shrine.plugin :form_assign
# Shrine.plugin :data_uri
# Shrine.plugin :remote_url, max_size: 20 * 1024 * 1024 # https://shrinerb.com/docs/plugins/remote_url

# Shrine.plugin :presign_endpoint,
#               presign_options:
#                 lambda { |request|
#                   filename = request.params["filename"]
#                   type = request.params["type"]

#                   {
#                     content_disposition: ContentDisposition.attachment(filename), # set download filename
#                     content_type: type, # set content type (required if using DigitalOcean Spaces)
#                     content_length_range: 0..(10 * 1024 * 1024), # limit upload size to 10 MB
#                   }
#                 }
