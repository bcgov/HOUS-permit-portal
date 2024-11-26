class Api::JurisdictionsController < Api::ApplicationController
  include Api::Concerns::Search::Jurisdictions
  include Api::Concerns::Search::JurisdictionUsers
  include Api::Concerns::Search::PermitApplications

  before_action :set_jurisdiction,
                only: %i[
                  show
                  update
                  search_users
                  search_permit_applications
                  update_external_api_enabled
                ]
  skip_after_action :verify_policy_scoped,
                    only: %i[index search_users search_permit_applications]
  skip_before_action :authenticate_user!,
                     only: %i[show index jurisdiction_options]

  def index
    perform_search
    authorized_results = apply_search_authorization(@search.results)
    render_success authorized_results,
                   nil,
                   {
                     meta: {
                       total_pages: @search.total_pages,
                       total_count: @search.total_count,
                       current_page: @search.current_page
                     },
                     blueprint: JurisdictionBlueprint,
                     blueprint_opts: {
                       view: :base
                     }
                   }
  end

  def update
    authorize @jurisdiction
    if jurisdiction_params[:contacts_attributes]
      # Get current contact ids from the params
      payload_record_ids =
        jurisdiction_params[:contacts_attributes].map { |c| c[:id] }
      # Mark contacts not included in the current payload for destruction
      @jurisdiction.contacts.each do |contact|
        unless payload_record_ids.include?(contact.id.to_s)
          contact.mark_for_destruction
        end
      end
    end
    if @jurisdiction.update(jurisdiction_params)
      render_success @jurisdiction,
                     "jurisdiction.update_success",
                     {
                       blueprint: JurisdictionBlueprint,
                       blueprint_opts: {
                         view: :base
                       }
                     }
    else
      render_error "jurisdiction.update_error",
                   message_opts: {
                     error_message:
                       @jurisdiction.errors.full_messages.join(", ")
                   }
    end
  end

  def update_external_api_enabled
    authorize @jurisdiction, :update_external_api_enabled?

    desired_enabled = update_external_api_enabled_params

    begin
      @jurisdiction.update_external_api_state!(
        enable_external_api: desired_enabled,
        allow_reset: current_user.super_admin?
      )

      # Determine the appropriate success message based on the new state
      message =
        case @jurisdiction.external_api_state
        when "j_on"
          "jurisdiction.external_api_enabled_success"
        when "j_off", "g_off"
          "jurisdiction.external_api_disabled_success"
        else
          "jurisdiction.update_success"
        end

      render_success @jurisdiction,
                     message,
                     {
                       blueprint: JurisdictionBlueprint,
                       blueprint_opts: {
                         view: :minimal
                       }
                     }
    rescue AASM::InvalidTransition, StandardError
      render_error "jurisdiction.update_external_api_enabled_error",
                   message_opts: {
                   }
    end
  end

  # GET /api/jurisdictions/:id
  def show
    authorize @jurisdiction
    render_success(@jurisdiction, nil, blueprint_opts: { view: :base })
  end

  # POST /api/jurisdiction
  def create
    class_to_use =
      Jurisdiction.class_for_locality_type(jurisdiction_params[:locality_type])

    @jurisdiction = class_to_use.build(jurisdiction_params)

    authorize @jurisdiction

    if @jurisdiction.save
      render_success @jurisdiction,
                     "jurisdiction.create_success",
                     {
                       blueprint: JurisdictionBlueprint,
                       blueprint_opts: {
                         view: :base
                       }
                     }
    else
      render_error "jurisdiction.create_error",
                   message_opts: {
                     error_message:
                       @jurisdiction.errors.full_messages.join(", ")
                   }
    end
  end

  def locality_type_options
    authorize :jurisdiction, :locality_type_options?
    options =
      Jurisdiction.locality_types.sort.map do |lt|
        { label: Jurisdiction.custom_titleize_locality_type(lt), value: lt }
      end
    render_success options, nil, { blueprint: OptionBlueprint }
  end

  # POST /api/jurisdictions/:id/users/search
  def search_users
    authorize @jurisdiction
    perform_user_search
    authorized_results =
      apply_search_authorization(
        @user_search.results,
        "search_jurisdiction_users"
      )
    render_success authorized_results,
                   nil,
                   {
                     meta: {
                       total_pages: @user_search.total_pages,
                       total_count: @user_search.total_count,
                       current_page: @user_search.current_page
                     },
                     blueprint: UserBlueprint,
                     blueprint_opts: {
                       view: :base
                     }
                   }
  end

  # POST /api/jurisdictions/:id/permit_applications/search
  def search_permit_applications
    authorize @jurisdiction
    perform_permit_application_search
    authorized_results =
      apply_search_authorization(@permit_application_search.results, "index")
    render_success authorized_results,
                   nil,
                   {
                     meta: {
                       total_pages: @permit_application_search.total_pages,
                       total_count: @permit_application_search.total_count,
                       current_page: @permit_application_search.current_page
                     },
                     blueprint: PermitApplicationBlueprint,
                     blueprint_opts: {
                       view: :jurisdiction_review_inbox
                     }
                   }
  end

  def jurisdiction_options
    authorize :jurisdiction, :jurisdiction_options?

    # TODO: refactor jurisdictions search to accomodate filters,
    # then use that here instead of having the search logic in the controller
    name = jurisdiction_params["name"]
    type = jurisdiction_params["type"]
    user_id = jurisdiction_params["user_id"]

    filters = {}
    filters = { type: type } if type.present?
    filters = filters.merge({ user_ids: [user_id] }) if user_id.present?
    filters = { where: filters, match: :word_start }

    search = Jurisdiction.search(name || "*", **filters)
    options = search.results.map { |j| { label: j.qualified_name, value: j } }
    render_success options, nil, { blueprint: JurisdictionOptionBlueprint }
  end

  private

  def jurisdiction_params
    params.require(:jurisdiction).permit(
      :name,
      :type,
      :user_id,
      :locality_type,
      :address,
      :regional_district_id,
      :description_html,
      :checklist_html,
      :look_out_html,
      :contact_summary_html,
      :map_zoom,
      map_position: [],
      users_attributes: %i[first_name last_name role email],
      contacts_attributes: %i[
        id
        first_name
        last_name
        department
        title
        phone
        cell
        email
      ],
      permit_type_submission_contacts_attributes: %i[
        id
        email
        permit_type_id
        _destroy
      ],
      permit_type_required_steps_attributes: %i[
        id
        permit_type_id
        default
        energy_step_required
        zero_carbon_step_required
        _destroy
      ]
    )
  end

  def update_external_api_enabled_params
    params.require(:external_api_enabled)
  end

  def set_jurisdiction
    @jurisdiction =
      Jurisdiction
        .includes(Jurisdiction::BASE_INCLUDES)
        .friendly
        .find(params[:id])
  rescue ActiveRecord::RecordNotFound => e
    render_error("misc.not_found_error", { status: :not_found }, e)
  end
end
