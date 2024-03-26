module HtmlSanitizeAttributes
  extend ActiveSupport::Concern

  included { before_save :sanitize_attributes }

  private

  def sanitize_attributes
    self.class.sanitizable_attributes.each do |attr_name|
      if attribute_changed?(attr_name)
        value = send(attr_name)
        send("#{attr_name}=", sanitize_html(value)) if value.present?
      end
    end
  end

  def sanitize_html(html)
    ActionController::Base.helpers.sanitize(html)
  end

  class_methods do
    def sanitizable(*attributes)
      @sanitizable_attributes = attributes
    end

    def sanitizable_attributes
      @sanitizable_attributes || []
    end
  end
end
