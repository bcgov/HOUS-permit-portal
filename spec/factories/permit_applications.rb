FactoryBot.define do
  factory :permit_application do
    transient do
      submitter { association(:user, role: "submitter") }
      jurisdiction { nil }
      pid { nil }
      pin { nil }
      full_address { nil }
      # Sandbox now lives on PermitProject. This transient forwards the value
      # to the permit_project association so existing callsites that pass
      # `sandbox:` to this factory keep working.
      sandbox { nil }
      # When true, stub a fake plan document to satisfy step_code_plan_* helpers
      with_fake_plan_document { false }
      # The submitter must belong to the project.
      ensure_submitter_membership { true }
    end

    permit_project do
      attrs = {}
      attrs[:owner] = submitter
      attrs[:jurisdiction] = jurisdiction if jurisdiction.present?
      attrs[:pid] = pid if pid.present?
      attrs[:pin] = pin if pin.present?
      attrs[:full_address] = full_address if full_address.present?
      attrs[:sandbox] = sandbox if sandbox.present?
      association(:permit_project, **attrs)
    end

    status { :new_draft }
    sequence(:nickname) { |n| "Permit Application Nickname #{n}" }
    association :template_version

    after(:build) do |permit_application, evaluator|
      project = permit_application.permit_project
      if project&.persisted? && evaluator.submitter
        membership =
          project.project_memberships.find_by(user_id: evaluator.submitter.id)
        if membership
          permit_application.submitter_membership = membership
        elsif !evaluator.ensure_submitter_membership
          permit_application.submitter = evaluator.submitter
        end
      end
      if evaluator.with_fake_plan_document
        fake_doc =
          Struct.new(:last_signer, :file_data).new(
            { name: "Signer", date: Time.current },
            { "metadata" => { "filename" => "plan.pdf" } }
          )
        permit_application.define_singleton_method(:step_code_plan_document) do
          fake_doc
        end
      end
    end

    after(:create) do |permit_application, evaluator|
      next unless evaluator.ensure_submitter_membership
      next if permit_application.submitter_membership_id.present?
      next if evaluator.submitter.blank?

      project = permit_application.permit_project
      next if project.blank?

      membership =
        project.project_memberships.find_by(user_id: evaluator.submitter.id) ||
          project.project_memberships.create!(
            user: evaluator.submitter,
            access: :limited
          )
      permit_application.update_columns(submitter_membership_id: membership.id)
      permit_application.submitter_membership = membership
    end

    trait :newly_submitted do
      status { :newly_submitted }
      after(:create) do |permit_application|
        create(:submission_version, permit_application: permit_application)
        permit_application.reindex
      end
    end

    trait :revisions_requested do
      status { :revisions_requested }
      after(:create) do |permit_application|
        submission_version =
          create(:submission_version, permit_application: permit_application)
        create(:revision_request, submission_version: submission_version)
        permit_application.reindex
      end
    end

    trait :resubmitted do
      status { :resubmitted }
      after(:create) do |permit_application|
        viewed_submission_version =
          create(
            :submission_version,
            :viewed,
            permit_application: permit_application
          )
        create(:revision_request, submission_version: viewed_submission_version)
        create(:submission_version, permit_application: permit_application)
        permit_application.reindex
      end
    end
  end
end
