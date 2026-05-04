# frozen_string_literal: true

module ReviewerInboxLoadDataTask
  PROJECT_TITLE_PREFIX = "Reviewer inbox load project"
  APPLICATION_NICKNAME_PREFIX = "Reviewer inbox load application"
  DEFAULT_COUNT = 300

  module_function

  def run(projects_per_state:, applications_per_status:)
    abort "reviewer_inbox:load_data only runs in development." unless Rails.env.development?

    context = build_context

    ensure_inbox_enabled(context[:jurisdiction])
    projects = ensure_projects(context, projects_per_state)
    ensure_applications(context, projects, applications_per_status)
    reindex_load_data(context[:jurisdiction])
    print_summary(context[:jurisdiction])
  end

  def build_context
    jurisdiction =
      Jurisdiction.find_by(
        slug: "corporation-of-the-city-of-north-vancouver"
      ) || Jurisdiction.find_by(name: "North Vancouver")
    unless jurisdiction
      abort "North Vancouver jurisdiction is missing. Run `bin/rails db:seed` first."
    end

    submitter = User.find_by(omniauth_username: "submitter")
    unless submitter
      abort "Submitter user is missing. Run `bin/rails db:seed` first."
    end

    reviewer = User.find_by(omniauth_username: "reviewer")
    unless reviewer
      abort "Reviewer user is missing. Run `bin/rails db:seed` first."
    end

    templates = TemplateVersion.published_for_live_requirement_templates.to_a
    if templates.empty?
      abort "No published live template versions found. Run `bin/rails db:seed` first."
    end

    {
      jurisdiction: jurisdiction,
      submitter: submitter,
      reviewer: reviewer,
      templates: templates,
      reason_codes: RevisionReason.pluck(:reason_code)
    }
  end

  def ensure_inbox_enabled(jurisdiction)
    SiteConfiguration.instance.update!(
      inbox_enabled: true,
      allow_designated_reviewer: true
    )
    jurisdiction.update!(inbox_enabled: true, allow_designated_reviewer: true)
  end

  def ensure_projects(context, projects_per_state)
    states = PermitProject.kanban_states
    all_projects = load_projects(context[:jurisdiction]).to_a

    states.each do |state|
      existing_count = all_projects.count { |project| project.state == state }
      needed_count = projects_per_state - existing_count
      next if needed_count <= 0

      puts "Creating #{needed_count} #{state} reviewer inbox load project(s)..."

      needed_count.times do |offset|
        index = existing_count + offset + 1
        project = create_project(context, state, index)
        create_application(
          context,
          project,
          PermitApplication.kanban_statuses[
            (all_projects.size + offset) %
              PermitApplication.kanban_statuses.size
          ],
          index
        )
        all_projects << project
      end
    end

    load_projects(context[:jurisdiction]).to_a
  end

  def ensure_applications(context, projects, applications_per_status)
    abort "No reviewer inbox load projects found." if projects.empty?

    PermitApplication.kanban_statuses.each do |status|
      existing_count =
        load_applications(context[:jurisdiction]).where(status: status).count
      needed_count = applications_per_status - existing_count
      next if needed_count <= 0

      puts "Creating #{needed_count} #{status} reviewer inbox load application(s)..."

      needed_count.times do |offset|
        project = projects[(existing_count + offset) % projects.size]
        create_application(
          context,
          project,
          status,
          existing_count + offset + 1
        )
      end
    end
  end

  def create_project(context, state, index)
    project =
      PermitProject.create!(
        owner: context[:submitter],
        jurisdiction: context[:jurisdiction],
        title: "#{PROJECT_TITLE_PREFIX} #{state} #{index}",
        full_address: "#{1000 + index} Lonsdale Ave, North Vancouver, BC",
        pid: format("98%07d", index),
        pin: format("RIL%06d", index)
      )

    enqueued_at = rand(1..180).days.ago
    project.update_columns(
      state: PermitProject.states.fetch(state),
      enqueued_at: enqueued_at,
      viewed_at: nil,
      queue_time_seconds:
        queue_time_seconds(enqueued_at, state, PermitProject.our_court_states),
      queue_clock_started_at:
        queue_clock_started_at(
          enqueued_at,
          state,
          PermitProject.our_court_states
        )
    )
    project
  end

  def create_application(context, project, status, index)
    template = context[:templates][index % context[:templates].size]
    application =
      PermitApplication.create!(
        nickname: "#{APPLICATION_NICKNAME_PREFIX} #{status} #{index}",
        submitter: context[:submitter],
        permit_project: project,
        activity_id: template.activity.id,
        permit_type_id: template.permit_type.id,
        template_version: template
      )

    shape_application_status(context, application, status)
    application
  end

  def shape_application_status(context, application, status)
    return if status.to_s == "new_draft"

    submitted_at = rand(1..180).days.ago
    first_version = create_submission_version(application, submitted_at)

    case status.to_s
    when "revisions_requested"
      create_revision_request(context, first_version)
      application.update_columns(
        status: PermitApplication.statuses.fetch(status.to_s),
        revisions_requested_at: [
          submitted_at + rand(1..10).days,
          Time.current
        ].min,
        queue_time_seconds:
          queue_time_seconds(
            submitted_at,
            status,
            PermitApplication.our_court_statuses
          ),
        queue_clock_started_at:
          queue_clock_started_at(
            submitted_at,
            status,
            PermitApplication.our_court_statuses
          )
      )
    when "resubmitted"
      create_revision_request(context, first_version)
      resubmitted_at = [submitted_at + rand(3..30).days, Time.current].min
      create_submission_version(application, resubmitted_at)
      application.update_columns(
        status: PermitApplication.statuses.fetch(status.to_s),
        queue_time_seconds:
          queue_time_seconds(
            resubmitted_at,
            status,
            PermitApplication.our_court_statuses
          ),
        queue_clock_started_at:
          queue_clock_started_at(
            resubmitted_at,
            status,
            PermitApplication.our_court_statuses
          )
      )
    else
      application.update_columns(
        status: PermitApplication.statuses.fetch(status.to_s),
        queue_time_seconds:
          queue_time_seconds(
            submitted_at,
            status,
            PermitApplication.our_court_statuses
          ),
        queue_clock_started_at:
          queue_clock_started_at(
            submitted_at,
            status,
            PermitApplication.our_court_statuses
          )
      )
    end
  end

  def create_submission_version(application, created_at)
    application.submission_versions.create!(
      form_json: application.template_version&.form_json || {},
      submission_data: {
      },
      created_at: created_at,
      updated_at: created_at
    )
  end

  def create_revision_request(context, submission_version)
    submission_version.revision_requests.create!(
      reason_code: context[:reason_codes].sample || "other",
      comment: "Load test revision request.",
      user: context[:reviewer]
    )
  end

  def load_projects(jurisdiction)
    PermitProject.where(jurisdiction: jurisdiction).where(
      "title LIKE ?",
      "#{PROJECT_TITLE_PREFIX}%"
    )
  end

  def load_applications(jurisdiction)
    PermitApplication
      .joins(:permit_project)
      .where(permit_projects: { jurisdiction_id: jurisdiction.id })
      .where("permit_projects.title LIKE ?", "#{PROJECT_TITLE_PREFIX}%")
  end

  def queue_time_seconds(started_at, state_or_status, our_court_values)
    elapsed_seconds = [(Time.current - started_at).to_i, 0].max
    if our_court_values.include?(state_or_status.to_s)
      rand(0..[elapsed_seconds / 3, 1].max)
    else
      rand(([elapsed_seconds / 3, 1].max)..[elapsed_seconds, 1].max)
    end
  end

  def queue_clock_started_at(started_at, state_or_status, our_court_values)
    return nil unless our_court_values.include?(state_or_status.to_s)

    [started_at + rand(0..30).days, Time.current].min
  end

  def reindex_load_data(jurisdiction)
    puts "Reindexing reviewer inbox load records..."
    load_applications(jurisdiction).reindex
    load_projects(jurisdiction).reindex
  end

  def print_summary(jurisdiction)
    puts "--- Reviewer inbox load data summary ---"
    PermitProject.kanban_states.each do |state|
      count = load_projects(jurisdiction).where(state: state).count
      puts "Projects #{state}: #{count}"
    end
    PermitApplication.kanban_statuses.each do |status|
      count = load_applications(jurisdiction).where(status: status).count
      puts "Applications #{status}: #{count}"
    end
  end
end

namespace :reviewer_inbox do
  desc "Top up reviewer inbox load data. Env: PROJECTS_PER_STATE=300 APPLICATIONS_PER_STATUS=300"
  task load_data: :environment do
    ReviewerInboxLoadDataTask.run(
      projects_per_state:
        ENV.fetch(
          "PROJECTS_PER_STATE",
          ReviewerInboxLoadDataTask::DEFAULT_COUNT
        ).to_i,
      applications_per_status:
        ENV.fetch(
          "APPLICATIONS_PER_STATUS",
          ReviewerInboxLoadDataTask::DEFAULT_COUNT
        ).to_i
    )
  end
end
