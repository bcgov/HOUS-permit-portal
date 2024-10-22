require "mini_magick"
class AssetUploader < Shrine
  # callback that runs after a file has been promoted (aka saved)
  Attacher.promote_block do
    DerivativesJob.perform_async(
      self.class.name,
      record.class.name,
      record.id,
      name,
      file_data
    )
  end

  # callback runs after file is destroyed
  Attacher.destroy_block do
    DestroyAssetJob.perform_async(self.class.name, data)
  end

  Attacher.derivatives do |original|
    magick = ImageProcessing::MiniMagick.source(original)
    sizes = {}
    if Shrine.mime_type(original).match?(%r{^image/.+})
      Asset::SIZES.each_value do |size|
        size_name = Asset::SIZES.key(size)
        sizes[size_name] = magick.resize_to_limit!(size.first, size.second)
      end
    end
    sizes
  end
end
