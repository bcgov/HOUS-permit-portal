class Asset < ApplicationRecord
  include AssetUploader.Attachment(:asset) # adds an `asset` virtual attribute
  belongs_to :attachable, polymorphic: true, touch: true

  SIZES = { "@thumb": [200, 150], "@2x": [300, 300], "@3x": [600, 600] }.freeze
end
