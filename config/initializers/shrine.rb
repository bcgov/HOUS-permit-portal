require "shrine"
require "shrine/storage/file_system"
require "shrine/storage/s3"

if Rails.env.production?
  coms_options = {
    bucket: ENV["COMS_BUCKET"], # S3 bucket name
    access_key_id: ENV["COMS_ACCESS_KEY_ID"],
    secret_access_key: ENV["COMS_SECRET_ACCESS_KEY"],
    region: ENV["COMS_REGION"],
  }

  Shrine.storages = {
    cache: Shrine::Storage::S3.new(prefix: "cache", **coms_options),
    store: Shrine::Storage::S3.new(**coms_options),
  }
else
  Shrine.storages = {
    cache: Shrine::Storage::FileSystem.new("public", prefix: "uploads/cache"),
    store: Shrine::Storage::FileSystem.new("public", prefix: "uploads/store"),
  }
end

Shrine.plugin :activerecord # Load ActiveRecord integration
Shrine.plugin :cached_attachment_data # Enables retaining cached file across form redisplays
Shrine.plugin :restore_cached_data # Extracts metadata for assigned cached files
