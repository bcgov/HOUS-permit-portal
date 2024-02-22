class Api::PermitApplicationsController < Api::ApplicationController
  include Api::Concerns::Search::JurisdictionPermitApplications
  before_action :set_permit_application, only: %i[show update submit]

  def index
    @permit_applications = policy_scope(PermitApplication)
    render_success @permit_applications, nil, { blueprint: PermitApplicationBlueprint }
  end

  def show
    authorize @permit_application
    render_success @permit_application, nil, { blueprint: PermitApplicationBlueprint }
  end

  def update
    authorize @permit_application
    # always reset the submission section keys until actual submission
    submission_section = permit_application_params["submission_data"]["data"]["section-completion-key"]
    submission_section.each { |key, value| submission_section[key] = nil }

    if @permit_application.update(extract_s3_uploads_from_params(permit_application_params))
      if !Rails.env.development? || ENV["RUN_COMPLIANCE_ON_SAVE"] == "true"
        AutomatedCompliance::AutopopulateJob.perform_later(@permit_application)
      end
      render_success @permit_application, "permit_application.update_success", { blueprint: PermitApplicationBlueprint }
    else
      render_error "permit_application.update_error",
                   message_opts: {
                     error_message: @permit_application.errors.full_messages.join(", "),
                   }
    end
  end

  def submit
    authorize @permit_application

    signed = permit_application_params["submission_data"]["data"]["section-completion-key"]["signed"]

    if signed &&
         @permit_application.update(
           extract_s3_uploads_from_params(
             permit_application_params.merge(status: :submitted, signed_off_at: Time.current),
           ),
         )
      AutomatedCompliance::AutopopulateJob.perform_later(@permit_application)
      render_success @permit_application, nil, { blueprint: PermitApplicationBlueprint }
    else
      render_error "permit_application.submit_error",
                   message_opts: {
                     error_message: @permit_application.errors.full_messages.join(", "),
                   }
    end
  end

  def create
    attributes = Integrations::LtsaParcelMapBc.new.get_feature_attributes_by_pid(pid: permit_application_params[:pid])
    jurisdiction = Jurisdiction.fuzzy_find_by_ltsa_feature_attributes(attributes)
    @permit_application =
      PermitApplication.build(permit_application_params.to_h.merge(submitter: current_user, jurisdiction: jurisdiction))
    authorize @permit_application

    if @permit_application.save
      render_success @permit_application, "permit_application.create_success", { blueprint: PermitApplicationBlueprint }
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
      .require(:permit_application)
      .permit(
        :activity_id,
        :permit_type_id,
        :full_address,
        :pin,
        :pid,
        submission_data: {
        },
        supporting_documents_attributes: [:file],
      )
      .tap do |whitelisted|
        whitelisted[:submission_data] = params[:permit_application][:submission_data].permit! if params[
          :permit_application
        ][
          :submission_data
        ]
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
