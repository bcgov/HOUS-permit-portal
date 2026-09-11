class ExternalApi::V2::PermitApplicationsController < ExternalApi::PermitApplicationsController
  private

  def expected_api_version
    "v2"
  end
end
