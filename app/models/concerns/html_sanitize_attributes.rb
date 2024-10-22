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
    # This allows target="_blank" and rel="noopener noreferrer" to be set.

    ActionController::Base.helpers.sanitize(
      html,
      tags: Rails::Html::WhiteListSanitizer.allowed_tags,
      attributes:
        Rails::Html::WhiteListSanitizer.allowed_attributes + %w[target rel]
    )
  end

  class_methods do
    def sanitizable(*attributes)
      @sanitizable_attributes = attributes
      validates_rich_text(*attributes)
    end

    def sanitizable_attributes
      @sanitizable_attributes || []
    end

    def validates_rich_text(*attributes)
      attributes.each do |attribute|
        define_method("validate_#{attribute}_rich_text") do
          return unless send(attribute).present?

          unless HtmlValidationHelper.valid_html?(send(attribute))
            errors.add(attribute.to_sym, "must be valid rich text html.")
          end
        end

        validate "validate_#{attribute}_rich_text".to_sym
      end
    end
  end
end
