module FrontendUrlHelper
  def self.root_url
    Rails.application.routes.url_helpers.root_url
  end

  def self.frontend_url(path)
    Addressable::URI.join(
      Rails.application.routes.url_helpers.root_url,
      path
    ).to_s
  end
end
