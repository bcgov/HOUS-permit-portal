class StepCodeExportService
  def summary_csv
    CSV.generate(headers: true) do |csv|
      csv << I18n.t("export.step_code_summary_csv_headers").split(",")
      jurisdictions = Jurisdiction.all
      permit_types = PermitType.all

      jurisdictions.each do |j|
        permit_types.each do |pt|
          jurisdiction_name = j.qualified_name
          permit_type = pt.name
          permit_type_required_steps =
            j.permit_type_required_steps_by_classification(pt)
          permit_type_required_steps.each do |jtsc|
            energy_step_required = jtsc.energy_step_required
            zero_carbon_step_required = jtsc.zero_carbon_step_required
            enabled =
              energy_step_required.present? ||
                zero_carbon_step_required.present?
            csv << [
              jurisdiction_name,
              permit_type,
              enabled,
              energy_step_required,
              zero_carbon_step_required
            ]
          end
        end
      end
    end
  end

  def part_3_metrics_json(timeframe_from: nil, timeframe_to: Time.current)
    generate_metrics_json(
      model_class: Part3StepCode,
      blueprint_class: StepCode::Part3::ChecklistBlueprint,
      timeframe_from: timeframe_from,
      timeframe_to: timeframe_to,
      includes: %i[permit_application checklist]
    )
  end

  def part_9_metrics_json(timeframe_from: nil, timeframe_to: Time.current)
    generate_metrics_json(
      model_class: Part9StepCode,
      blueprint_class: StepCode::Part9::ChecklistBlueprint,
      timeframe_from: timeframe_from,
      timeframe_to: timeframe_to,
      includes: %i[permit_application checklists]
    )
  end

  private

  def generate_metrics_json(
    model_class:,
    blueprint_class:,
    timeframe_from:,
    timeframe_to:,
    includes:
  )
    # Ensure timeframe_from and timeframe_to are Time objects
    parsed_timeframe_from =
      (
        if timeframe_from.is_a?(String)
          Time.zone.parse(timeframe_from)
        else
          timeframe_from
        end
      )
    parsed_timeframe_to =
      timeframe_to.is_a?(String) ? Time.zone.parse(timeframe_to) : timeframe_to

    if parsed_timeframe_from.blank? || parsed_timeframe_from < 366.days.ago
      raise ArgumentError,
            "Timeframe from cannot be more than 365 days in the past"
    end

    # Select cached fields as well.
    # The `includes` are still important for primary_checklist and permit_applications.status
    query =
      model_class
        .includes(
          *includes
        ) # includes: %i[permit_application checklist/checklists]
        .select(
          "step_codes.*, permit_applications.status AS permit_application_status"
        ) # Ensure all necessary fields are selected
        .where(permit_applications: { status: %i[newly_submitted resubmitted] })

    query = query.where("step_codes.created_at >= ?", parsed_timeframe_from)

    # Adjust timeframe_to to include records up to the end of the specified day or extend by one day
    adjusted_timeframe_to = parsed_timeframe_to + 1.day

    query = query.where("step_codes.created_at <= ?", adjusted_timeframe_to)

    step_codes = query.to_a # Fetch all records
    type = model_class.name
    metadata = {
      type: type,
      timeframe_from: parsed_timeframe_from,
      timeframe_to: parsed_timeframe_to,
      total_records: step_codes.length,
      generated_at: Time.current.iso8601
    }

    # Add Part 9 specific metadata
    if type == Part9StepCode.name
      metadata.merge!(
        energy_steps:
          (
            ENV["PART_9_MIN_ENERGY_STEP"].to_i..ENV[
              "PART_9_MAX_ENERGY_STEP"
            ].to_i
          ).to_a.map(&:to_s),
        zero_carbon_steps:
          (
            ENV["PART_9_MIN_ZERO_CARBON_STEP"].to_i..ENV[
              "PART_9_MAX_ZERO_CARBON_STEP"
            ].to_i
          ).to_a.map(&:to_s)
      )
    end

    data_array =
      step_codes
        .map do |step_code|
          checklist = step_code.primary_checklist # Relies on includes
          next unless checklist

          json_to_use = nil
          cache_is_valid = false

          if step_code.respond_to?(:cached_metrics_json) &&
               step_code.cached_metrics_json.present? &&
               step_code.respond_to?(:metrics_cached_at) &&
               step_code.metrics_cached_at.present?
            if step_code.metrics_cached_at >= step_code.updated_at &&
                 step_code.metrics_cached_at >= checklist.updated_at
              json_to_use = step_code.cached_metrics_json
              cache_is_valid = true
              # Rails.logger.debug "Using cached metrics for #{type} ID: #{step_code.id}"
            else
              Rails.logger.warn "Cached metrics for #{type} ID: #{step_code.id} is stale. Regenerating."
            end
          else
            Rails.logger.warn "Cached metrics for #{type} ID: #{step_code.id} not found or incomplete. Regenerating."
          end

          unless cache_is_valid
            begin
              json_to_use =
                blueprint_class.render_as_hash(checklist, view: :metrics_export)
              # Optionally, update the cache here for this specific record if it was stale/missing.
              # This makes the current request faster next time, but adds a write operation.
              # To avoid N+1 writes during a large export, this is commented out by default.
              # Consider if a small number of live updates are acceptable or if it should only log.
              # if step_code.respond_to?(:update_columns) # Ensure the method exists
              #   step_code.update_columns(cached_metrics_json: json_to_use, metrics_cached_at: Time.current)
              #   Rails.logger.info "Live-regenerated and cached metrics for #{type} ID: #{step_code.id}"
              # end
            rescue StandardError => e
              Rails.logger.error "Error live-generating metrics for #{type} ID: #{step_code.id} - #{e.message}"
              next # Skip this record if live generation fails
            end
          end
          json_to_use # This will be the cached JSON or the freshly generated one
        end
        .compact

    { metadata: metadata, data: data_array }
  end
end
