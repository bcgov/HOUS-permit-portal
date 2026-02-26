class Api::OverheatingCodesController < Api::ApplicationController
  include Api::Concerns::Search::OverheatingCodes

  before_action :set_overheating_code,
                only: %i[show update destroy restore generate_pdf]
  skip_after_action :verify_policy_scoped, only: %i[index]

  def index
    perform_overheating_code_search
    render_success @overheating_code_search.results,
                   nil,
                   {
                     meta: page_meta(@overheating_code_search),
                     blueprint: OverheatingCodeBlueprint
                   }
  end

  def show
    authorize @overheating_code
    render_success @overheating_code,
                   nil,
                   { blueprint: OverheatingCodeBlueprint }
  end

  def create
    overheating_code =
      OverheatingCode.new(overheating_code_params.merge(creator: current_user))

    authorize overheating_code
    if overheating_code.save
      render_success overheating_code,
                     "overheating_code.create_success",
                     { blueprint: OverheatingCodeBlueprint }
    else
      render_error "overheating_code.create_error",
                   message_opts: {
                     error_message:
                       overheating_code.errors.full_messages.to_sentence
                   }
    end
  end

  def update
    authorize @overheating_code
    if @overheating_code.update(overheating_code_params)
      render_success @overheating_code,
                     "overheating_code.update_success",
                     { blueprint: OverheatingCodeBlueprint }
    else
      render_error "overheating_code.update_error",
                   message_opts: {
                     error_message:
                       @overheating_code.errors.full_messages.to_sentence
                   }
    end
  end

  def destroy
    authorize @overheating_code
    if @overheating_code.discard
      render_success(
        @overheating_code,
        "overheating_code.destroy_success",
        { blueprint: OverheatingCodeBlueprint }
      )
    else
      render_error "overheating_code.destroy_error",
                   message_opts: {
                     error_message:
                       @overheating_code.errors.full_messages.to_sentence
                   }
    end
  end

  def restore
    authorize @overheating_code
    if @overheating_code.update(discarded_at: nil)
      render_success(
        @overheating_code,
        "overheating_code.restore_success",
        { blueprint: OverheatingCodeBlueprint }
      )
    else
      render_error "overheating_code.restore_error",
                   message_opts: {
                     error_message:
                       @overheating_code.errors.full_messages.to_sentence
                   }
    end
  end

  def generate_pdf
    authorize @overheating_code, :show?

    service = OverheatingCodePdfService.new(@overheating_code)
    pdf_data = service.generate

    send_data pdf_data,
              filename: service.filename,
              type: "application/pdf",
              disposition: "attachment"
  end

  private

  def set_overheating_code
    @overheating_code = OverheatingCode.find(params[:id])
  end

  def overheating_code_params
    params.fetch(:overheating_code, {}).permit(
      :issued_to,
      :project_number,
      :full_address,
      :pid,
      :jurisdiction_id,
      :building_model,
      :site_name,
      :lot,
      :postal_code,
      :designated_rooms,
      :cooling_zone_units,
      :minimum_cooling_capacity,
      :design_outdoor_temp,
      :design_indoor_temp,
      :design_adjacent_temp,
      :cooling_zone_area,
      :weather_location,
      :ventilation_rate,
      :hrv_erv,
      :atre_percentage,
      :performer_name,
      :performer_company,
      :performer_address,
      :performer_city_province,
      :performer_postal_code,
      :performer_phone,
      :performer_fax,
      :performer_email,
      :accreditation_ref1,
      :accreditation_ref2,
      :issued_for1,
      :issued_for2,
      components_facing_outside: [],
      components_facing_adjacent: [],
      document_notes: []
    )
  end
end
