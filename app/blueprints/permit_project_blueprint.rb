class PermitProjectBlueprint < Blueprinter::Base
  identifier :id

  view :base do
    fields :full_address,
           :title,
           :pid,
           :number,
           :jurisdiction_disambiguated_name,
           :state,
           :is_pinned,
           :created_at,
           :updated_at,
           :viewed_at,
           :enqueued_at,
           :owner_id,
           :latitude,
           :longitude,
           :parcel_geometry

    field :days_in_queue
    field :total_permits_count, default: 0
    field :new_draft_count, default: 0
    field :newly_submitted_count, default: 0
    field :in_review_count, default: 0
    field :revisions_requested_count, default: 0
    field :resubmitted_count, default: 0
    field :approved_count, default: 0
    field :flag_list, default: []
    field :allowed_manual_transitions, default: []
    field :sorted_application_statuses, default: []
    field :inbox_sorted_application_statuses, default: []
    field :owner_name, default: nil
    field :inbox_sort_order, default: nil

    field :is_fully_loaded do |_permit_project, _options|
      false
    end

    field :jurisdiction_disambiguated_name do |permit_project, _options|
      permit_project.jurisdiction.disambiguated_name
    end

    # NOTE: is_pinned check is optimized by preloading ids in the controller
    field :is_pinned do |permit_project, options|
      options[:pinned_project_ids]&.include?(permit_project.id)
    end

    field :has_outdated_draft_applications do |permit_project, options|
      options[:project_ids_with_outdated_drafts]&.include?(permit_project.id)
    end

    field :has_active_project_meeting do |permit_project, options|
      options[:active_project_meeting_ids_by_project_id]&.key?(
        permit_project.id
      ) || false
    end

    field :active_project_meeting_id do |permit_project, options|
      options[:active_project_meeting_ids_by_project_id]&.[](permit_project.id)
    end
  end

  view :jurisdiction_review_inbox do
    include_view :base

    association :review_delegatee,
                blueprint: CollaboratorBlueprint,
                if: ->(_field_name, permit_project, options) do
                  options[:current_user]&.review_staff_of?(
                    permit_project.jurisdiction_id
                  )
                end do |permit_project, _options|
      permit_project.review_delegatee
    end

    association :permit_project_collaborations,
                blueprint: PermitProjectCollaborationBlueprint,
                if: ->(_field_name, permit_project, options) do
                  options[:current_user]&.review_staff_of?(
                    permit_project.jurisdiction_id
                  )
                end
  end

  view :extended do
    include_view :base

    field :is_fully_loaded do |_permit_project, _options|
      true
    end

    field :current_user_role do |permit_project, options|
      permit_project.project_role_for(options[:current_user])
    end

    field :current_user_permissions do |permit_project, options|
      permit_project.permissions_for(options[:current_user]).to_h
    end

    association :project_memberships,
                blueprint: ProjectMembershipBlueprint,
                view: :base,
                if: ->(_field_name, permit_project, options) do
                  permit_project.permissions_for(
                    options[:current_user]
                  ).collaborators_view?
                end do |permit_project, _options|
      permit_project.project_memberships.kept.includes(:user, :invited_by)
    end

    association :project_teams,
                blueprint: ProjectTeamBlueprint,
                view: :base,
                if: ->(_field_name, permit_project, options) do
                  permit_project.permissions_for(
                    options[:current_user]
                  ).teams_view?
                end do |permit_project, _options|
      permit_project.auto_teams
    end

    association :recent_permit_applications,
                blueprint: PermitApplicationBlueprint,
                view: :project_base do |permit_project, options|
      permit_project.recent_permit_applications(options[:current_user])
    end
    association :project_documents,
                blueprint: ProjectDocumentBlueprint do |permit_project, options|
      permit_project.project_documents(options[:current_user])
    end
    association :active_project_meeting, blueprint: ProjectMeetingBlueprint
    association :jurisdiction, blueprint: JurisdictionBlueprint, view: :base
    association :notes, blueprint: NoteBlueprint do |permit_project, options|
      PermitProjectBlueprint.notes_for(permit_project, options)
    end
  end

  view :inbox_extended do
    include_view :jurisdiction_review_inbox

    field :is_fully_loaded do |_permit_project, _options|
      true
    end

    field :first_application_received_at

    association :permit_applications,
                blueprint: PermitApplicationBlueprint,
                view: :jurisdiction_review_inbox do |permit_project, _options|
      permit_project.permit_applications.kept.select(&:submitted_at_least_once?)
    end
    association :recent_permit_applications,
                blueprint: PermitApplicationBlueprint,
                view: :jurisdiction_review_inbox do |permit_project, _options|
      permit_project.recent_inbox_permit_applications
    end
    association :project_documents,
                blueprint:
                  ProjectDocumentBlueprint do |permit_project, _options|
      permit_project.association(:project_documents).reader
    end
    association :jurisdiction, blueprint: JurisdictionBlueprint, view: :base
    association :notes, blueprint: NoteBlueprint do |permit_project, options|
      PermitProjectBlueprint.notes_for(permit_project, options)
    end
    association :recent_audits,
                blueprint: ProjectAuditBlueprint,
                view: :base do |permit_project, options|
      permit_project.recent_audits(options[:current_user])
    end
  end

  def self.show_private_title?(permit_project, current_user)
    return false unless current_user

    return true if permit_project.owner_id == current_user.id
  end

  def self.notes_for(permit_project, options)
    scope = options[:notes_scope] || Note.all

    scope
      .where(permit_project: permit_project)
      .preload(:user, :permit_project, :note_attachment_documents)
      .order(created_at: :desc)
  end
end
