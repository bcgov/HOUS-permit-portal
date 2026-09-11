class ExternalApi::V1::PermitApplicationsController < ExternalApi::PermitApplicationsController
  private

  def expected_api_version
    "v1"
  end
end
