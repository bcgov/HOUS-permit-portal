require "nokogiri"

module HtmlValidationHelper
  def self.valid_html?(html_string)
    # binding.pry
    doc = Nokogiri.HTML(html_string) { |config| config.strict }
    return !doc.errors.any?
  rescue StandardError => e
    return false
  end
end
