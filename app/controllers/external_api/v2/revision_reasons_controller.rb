class ExternalApi::V2::RevisionReasonsController < ExternalApi::ApplicationController
  def index
    authorize RevisionReason, policy_class: ExternalApi::RevisionReasonPolicy

    render_success SiteConfiguration.instance.revision_reasons.kept.order(
                     :reason_code
                   ),
                   nil,
                   {
                     blueprint: RevisionReasonBlueprint,
                     blueprint_opts: {
                       view: :external_api
                     }
                   }
  end

  private

  def expected_api_version
    "v2"
  end
end
