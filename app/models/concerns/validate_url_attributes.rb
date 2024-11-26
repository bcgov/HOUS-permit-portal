module ValidateUrlAttributes
  extend ActiveSupport::Concern

  included { validate :validate_url_attributes }

  private

  def validate_url_attributes
    self.class.url_validatable_attributes.each do |attr_name|
      value = send(attr_name)

      next if value.blank?

      begin
        uri = URI.parse(value)
        unless uri.is_a?(URI::HTTP) || uri.is_a?(URI::HTTPS)
          errors.add(attr_name, "must be a valid URL")
        end
      rescue URI::InvalidURIError
        errors.add(attr_name, "must be a valid URL")
      end
    end
  end

  class_methods do
    def url_validatable(*attributes)
      @url_validatable_attributes = attributes
    end

    def url_validatable_attributes
      @url_validatable_attributes || []
    end
  end
end
