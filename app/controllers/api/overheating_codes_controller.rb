class Api::OverheatingCodesController < Api::ApplicationController
  include Api::Concerns::Search::OverheatingCodes

  before_action :set_overheating_code, only: %i[show update]
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
      :submittal_type,
      :units,
      :dimensional_info_based_on,
      :attachment,
      :number_of_stories,
      :has_basement,
      :weather_location,
      :ventilated,
      :hrv_erv,
      :ase_percentage,
      :atre_percentage,
      :front_facing,
      :front_facing_assumed,
      :air_tightness_category,
      :air_tightness_ach50,
      :air_tightness_ela10,
      :air_tightness_assumed,
      :wind_exposure,
      :wind_sheltering,
      :internal_shading,
      :internal_shading_assumed,
      :occupants,
      :occupants_assumed,
      :calculation_units,
      :heating_outdoor_temp,
      :heating_indoor_temp,
      :mean_soil_temp,
      :soil_conductivity,
      :water_table_depth,
      :slab_fluid_temp,
      :cooling_outdoor_temp,
      :cooling_indoor_temp,
      :daily_temp_range,
      :latitude,
      :minimum_heating_capacity,
      :nominal_cooling_capacity,
      :minimum_cooling_capacity,
      :maximum_cooling_capacity,
      :ventilation_loss,
      :latent_gain,
      above_grade_walls: [],
      below_grade_walls: [],
      floors_on_soil: [],
      ceilings: [],
      exposed_floors: [],
      doors: [],
      windows: [],
      skylights: [],
      room_results: %i[room_name heating cooling]
    )
  end
end
