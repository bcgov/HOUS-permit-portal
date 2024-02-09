class Api::PermitApplicationsController < Api::ApplicationController
  include Api::Concerns::Search::JurisdictionPermitApplications
  before_action :set_permit_application, only: %i[show update]

  def show
    authorize @permit_application
    render_success @permit_application, nil, { blueprint: PermitApplicationBlueprint }
  end

  def update
    authorize @permit_application

    if @permit_application.save
      render_success @permit_application, nil, { blueprint: PermitApplicationBlueprint }
    else
      render_error "permit_application.create_error",
                   message_opts: {
                     error_message: @permit_application.errors.full_messages.join(", "),
                   }
    end
  end

  def create
    authorize @permit_application
    if @permit_application.update(extract_s3_uploads_from_params(permit_application_params))
      render_success @permit_application, nil, { blueprint: PermitApplicationBlueprint }
    else
      render_error "permit_application.create_error",
                   message_opts: {
                     error_message: @permit_application.errors.full_messages.join(", "),
                   }
    end
  end

  private

  def set_permit_application
    @permit_application = PermitApplication.find(params[:id])
  end

  def permit_application_params #params for submitters
    params
      .permit(:activity, :permit_type, :full_address, :pin, :pid, supporting_documents_attributes: [:file])
      .tap do |whitelisted|
        whitelisted[:submission_data] = params[:submission_data].permit! if params[:submission_data]
        #inject file attachments to the supporting documents relationship for permit applications here
      end
  end

  def find_nested_files(data_raw, files = [])
    data = data_raw
    if data_raw.is_a?(Hash) && data_raw.keys.include?("data")
      #form io nesting always has a data element
      data = data_raw["data"]
    end
    # Rails.logger.debug "**** data #{data.inspect}"
    if data.is_a?(Hash)
      keys_set = data.keys.to_set
      keys_to_check = %w[storage filename]
      all_included = keys_to_check.all? { |key| keys_set.include?(key) }
      all_included ? files << data : data.each { |_, value| find_nested_files(value, files) }
    elsif data.is_a?(Array)
      data.each { |value| find_nested_files(value, files) }
    end
    files
  end

  def extract_s3_uploads_from_params(params_permitted)
    files = find_nested_files(params_permitted[:submission_data].to_h)
    if files.present?
      mapped_attributes = files.map { |file| { "file" => file.slice(*%w[id storage filename metadata]) } }
      params_permitted.merge(supporting_documents_attributes: mapped_attributes)
    else
      params_permitted
    end
    #look for all fields that match a newly uploaded supporting document
    # {"feature"=>{"assets_attributes"=>[{"asset"=>"{\"id\":\"64fc042cb5c94b540a928cff123674e7.jpeg\",\"previewUrl\":\"blob:http://laterolabs.lvh.me:3000/a161a933-89ce-41a7-ba33-0d6fb8e4cdf6\",\"storage\":\"cache\",\"metadata\":{\"size\":69276,\"filename\":\"disastergirl.jpeg\",\"mime_type\":\"image/jpeg\",\"content_disposition\":\"attachment\"}}"}]}, "id"=>"ce7e54fd-b60c-42df-8eba-39ac7d28aa26"}
  end
end
