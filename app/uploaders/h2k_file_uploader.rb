# Uploader for HOT2000 (.h2k) files used in Step Code data entries.
# Inherits async promotion (with virus scanning) and storage path logic from FileUploader.
class H2kFileUploader < FileUploader
  Attacher.validate { validate_extension_inclusion %w[h2k] }
end
