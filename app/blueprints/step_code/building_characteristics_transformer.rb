class StepCode::BuildingCharacteristicsTransformer < Blueprinter::Transformer
  def transform(hash, object, options)
    hash
      .merge!(
        %i[
          roof_ceilings_lines
          above_grade_walls_lines
          framings_lines
          unheated_floors_lines
          below_grade_walls_lines
          slabs_lines
          doors_lines
          space_heating_cooling_lines
          hot_water_lines
          ventilation_lines
          other_lines
        ].inject({}) do |h, key|
          h[key] = lines_attrs(object.send(key))
          h
        end
      )
      .merge!(
        {
          windows_glazed_doors: {
            performance_type: object.windows_glazed_doors.performance_type,
            lines: object.windows_glazed_doors.lines.map(&:attributes)
          }
        }
      )
      .merge!({ fossil_fuels: object.fossil_fuels.attributes })
      .merge!({ airtightness: object.airtightness.attributes })
  end

  def lines_attrs(lines)
    lines.map do |line|
      line
        .fields
        .inject({}) do |h, field|
          h[field] = line.send(field)
          h
        end
    end
  end
end
