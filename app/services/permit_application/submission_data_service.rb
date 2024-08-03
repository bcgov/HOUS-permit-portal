class PermitApplication::SubmissionDataService
  attr_reader :permit_application

  def initialize(permit_application)
    @permit_application = permit_application
  end

  def formatted_submission_data(current_user:)
    submission_data = permit_application.submission_data

    filtered_submission =
      filter_submission_data_based_on_user_permissions(submission_data: submission_data, user: current_user)

    completion_section_value = submission_data.dig("data", PermitApplication::COMPLETION_SECTION_KEY)

    # If the completion section is present, we want to include it in the submission data
    # as collaborators are able to view this. They aren't able to update it. So that's
    # why it is removed in the filtered submission_data
    if completion_section_value.present?
      filtered_submission["data"][PermitApplication::COMPLETION_SECTION_KEY] = submission_data.dig(
        "data",
        PermitApplication::COMPLETION_SECTION_KEY,
      )
    end

    filtered_submission
  end

  def update_with_submission_data_merge(permit_application_params:, current_user: nil)
    return permit_application.update(permit_application_params) if current_user.blank?

    permit_application.with_lock do
      permissions_filtered_submission_data =
        filter_submission_data_based_on_user_permissions(
          submission_data: permit_application_params[:submission_data],
          user: current_user,
        )

      merged_submission_data = permit_application.submission_data.deep_dup

      merged_submission_data["data"] ||= {}

      permissions_filtered_submission_data["data"]&.each do |section_key, section_values|
        merged_submission_data["data"][section_key] ||= {}

        section_values.each { |key, value| merged_submission_data["data"][section_key][key] = value }
      end

      permit_application_params[:submission_data] = merged_submission_data

      permit_application.update(permit_application_params)
    end
  end

  private

  def filter_submission_data_based_on_user_permissions(submission_data:, user:)
    return submission_data unless user.present?

    formatted_data = submission_data.deep_dup

    permissions = permit_application.submission_requirement_block_edit_permissions(user_id: user.id)

    if permissions == :all ||
         (
           permit_application.submitted? && user.review_staff? &&
             user.jurisdictions.find_by(id: permit_application.jurisdiction_id).present?
         )
      return formatted_data
    end

    return {} if permissions.blank?

    formatted_data["data"].each do |_section_key, section_values|
      section_values.delete_if do |key, _value|
        requirement_block_id = key[/\|RB([^|]+)/, 1]
        !permissions.include?(requirement_block_id)
      end
    end

    formatted_data
  end
end