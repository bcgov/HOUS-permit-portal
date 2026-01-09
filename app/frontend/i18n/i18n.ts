import i18n from "i18next"
import { initReactI18next } from "react-i18next"

export const defaultNS = "translation"
export const fallbackNS = "translation"

const options = {
  resources: {
    /* English translations */
    en: {
      translation: {
        auth: {
          login: "Log in",
          loginTitle: "Log in to Building Permit Hub",
          firstTime: "First time here? You need a BCeID or BC Services Card Account to log in",
          publicLogin: "I am applying for a permit",
          publicLoginDescription: "Create, submit, collaborate, and manage building permit applications",
          localGovLogin: "I represent a local government or First Nation",
          localGovLoginDescription: "Manage and approve building permit applications",
          adminLogin: "Admin login",
          adminAccountAccess: "If you cannot log in with your IDIR, please contact your administrator to gain access.",
          lgPrompt:
            "You must have a BCeID account to use this system. If you don't have one yet, please register for one based on your use case.",
          publicPrompt:
            "You must have either a BC Services Card Account or BCeID account to use this system. If you don't have one yet, please register for one based on your use case. <br/><br/> <strong>Please note that BCeID and BC Services Card logins will act as two separate accounts, and you must consistently use the same method for all future logins.</strong>",
          chooseSituation: "Choose the situation that best matches your own to learn more about your login choices.",
          loginHelp: "Having trouble logging in?",
          goToPartners: "Go to our login partners",
          submitterAccordion: "I'm an individual submitter, such as a homeowner or agent",
          lgAccordion: "I'm logging in as a representative of a local government or First Nation ",
          entityAccordion:
            "I'm logging in on behalf of a legal entity, such as a company, partnership, or educational institution ",
          localGov: "Are you a member of local government?",
          chooseLogin: "Choosing the right option",
          matchLogin: "Choose the option that best matches your situation to access this service",
          notLocalGov: "Are you not a member of local government?",
          goToGovLogin: "Go to local government login",
          goToPublicLogin: "Go to general public login",
          bceid: "BCeID",
          bcsc: "BC Services Card Account",
          keycloakinfo: {
            heading: "Which BCeID should I use?",
            useIf: "You can use this option if:",
            bcsc: {
              title: "BC Services Card Account",
              canadianResident: "You're a resident of Canada",
              register: "Set up BC Services Card Account",
            },
            basic: {
              title: "Basic BCeID",
              residentOrNon: "You're a resident or non-resident of Canada",
              repOrg: "You're representing a company or organization, but your company doesn't have a Business BCeID",
              lgReviewManager: "You're a regional review manager who is also an individual submitter",
              lgJurisdiction: "You're representing a jurisdiction, but your jurisdiction doesn't have a Business BCeID",
              register: "Register for Basic BCeID",
            },
            business: {
              title: "Business BCeID",
              entityDescription: "You can use this option if you're logging in on behalf of a legal entity, such as:",
              lgDescription:
                "Most people representing a local government or jurisdiction will use a Business BCeID to log in",
              company: "Company or partnership or sole proprietorship",
              nonProfit: "Not-for-profit or charitable organization",
              education: "Educational institution like a university or college",
              seeMore: "See more details",
              register: "Register for Business BCeID",
            },
          },
          logout: "Log out",
          submit: "Submit",
          or: "or",
          bceidLogin: "Log in with BCeID",
          bcscLogin: "Log in with BC Services Card Account",
          idirLogin: "Log in with IDIR",
          role: "Role",
          emailLabel: "Email address",
          userFirstNameLabel: "First name",
          userLastNameLabel: "Last name",
          organizationLabel: "Organization",
          organizationHelpText: "(if applicable)",
          register: "Register for account",
          registerButton: "Register",
          registerInstructions:
            "Please fill out the following registration form to create your account. Ensure all information is accurate and up-to-date.",
          certifiedProfessional: "I am a certified professional",
          completeAccountActiviation: "Please confirm your account",
          checkYourEmail:
            "Check your email inbox for a confirmation email to finish activating your new Building Permit Hub account.",
          tokenExpired: "Your session is no longer valid, please log in again",
        },
        landing: {
          title: "Building Permit Hub",
          intro:
            "The B.C. government is working with partners across all levels of government and First Nations to standardize and streamline the building permit process and unlock the construction of more homes, faster.",
          easilyUpload: "Easily upload required building permit information",
          bestPractices: "Standardized requirements across participating jurisdictions",
          easyToFollow: "Easy to follow instructions to help you submit a building permit application",
          accessMyPermits: "Access my building permits",
          accessExplanation: "Use your BCeID account to log in or register for the Building Permit Hub.",
          whoForTitle: "Who is this for?",
          whoFor: [
            "I want to build housing",
            "I am an industry professional",
            "I am a homeowner and need a building permit for housing",
            "I am a local government or First Nation and want to accept digital building permit applications",
          ],
          iNeed: "What do I need?",
          whyUseTitle: "Why use this tool?",
          whyUse:
            "The Building Permit Hub helps you submit a building permit application through a streamlined and standardized approach across jurisdictions in B.C. This tool connects you with local government and First Nations information to support the building permit submission process.",
          iNeedLong: "What do I need for a housing building permit?",
          reqsVary:
            "Permit requirements vary by local jurisdiction and depend on the geography of the surrounding location.",
          permitImportance:
            "Building permits are important to ensure your housing is safe, legal and compliant. Building permit requirements vary by local jurisdiction and depend on local servicing, zoning and bylaw requirements (e.g. rural services vs. urban, tree bylaws, etc.).",
          whereTitle: "Where",
          findAuthority: "Find your local building permitting authority.",
          locationOr: "Location or Civic Address",
          withinXRiver: "Within x km of a river",
          withinXForest: "Within x km of a forest",
          withinXProtected: "Within x km of a protected land",
          whatType: "What type of housing are you building?",
          dontSee: "Don't see the type that you're looking for?",
          whenNotNecessaryQ: "When is a permit needed?",
          whenNotNecessaryA:
            "Permits help ensure that construction and major renovations follow local bylaws, the building code and health and safety standards. You will need the required permits before any stage of a project can start. Projects for the interior of your home or minor repairs may not require a permit depending on your local jurisdiction and geography.",
          permitConnect:
            "The B.C government is making housing development projects easier with a new coordinated approach. Visit <1>Permit Connect BC to learn more</1>.",
          expectQ: "A new building permit experience for BC",
          expectA:
            "Building Permit Hub is a new way to submit building permits in BC. Here is what it can help you do:",
          createdQ: "Why was this tool created?",
          createdA:
            "The Building Permit Hub will make it faster and simpler for home builders and developers to send in building permits for new housing online. Local jurisdictions can receive the applications and process them faster too. This tool automatically checks if the application follows the rules in the B.C. Building Code, including the Energy Step Code, to help prevent any delays in the application process.",
          tellUsYourExperience: "Tell us about your experience with the Building Permit Hub",
          addressSelectLabel: "Location or civic address",
          where: "Where",
          findYourAuth: "Find your local building permit authority.",
          localJurisdiction: "Local jurisdiction",
          learnRequirements: "Learn about local requirements",
          cantFind: "Can't find your address?",
          browseList: "Browse list of jurisdictions",
          goTo: "Go to {{ location }}",
          permitApp: "Log in",
          adminPanel: "admin home",
          projectsPanel: "projects",
          enabledCommunitiesDescription: "Communities you can submit Building Permit applications in:",
          moreComingSoon: "(more coming soon)",
          andMore: "...and more",
          earlyAccessTemplates: "See some of our templates in progress",
          additionalContent: {
            left: "See helpful tips from your local jurisdictions to streamline your digital building permit applications",
            mid: "Preview the Small-scale/Multi-unit housing checklist",
            midSub: "(Part 9 BC Building Code)",
            viewTemplate: "View",
            midDownload: "Checklist",
            end: "Accurately fill out your permit application online with ease",
            endButton: "Get started now",
          },
          goToTools: "Go to tools",
          toolsSectionTitle: "Tools to help prepare your project for application",
          toolsSectionDesc1:
            "Use Building Permit Hub's tools to check your application for readiness and prepare key documents for your project. Check your project against Provincial requirements such as Step Codes and prepare other documents.",
          card1Title: "Find out what’s required before you apply",
          card1Body: "Tools and checklists to help you prepare your application package",
          card2Title: "Submit your application online",
          card2Body: "Consistent application forms, even when rules vary by community",
          card3Title: "Track progress and talk to reviewers",
          card3Body: "Stay up to date and respond to building officials directly, all in one place",
          helpShapeTitle: "Help shape standard permit application materials",
          helpShapeBody:
            "We are collaborating with local governments and First Nations across BC to develop standard permit application materials. We invite you to review the forms, requirements, and guidance and share your feedback.",
          reviewMaterials: "Review materials",
          underDevelopmentTitle: "Share your feedback on permit applications under development",
          underDevelopmentBody:
            "We’re co-developing standard permit classifications with local governments and First Nations across BC. These drafts are available for review and discussion as we continue this work together.",
          listedDrafts:
            " The listed drafts are open for review. These permit applications are drafts; do not use for permit intake.",
          shareFeedbackBody:
            "We’re looking for your input. <1>Email us your feedback at:</1> <2>digital.codes.permits@gov.bc.ca</2>",
          ssmuHousingTitle: "Small-scale / multi-unit housing permits",
          part9ChecklistsTitle: "Part 9 checklists",
          part9ChecklistsBody:
            "These checklists help you gather the right documents and prepare your application for small buildings that fall under Part 9 of the BC Building Code (up to 3 storeys, fewer than 600m²).",
          part9ChecklistsLink: "Part 9 checklists (PDF)",
        },
        standardizationPreview: {
          title: "Standard permit application materials",
          subtitle: "Review and provide feedback on permit application materials under development",
          previewDraftForm: "Preview",
          about: {
            title: "About this work",
            description1:
              "Building Permit Hub is working with BC communities to bring more clarity and consistency to building permit application materials.",
            description2:
              "We are developing shared forms and guidance that communities can choose to adopt. Feedback from local governments and First Nations helps shape these materials so they meet local needs. Published and draft versions are available for review.",
          },
          resources: {
            title: "Creating shared, common permitting resources",
            description:
              "We’re working with local governments and First Nations to develop shared application materials for many permit types. This work includes creating common versions of the following materials.",
            forms: {
              title: "Application forms",
              description: "A consistent structure with clear, plain-language questions.",
            },
            checklists: {
              title: "Requirement checklists",
              description: "Permit requirements written in a clear format, easy to read at a glance.",
            },
            drawing: {
              title: "Drawing content",
              description: "Guidance on how to prepare and organize design documents and drawings.",
            },
            terminology: {
              title: "Terminology and definitions",
              description:
                "Shared language to create consistency for applicants working across multiple jurisdictions.",
            },
          },
          voluntaryUse: {
            title: "Voluntary use of standard permit application materials",
            description1:
              "Communities can choose to adopt the shared forms and are invited to provide feedback to help refine them. You may hear this work described as standardization. In this context, standardization refers only to the application materials, not to permitting processes. Local governments continue to use their own review methods and make their own decisions.",
          },
          benefits: {
            title: "Benefits for applicants and local governments",
            description:
              "Clear, consistent application materials help applicants understand what to submit and support smoother reviews. Building Permit Hub’s catalogue of standard forms does not change local government processes and authority.",
            applicants: {
              title: "Applicants and industry",
              list: [
                "Clearer questions and requirements",
                "Shorter application forms",
                "More consistent expectations about what to submit",
                "Clearer guidance on drawings and attachments",
                "Less guesswork when preparing applications",
              ],
            },
            localGovernments: {
              title: "Local governments and First Nations",
              list: [
                "Clearer and more complete submissions",
                "Shared terminology across forms and requirements",
                "Submitted information presented in consistent formats",
              ],
            },
          },
          feedback: {
            title: "Share your feedback and stay informed",
            description:
              "You can help shape the standard forms, checklists, and guidance in development by reviewing drafts and sending us your feedback.",
            email: "Email feedback to: ",
            emailAddress: "digital.codes.permits@gov.bc.ca",
            demo: {
              title: "Demo sessions and engagement opportunities",
              description:
                "The Building Permit Hub team hosts regular public demos where we share updates, walk through early designs, and invite discussion. These sessions help us understand how the materials work for applicants, industry, and communities across BC.",
              link: "Sign up for the public demo mailing list",
            },
          },
          explore: {
            title: "Explore standard permit application forms",
            description:
              "You are invited to review and provide feedback on the draft forms, requirements, and guidance for the permit types currently available in Building Permit Hub.",
            smallScale: {
              title: "Small-scale projects only",
              description:
                "Building Permit Hub currently supports permits for small-scale projects. This includes residential buildings, small structures, trades permits, and site work.",
            },
          },
          availableForAdoption: {
            title: "Published permits available for adoption",
          },
          underDevelopment: {
            title: "Permit application materials under development",
          },
        },
        ui: {
          updatedAt: "Updated at",
          beta: "Beta",
          optional: "(optional)",
          next: "Next",
          check: "Check",
          saveAndcontinue: "Save and continue",
          selectParticipatingJurisdiction: "Please select a participating jurisdiction to continue",
          participatingCommunityTitle: "Your project is in a participating community",
          participatingCommunityDescription:
            "You can use this service to pre-check your drawings against selected parts of the BC Building Code.",
          serviceNotAvailableTitle: "This service is not available in your community",
          serviceNotAvailableDescription: "For questions about code compliance, contact your local building officials.",
          clear: "Clear",
          switchToManualMode: "Manually select my jurisdiction",
          switchToAutomaticMode: "Use my address to automatically select my jurisdiction",
          empty: "No items yet",
          enabled: "Enabled",
          disabled: "Disabled",
          type: "Type",
          noOptionsFound: "No options found",
          change: "Change",
          copyValue: "Copy value",
          clearSelection: "Clear selection",
          apply: "Apply",
          okay: "Okay",
          filter: "Filter",
          until: "til",
          start: "Start",
          reorder: "Reorder",
          delete: "Delete",
          confirmDelete: "Confirm delete",
          confirmation: "Are you sure you want to proceed?",
          confirmOverwrite: "Are you sure you want to save and overwrite this item?",
          sureDelete: "Are you sure you want to delete this item?",
          disable: "Disable",
          ok: "OK",
          dismiss: "Dismiss",
          revoke: "Revoke",
          create: "Create",
          verified: "Verified",
          unverified: "Unverified",
          tip: "Tip",
          manage: "Manage",
          export: "Export",
          preview: "Preview",
          back: "Back",
          backHome: "Back to home",
          yes: "Yes",
          no: "No",
          na: "N/A",
          show: "Show",
          hide: "Hide",
          setup: "Setup",
          search: "Search",
          loading: "Loading...",
          invalidInput: "Invalid input",
          invalidUrl: "Invalid url",
          invalidEmail: "Invalid email",
          selectPlaceholder: "Select",
          selectApplicable: "Select applicable:",
          clickHere: "Click here",
          clickToEdit: "Click to edit",
          clickToShow: "Click to show",
          feedbackLink: "Tell us what you think",
          sortBy: "Sort by",
          resume: "Resume",
          cancel: "Cancel",
          remove: "Remove",
          save: "Save changes",
          onlySave: "Save",
          done: "Done",
          view: "View",
          totalItems: "Total items",
          doLater: "Do this later",
          add: "Add",
          edit: "Edit",
          uploaded: "Uploaded",
          required: "Required",
          archive: "Remove and archive",
          restore: "Restore",
          archived: "Archived",
          active: "Active",
          seeArchivedButton: "See archived",
          seeUnarchivedButton: "See unarchived",
          never: "never",
          submit: "Submit",
          select: "Select",
          selected: "selected",
          notAvailable: "Not available yet",
          notApplicable: "Not applicable",
          isRequired: "{{field}} is required",
          notSupported: "Not supported",
          use: "Use",
          publish: "Publish",
          neverMind: "Never mind",
          open: "Open",
          download: "Download",
          expandAll: "Expand all",
          collapseAll: "Collapse all",
          toTop: "Go to top",
          confirm: "Confirm",
          modifiedBy: "Modified by",
          searchAddresses: "Search addresses",
          enterAddress: "Enter address",
          projectAddress: "Project address",
          typeToSearch: "Begin typing to search",
          close: "Close",
          asc: "Ascending",
          desc: "Descending",
          returnHome: "Return to home",
          copied: "Copied!",
          failedToCopy: "Something went wrong while trying to copy",
          fileUnavailable: "File unavailable",
          fileRemoved: "FILE REMOVED",
          reset: "Reset",
          autofill: "Autofill",
          help: "Help",
          pleaseSelect: "Please select",
          noAddressFound: "We couldn’t find your jurisdiction. Type it in below.",
          cityOrJurisdiction: "City or Jurisdiction",
          checked: "Checked",
          unchecked: "Unhecked",
          showAdvanced: "Show advanced",
          hideAdvanced: "Hide advanced",
          emailPlaceholder: "Please enter an email",
          urlPlaceholder: "https://",
          showOlder: "Show older",
          seeMore: "See more",
          go: "Go",
          all: "All",
          and: "and",
          or: "or",
          actionRequired: "Action required",
          resetFilters: "Reset filters",
          customize: "Customize",
          acknowledgeAndDismiss: "Acknowledge and dismiss",
          markedForRemoval: 'Click "Save changes" to confirm removal',
          proceed: "Proceed",
          copy: "Copy",
          copyNoun: "Copy",
          options: "Options",
          share: "Share",
          unassigned: "Unassigned",
          unassign: "Unassign",
          seeEarlyAccessButton: "See Early Access",
          seeLiveButton: "See Live",
          invite: "Invite",
          public: "Public",
          undo: "Undo",
          chooseSandboxMode: "Choose a training mode",
          new: "new",
        },
        notification: {
          title: "Notifications",
          nUnread: "{{ n }} new",
          noUnread: "No unread notifications",
          file_upload_failed:
            "A file you uploaded could not be processed and has been removed. Please try uploading the file again.",
        },
        eula: {
          title: "End-User License Agreement",
          accept: "Accept agreement",
        },
        userEulas: {
          title: "End user license agreement",
          viewAgreement: "View agreement",
          view: "View",
          actionRequired: "Action required",
          acceptedOn: "You accepted this agreement on {{date}} at {{time}}.",
          pastAgreementsModal: {
            title: "Past end user license agreements",
            triggerButton: "See past",
            acceptedOn: "Accepted on {{ timestamp }}",
          },
        },
        preCheck: {
          disabled: "Code compliance pre-check is currently not available. ",
          startNew: "New pre-check",
          noneFoundExplanation: "No pre-checks found",
          index: {
            title: "Pre-checks",
            resultTitle: "Pre-check results",
            intro:
              "Your results from the BC Building Code pre-checking service are stored here. You can use this service to pre-check your drawings for compliance with select areas of the BC Building Code before you submit a permit application.",
            betaNotice:
              "During beta, the service is free and available only in participating communities. You may also be invited to share feedback about your experience. <1>Learn more about the BC Building Code pre-checking service</1>.",
            openInteractiveReport: "Open interactive report",
            downloadReport: "Download report",
            expiry: "Pre-checks reports are available for 150 days after they are created.",
          },
          infoPage: {
            title: "Pre-check your drawings for compliance with BC Building Code",
            description:
              "You can use this service to pre-check your drawings for compliance with select areas of the BC Building Code before you submit a permit application. During beta, the service is available only in participating communities. You may also be invited to share feedback about your experience.",
            whereYouCanUse: "Where you can use this service",
            whereDescription:
              "This service is in beta, so availability is limited. You can only use the service if your project is in one of these communities:",
            projectsYouCanUse: "Projects you can use this service for",
            projectsDescription:
              "This service is only for small residential projects Part 9 of the BC Building Code, including:",
            conclusion:
              "If your project is in one of these communities and meets these criteria, you can use this service to pre-check your drawings.",
            startNow: "Start now",
            projectType1: "single detached houses",
            projectType2: "townhouses",
            projectType3: "duplexes, triplexes, or fourplexes",
            projectType4: "laneway houses, carriage houses, or garden suites",
            howItWorks: "How it works",
            step1: "Upload your drawings",
            step2: "Receive a detailed report showing where your drawings do or don't follow the BC Building Code",
            step3: "Update your drawings to fix issues",
            step4: "Apply for your permit(s) with your updated drawings",
            aboutResults: "About your results and permit approval",
            aboutResultsDescription:
              "This service gives you information only. Results depend on the accuracy of the drawings you upload.",
            disclaimer1:
              "Results are for your reference only; results will not be included as part of a permit application for your project",
            disclaimer2: "Results do not replace a plan check by a building official",
            disclaimer3: "A passing result does not mean your drawings are approved or that a permit will be issued",
            disclaimer4: "Permits are approved or rejected by the authority having jurisdiction for your project",
            disclaimer5: "While this service is in beta, you may encounter occasional issues",
            betaBenefits: "Benefits of taking part in this service during beta",
            betaBenefitsIntro: "By using this service during beta, you may:",
            benefit1: "Pre-check your drawings for common compliance issues before you apply",
            benefit2: "Get feedback within two days or less",
            benefit3: "Spot issues early, before they cause delays",
            benefit4: "Better understand building code requirements for your project",
            thirdPartyPartnership: "This service is provided in partnership with third-party companies",
            thirdPartyDescription:
              "The Ministry of Housing and Municipal Affairs works with technology companies to deliver this service. Service partners build tools for property development, design, and automated compliance checking.",
            feedback: "Your feedback helps us improve this service",
            feedbackDescription1:
              "While using this service, you can choose to be contacted by the Ministry of Housing and Municipal Affairs to take part in research like surveys or interviews.",
            feedbackDescription2:
              "You can also ask questions, share feedback, or enquire about research opportunities anytime by emailing us at",
            allJurisdictions: "All jurisdictions",
            noJurisdictions: "No jurisdictions enrolled",
          },
          form: {
            title: "Pre-check your drawings for compliance with BC Building Code",
            backToPreChecks: "Go to pre-checks",
          },
          columns: {
            created_at: "Created",
            updated_at: "Last Updated",
            title: "Project",
            external_id: "External ID",
            status: "Status",
            full_address: "Address",
            service_partner: "Service Partner",
          },
          sidebar: {
            sections: {
              start: "START",
              drawings: "DRAWINGS",
              reviewAndSubmit: "REVIEW AND SUBMIT",
              results: "RESULTS",
            },
            servicePartner: "Service partner",
            projectAddress: "Project address",
            agreementsAndConsent: "Agreements and consent",
            buildingType: "Building type",
            uploadDrawings: "Upload drawings",
            confirmSubmission: "Confirm your submission",
            resultsSummary: "Results summary",
          },
          sections: {
            servicePartner: {
              title: "Service partner",
              intro:
                "To receive a compliance report, your drawings will be analyzed by a third-party service provider. Select the one that best fits your project needs. The Ministry of Housing and Municipal Affairs does not endorse one provider over another.",
              availableProviders: "Available providers",
              archistarTitle: "Archistar eCheck",
              archistarDescription:
                "Archistar is an Australian technology company that creates tools for property development, generative design, and automated compliance checking.",
              visitWebsite: "Visit Archistar's website",
              freeToUse: "Free to use",
              automatedReview: "Automated code analysis and human review",
              resultsTime: "Results in 48 hours or less",
              smallResidential: "For small residential buildings only",
              preChecksFor: "Pre-checks drawings for the following code requirements:",
              buildingHeight: "Building height",
              footings: "House footings and foundation size",
              egress: "Shared egress facilities",
              stairs: "Stairs in dwelling units",
              selectArchistar: "Pre-check with Archistar eCheck",
            },
            projectAddress: {
              title: "Project Address",
              description: "Enter an address to confirm the service is available for your building project",
            },
            agreementsAndConsent: {
              title: "Agreements and Consent",
              description: "To use this service, you need to agree to the End User Licence Agreement (EULA).",
              readEula: "Read the full EULA",
              eulaCheckbox: "I have read and agree to the End User Licence Agreement (EULA)",
              sendDrawingsCheckbox: "I consent to my drawings being sent to Archistar for pre-checking",
              sendDrawingsRequired: "You must consent to send drawings",
              eulaRequired: "You must accept the EULA",
              shareSubmissionTitle: "Share your submission details (optional)",
              shareSubmissionDescription:
                "You can choose to share limited details from your submission with {{jurisdictionName}} to help improve the accuracy of this service. This includes:",
              shareItem1: "project address",
              shareItem2: "date of submission",
              shareItem3: "results summary",
              shareSubmissionNote:
                "{{jurisdictionName}} may use this information to review and compare the results of your pre-check.",
              shareWithJurisdictionCheckbox: "I agree to share details of this submission with {{jurisdictionName}}",
              researchTitle: "Take part in research (optional)",
              researchDescription:
                "You can let the Ministry of Housing and Municipal Affairs contact you about taking part in research to help improve this service.",
              researchCheckbox:
                "I agree to be contacted by the Ministry of Housing and Municipal Affairs about taking part in research",
            },
            buildingType: {
              title: "Building Type",
              description:
                "Choose the building type that best describes your project. Only small-scale/multi-unit housing is supported at this time.",
            },
            uploadDrawings: {
              title: "Upload drawings",
              description:
                "Upload a single PDF that includes the drawings you would normally submit with a building permit application.",
              fileRequirementsTitle: "File requirements",
              requirement1: "PDF format only",
              requirement2: "One file, not multiple PDFs",
              requirement3: "Design drawings must be legible and properly scaled",
              requirement4: "Maximum file size: 200 MB",
              fileName: "File Name",
              size: "Size",
              dragAndDrop: "Drag and drop files here, or",
              browseDevice: "browse your device",
              protectionTitle: "How {{provider}} protects and stores your drawings",
              protectionDescription1:
                "Our service partners use industry-standard security to protect your drawings. {{provider}} will keep your drawings for up to 150 days, then delete them. All drawings will be deleted on December 31, 2025, when the beta testing period ends.",
            },
            confirmSubmission: {
              title: "Review and submit",
              description: "Review your information before submitting.",
              projectNumber: "Project number",
              applicationNumber: "Application number",
              address: "Address",
              jurisdiction: "Jurisdiction",
              uploadedFiles: "Uploaded files ({{count}})",
              noFiles: "No files uploaded",
              submit: "Submit",
              confirmTitle: "Confirm Submission",
              confirmBody:
                "Are you sure you want to submit this pre-check? Once submitted, you will not be able to make any changes.",
              completeAllFields: "Please complete all required sections before submitting.",
            },
            resultsSummary: {
              title: "Results Summary",
              description: "View your pre-check results.",
              notSubmitted: "Pre-check not submitted",
              notSubmittedDescription:
                "This pre-check has not been submitted yet. Please complete all sections and submit your pre-check to receive results.",
              goToSubmission: "Go to submission",
              preparing: "We're preparing your results",
              timeframe: "Most reports are ready within a few hours, but it can take up to 48 hours.",
              whatHappensNext: "What happens next",
              step1: "Your drawings are analyzed",
              step2: "A PDF report and interactive results are generated",
              step3: "The downloadable report and a link to interactive results are available in your Pre-checks",
              notification:
                "You don't need to stay on this page. We'll notify you as soon as your results are ready. You'll find completed reports in the Pre-checks section.",
              refreshStatus: "Refresh status",
              ready: "Your BC Building Code compliance report is ready",
              projectDetails: "Project details",
              readyDescription: "Your pre-check has been reviewed and the results are now available.",
              nextSteps: "Next steps",
              whatYouCanDoNow: "What you can do now",
              unknownStatus: "Unknown status",
              exploreResults: "Explore interactive results",
              downloadOrExplore:
                "Download a PDF report listing all pre-check results, or explore them interactively in alongside your drawings.",
              addressCompliance:
                "You can use these results to address any compliance issues and prepare your drawings for a permit application.",
              notShared:
                "These results are not shared with your local building officials and are not part of your official permit submission.",
              noGuarantee:
                "A passing result does not guarantee approval: a building official will still carry out a full review as part of the permit application process.",
              jurisdictionApproval: "Only your local jurisdiction can approve or reject a permit application.",
              betaNotice:
                "This service is in beta. If you experience issues or have questions about your results, contact us at",
              preferResults: "Prefer results you can save and print?",
              downloadReport: "Download your PDF report",
              pdfUnavailable: "PDF report unavailable",
              expiredTitle: "This pre-check is expired",
              expiredDescription:
                "This pre-check is expired because it was created more than 150 days ago. You will not be able to download the PDF report or explore the interactive results.",

              sections: {
                whatYouCanDo: {
                  title: "What you can do now",
                  download:
                    "Download a PDF report listing all pre-check results, or explore them interactively in alongside your drawings.",
                  address:
                    "You can use these results to address any compliance issues and prepare your drawings for a permit application.",
                  beta: "This service is in beta. If you experience issues or have questions about your results, contact us at",
                },
                reportPreparedBy: {
                  title: "Report prepared by {{serviceProvider}}",
                  providedBy: "This service is provided by {{serviceProvider}} to give you early guidance only.",
                  ministryDisclaimer:
                    "The Ministry of Housing and Municipal Affairs (“we”) does not guarantee the accuracy or completeness of any information produced by this service.",
                  liability:
                    "We are not liable for any errors, omissions, or any actions you take in reliance upon this service.",
                  notShared:
                    "Results from this service are not shared with your local building officials and are not part of your official permit submission.",
                  noGuarantee:
                    "A passing result does not guarantee approval: a building official will still carry out a full review as part of the permit application process.",
                  jurisdiction: "Only your local jurisdiction can approve or reject a permit application.",
                },
              },
            },
          },
          viewer: {
            title: "Interactive Results Viewer",
            noUrl: "The interactive viewer is not yet available for this pre-check.",
            disclaimer:
              "{{serviceProvider}} prepared these results to give early guidance. They may not be complete or accurate.",
          },
        },
        contact: {
          create: "New contact",
          edit: "Edit contact",
          createButton: "Save to my contacts",
          updateButton: "Update contact",
          confirmDeleteTitle: "Are you sure you want to delete this contact?",
          confirmDeleteBody: "This will not remove information from the form.",
          fields: {
            firstName: "First name",
            lastName: "Last name",
            title: "Role/Position",
            department: "Department",
            email: "Email",
            phone: "Phone no.",
            extension: "Extension",
            cell: "Mobile no.",
            organization: "Organization",
            address: "Address",
            businessName: "Business name",
            businessLicense: "Business license",
            professionalAssociation: "Professional association",
            professionalNumber: "Professional number",
            contactType: "Contact Type",
          },
          contactTypes: {
            general: {
              adjacentOwner: "Adjacent Owner",
              applicant: "Applicant",
              builder: "Builder",
              business: "Business",
              contractor: "Contractor",
              designer: "Designer",
              developer: "Developer",
              lawyer: "Lawyer",
              propertyManager: "Property Manager",
              purchaser: "Purchaser",
              owner: "Owner",
              tenant: "Tenant",
              siteContact: "Site contact",
            },
            professional: {
              architect: "Architect",
              coordinatingRegisteredProfessional: "Coordinating Registered Professional",
              engineer: "Engineer",
              civilEngineer: "Civil Engineer",
              electricalEngineer: "Electrical Engineer",
              energyAdvisor: "Energy Advisor",
              fireSuppressionEngineer: "Fire Suppression Engineer",
              fireContact: "Fire Contact",
              geotechnicalEngineer: "Geotechnical Engineer",
              lawyer: "Lawyer",
              mechanical: "Mechanical",
              mechanicalEngineer: "Mechanical Engineer",
              plumbingEngineer: "Plumbing Engineer",
              plumber: "Plumber",
              qualifiedEnvironmentalProfessional: "Qualified Environmental Professional",
              registeredOnsiteWastewaterPractitioner: "Registered Onsite Wastewater Practitioner",
              structuralEngineer: "Structural Engineer",
              surveyor: "Surveyor",
            },
          },
        },
        jurisdiction: {
          yourJurisdiction: "your jurisdiction",
          edit: {
            displayDescriptionLabel: "Jurisdiction description (public)",
            title: "Manage jurisdiction name settings",
            addDescription: "Click to add a description",
            displayChecklistLabel: "Permit application checklist (public)",
            addChecklist: "Click to add a permit application checklist",
            displayLookOutLabel: '"Look Out" Section (public)',
            addLookOut: 'Click to add a "Look Out" section',
            displayContactSummaryLabel: "Contact Summary Section (public)",
            addContactSummary: "Click to add a Contact Summary section",
            firstContact: "The first contact will be displayed upon successful permit application submission.",
            clickToEditContacts: "Click to edit contacts",
            clickToShowContacts: "Click to show contacts as they will be seen",
            clickToEditMap: "Click to edit map",
            clickToSeeMap: "Click to see map",
            clickToShowMap: "Click to show map as it will be seen",
            editMapStart: "To display a map of your jurisdiction on the 'About' page, please follow these steps:",
            editMapSteps: [
              "Identify the central point of your jurisdiction on Google Maps.",
              "Right-click on the desired central location to open a context menu.",
              "Select the option that displays the coordinates to copy them.",
              "Individually paste these coordinates into the fields below",
              "Adjust the zoom level below to your preference.",
              "Remember to click 'Save' at the bottom of the page to apply your changes.",
            ],
            editMapEnd:
              "This process ensures the map accurately represents the center of your jurisdiction and is displayed with the appropriate level of detail.",
            stepCode: {
              title: "Step code requirements",
              description:
                "Below are the step code requirements for each permit application type. <1>What does each step code level mean?<2></2></1>",
              permitType: "BCBC Part",
              workType: "Work type",
              energyStepRequired: "Energy step code required",
              zeroCarbonStepRequired: "Zero carbon step required",
            },
            updateButton: "Update jurisdiction",
          },
          new: {
            title: "Create new jurisdiction",
            createButton: "Create jurisdiction",
            nameLabel: "Name of local jurisdiction",
            nextStep: "The next step is to invite users",
            useCustom: "Use a custom locality type",
          },
          index: {
            title: "Jurisdictions",
            description: "Search or sort to check if a community is accepting permit application submissions",
            createButton: "Create new jurisdiction",
            tableHeading: "Local governments",
            users: "Users",
            energyStepRequirements: "Energy step requirements",
            externalApiKeys: "API settings",
            exportTemplates: "Export templates",
            about: "About",
            rename: "Edit name & location",
          },
          fields: {
            reverseQualifiedName: "Name",
            reviewManagersSize: "Managers",
            reviewersSize: "Reviewers",
            localityType: "Locality type",
            permitApplicationsSize: "Applications received",
            templatesUsed: "Templates used",
            mapPosition: "Map position",
            regionalDistrictName: "Regional district",
            inboxEnabled: "Accepting submissions",
            ltsaMatcher: "Matched jurisdiction with LTSA",
          },
          determineWithSite:
            "Enter an address or PID within this jurisdiction to determine the matched jurisdiction with LTSA",
          ltsaMatcherExplanation:
            "Give an examlpe address or PID so our app knows how a site from this jurisdiction would be represented in the LTSA service. This is needed to determine which PIDs correspond to this jurisdiction. Please edit this using this selector if you are having problems with addresses not being matched correctly to this jurisdiction.",
          ltsaMatcherHelp:
            "Enter an address or PID above to determine this field. This is the name of the jurisdiction as it appears in the LTSA service which is used to find this jurisdiction in the LTSA service PID lookup.",
          lat: "Latitude",
          lng: "Longitude",
          title: "Local housing permits",
          notEnabled: "Permit application submissions are temporarily unavailable for this jurisdiction.",
          checklist: "Checklist",
          lookOut: "Things to look out for",
          resources: {
            title: "Resources",
            sectionTitle: "Resources for applicants",
            description: "Additional resources and reference materials to help you with your application:",
            categories: {
              planning_zoning: "Planning & zoning",
              bylaws_requirements: "Bylaws & requirements",
              gis_mapping: "GIS mapping",
              additional_resources: "Additional resources",
            },
          },
          documents: {
            title: "Documents",
          },
          startApplication: "Start a permit application",
          contactInfo: "Contact information",
          didNotFind: "I didn't find what I was looking for",
          viewAs: "View as",
          name: "Name",
          managers: "Managers",
          reviewers: "Reviewers",
          applicationsReceived: "Applications received",
          templatesUsed: "Templates used",
          search: "Search jurisdictions",
          view: "View Jurisdiction",
          notUsingBPH: {
            title: "This community isn't using Building Permit Hub yet",
            description:
              "Building Permit Hub helps people in British Columbia understand local permitting requirements, prepare applications, and submit them online. Participating jurisdictions can review applications more efficiently, with automatic checks and digital tools to help avoid delays.",
            noInfo:
              "This community hasn't joined Building Permit Hub yet, so you won't find permitting information here for {{jurisdictionName}}.",
            wantToUse: {
              title: "Want to use Building Permit Hub in your community?",
              description:
                "Let your local government or First Nation know you're interested in using this service. We've written a sample email to make it easy.",
              emailButtonDescription: "Click the button below to open the message in your default email client.",
              emailButtonText: "Send an email to your local government",
              emailSubject: "Please contact {{jurisdictionName}} about joining Building Permit Hub",
              emailBody: `Hello,

I'd like to see my community, {{jurisdictionName}}, join Building Permit Hub.

Why I think they should join:
[List any issues you've run into when applying for permits, e.g. delays, confusion, inconsistent requirements, etc.]

Please reach out to my local jurisdiction to let them know there's interest from the community.

Thank you,
[Your name]
[Optional: Your business or company name]
[Optional: Your contact info, if needed for follow-up]`,
            },
          },
        },
        permitCollaboration: {
          status: "Status",
          blockStatus: {
            draft: "Draft",
            in_progress: "In progress",
            ready: "Ready",
          },
          sidebar: {
            triggerButton: "Collaborators ({{count}})",
            title: "Collaborators",
            description: {
              submission:
                "Collaborators can be invited to work on the different areas of the permit application form. Only the author can manage collaborators.",
              review: "Collaborators can be invited to work on the different areas of the permit application form.",
            },
            howItWorksTitle: "How it works",
            howItWorksDescription: {
              submission:
                "The collaboration feature allows the author of a permit application to invite collaborators by email. Invited collaborators must register for an account through BCeID if they do not have one already.<1/><1/> Collaborators can view and contribute only to the requirement blocks they are assigned. Notifications are sent to the collaborators when they are assigned to a requirement block, and their avatars are displayed next to the blocks they are assigned to.<1/><1/> Additionally, the designated submitter has access to the entire application and can submit it on behalf of the author. The author can manage and remove collaborators as needed.",
              review:
                "The collaboration feature allows reviewers of a submitted permit application to invite additional reviewers, provided they are already part of the jurisdiction.<1/><1/> Reviewers can view and contribute to the assigned requirement blocks and update the status of each block. Notifications are sent when reviewers are assigned to a requirement block or when the status changes to 'Ready'. Avatars are displayed next to the blocks to indicate who is assigned. Status updates are visible only to reviewers within the local jurisdiction.<1/><1/> The designated reviewer serves as the primary contact internally at the local jurisdiction, responsible for overseeing the submitted permit application.",
            },
            designatedSubmitters: "Designated submitter(s)",
            designatedReviewers: "Designated reviewer(s)",
            authorCanSubmitWithOrganization:
              "Author of this application is also allowed to submit: <1>{{author}}</1> ({{organization}}).",
            authorCanSubmit: "Author of this application is also allowed to submit: <1>{{author}}</1>.",
            assignees: "Assignee(s)",
            assigneeHelperText:
              "To assign collaborators, look for the grey header at the top of each requirement block and click 'Assign'.",
            noDesignatedSubmitters: "None assigned",
            assignedTo: "Assigned to",
            assigneeEmail: "Email:",
            removeCollaboratorModal: {
              triggerButton: "Remove collaborator",
              title: "Are you sure you want to remove this collaborator?",
              body: "This action cannot be undone.",
            },
          },
          popover: {
            triggerButton: "Assign ({{count}})",
            designatedSubmitterChangeButton: "Change",
            collaborations: {
              title: "Collaborators",
              assignButton: "Assign",
              unassignButton: "Unassign",
              unconfirmed: "Unconfirmed.",
              resendInvite: "Resend invite?",
              inEligibleForReInvite: "Ineligible for re-invite.",
            },
            assignment: {
              title: "Assign collaborator",
              noneAssigned: "None assigned",
              inviteWarning: {
                title: "Assign a collaborator?",
                body: "When you are inviting collaborators to participate in a building permit application through our system, it's important to understand the specific roles and permissions involved. Only the person who creates the permit application, referred to as the 'author,' has the ability to invite collaborators. These collaborators are then only able to access specific sections of the application—those that they are specifically assigned to. Importantly, while the author and one person they designate (Designated Submitter) can submit the completed application, all collaborators must have a verified Building Permit HUB account using BCeID to ensure security. Additionally, the author retains the exclusive right to remove or reassign collaborators. This ensures that control over the application remains centralized while still allowing for collaborative input where necessary.",
              },
              newContactButton: "New contact",
              noResultsText: {
                invitable: "No results found. Invite new collaborators by clicking the button above.",
                default: "No results found.",
              },

              unassiggn: "Unselect",
            },
            collaboratorInvite: {
              title: "New contact",
              inviteButton: "Invite collaborator",
            },
          },
        },
        permitProject: {
          pinProject: "Pin project",
          unpinProject: "Unpin project",
          formUpdateWarningTitle: "Form updated",
          backToProject: "Back to project",
          formUpdateWarningDescription:
            "The permit application form requirements have been updated. Review your draft application to confirm your responses.",
          rollupStatus: {
            all: "All statuses",
            empty: "Not started",
            new_draft: "Draft",
            newly_submitted: "Submitted",
            resubmitted: "Resubmitted",
            revisions_requested: "Revisions Requested",
          },
          index: {
            title: "Projects",
            pinnedPermitProjects: "Pinned projects",
            noPinnedProjects: "You have no pinned projects",
            pinnedPermitProjectsTbd: "Pinned projects TBD",
            allProjects: "All projects",
            requirementTemplateFilter: "Permit",
            noneFoundExplanation: "There are currently no permit projects matching your search criteria",
            empty: "You don't have any permit applications yet, please add permit applications to get started",
            staffError:
              "You must enable traning mode to access this page. Please see the switch in the navigation menu.",
          },
          overview: {
            title: "Overview",
            projectInformation: "Project information",
            editProjectInfo: "Edit",
            saveProjectInfo: "Save",
            cancelEditProjectInfo: "Cancel",
            currentAddress: "Current address: {{address}}",
            searchNewAddress: "Search for a new address or leave empty to keep current",
            address: "Address",
            clickToEditAddress: "Click to edit address",
            jurisdictionName: "Jurisdiction",
            notAvailable: "Not available",
            number: "Number",
            pid: "PID",
            parcelIdentifier: "Parcel identifier",
            checkPermitNeeds: "Check what's needed to apply for permits in this community",
            lookupStepCode: "Look up Energy Step Code and Zero Carbon Step Code requirements",
            recentPermits: "Recent permits",
            permit: "Permit",
            assignedTo: "Assigned to",
            permitApplicationNumber: "Application #",
            updatedAt: "Last modified",
            status: "Status",
            allPermits: "All permits",
          },
          permits: {
            title: "Permits",
          },
          back: "Back to my projects",
          addPermits: {
            title: "Add permits to your project",
            fn: "These are First Nations specific permits",
            sandboxWarning: "Training sandbox permits can only be added into your own jurisdiction's training sandbox",
            button: "Add permits",
            bcbcPartHeading: "BCBC Part",
            bcbcPart:
              "Right now, you can apply for permits for small-scale projects. This includes residential buildings, small structures, trades permits, and site work.",
            beforeYouBegin: {
              heading: "Before you begin",
              intro:
                "Building projects in BC must follow both provincial and local rules. Common requirements include:",
              bcBuildingCode: "BC Building Code",
              localZoningBylaws: "Local zoning bylaws",
              ocp: "Official community plans",
              dpaRules: "Development permit area rules",
              moreInfo: "For drawing standards and checklists, contact your local government.",
              findYourLocalJurisdiction: "Find your local jurisdiction",
            },
            about: {
              heading: "About this service",
              p1: "You can use this service to submit permit applications for your building project. The service runs some automated checks for completeness and accuracy, but it does not issue permits or guarantee approval.",
              p2: "After you apply, your local government will review your submission. They may ask for changes, more details, or proof of compliance before making a decision.",
            },
            projectInformation: {
              heading: "Project information",
              title: "Project name",
              address: "Address",
              pid: "PID",
              parcelIdentifier: "Parcel identifier",
            },
            permits: {
              heading: "Permits",
              title: "BCBC Part",
              workType: "Work type",
              energyStepRequired: "Energy step code required",
              zeroCarbonStepRequired: "Zero carbon step required",
            },
            addToProject: "Add to project",
          },
          details: {
            overview: "Overview",
            permits: "Permits",
            localResources: "Local Resources",
            notFound: "Permit project not found.",
            backToProjects: "Back to projects",
            editPermitProjectTitleHint: "Click to edit project name",
            invalidInput: "invalid input",
            editPermitProjectTitle: "Edit Project Name",
          },
          localResources: {
            title: "Local Resources",
            description:
              "Access planning documents, bylaws, and reference materials from {{jurisdictionName}} to help you prepare your permit application.",
            empty:
              "{{jurisdictionName}} has not yet added any local resources. Contact your local government for additional guidance.",
          },
          rollupStatusDescription: {
            empty: "No permits yet",
            inProgress: "{{remaining}} of {{total}} permit(s) remaining",
            submitted: "{{count}} permit(s) waiting for response",
            waitingOnYou: "{{count}} permit(s) returned for revision",
            approved: "All {{count}} permit(s) approved",
          },
          indexTitle: "My active projects",
          listTitle: "Permit projects",
          noneFound: "No projects yet",
          noneFoundExplanation: "There are currently no permit projects matching your search criteria",
          columns: {
            title: "Project name",
            location: "Location",
            description: "Description",
            number: "Application #",
            reference_number: "Reference #",
            permit_classification: "Types",
            submitter: "Submitter",
            submitted_at: "Submitted at",
            viewed_at: "Viewed at",
            status: "Status",
            rollup_status: "Status",
            created_at: "Created at",
            updated_at: "Last modified",
            forcasted_completion_date: "Forecasted",
          },
          name: "Project Name",
          description: "Description",
          fullAddress: "Full Address",
          pid: "PID",
          pin: "PIN",
          createSuccessTitle: "Project Created Successfully",
          createSuccessDescription: 'The project "{{name}}" has been created.',
          createErrorTitle: "Failed to Create Project",
          startNew: "Start new project",
          rollupStatusFilter: "Status",
          jurisdictionFilter: "Location",
          new: {
            title: "Create a new project",
            createButton: "Create project",
            nameHeading: "Name your project",
            nameDescription:
              "Give your project a name so it’s easy to find later. The name is private to you and anyone you invite to collaborate. For example: “My new house”, “1st Avenue laneway home”, or “Smith residence addition.”",
            nameLabel: "Project name",
            descriptionLabel: "Description",
            fullAddressHeading: "Enter your project location",
            jurisdictionTitle: "Jurisdiction",
          },
        },
        document: {
          index: {
            title: "Documents",
          },
        },
        permitApplication: {
          goToApplication: "Go to permit application",
          noneFound: "No permits yet",
          noneFoundExplanation:
            "Missing permits? You might have used a login option different from the one you used to create the permits. Log out and try logging back in with the BCeID or BC Services Card Account you used to create them.",
          submissionBlockModal: {
            title: "Trying to submit this application?",
            description:
              "Only the designated submitter or the author can submit this permit application. Please contact that person to continue.",
            designatedSubmitter: "Designated submitter",
            author: "Author",
          },
          browserSearch: {
            prompt: "Find specific form fields by using your web browser search: press keyboard shortcut",
            windows: "Windows: <1>Ctrl</1> + <1>F</1>",
            mac: "Mac: <1>Cmd</1> + <1>F</1> ",
          },
          statusFilter: "Status",
          submissionCollaboratorFilter: "Collaborator",
          updateToNewVersion: "Update my application",
          reviewOutdatedSubmissionLink: "View draft applications",
          configureStepCodePageLink: "Configure Step Code(s)",
          reviewUpdatedEditLink: "View template",
          reviewOutdatedTitle: "Filters applied to show applications that are outdated",
          reviewOutdatedMessage: "Filters have been applied. Please review and acknowledge the actions required below.",
          reviewCustomizedSubmissionLink: "View draft applications",
          reviewCustomizedTitle: "Filters applied to show applications that have new customizations added",
          reviewCustomizedMessage: "Filters have been applied. Please review the draft applications below.",
          newVersionPublished: "New version of template has been published - please review changes",
          card: {
            collaborateButton: "Collaborate",
            collaborationCalloutDraft:
              "<1>{{authorName}} has assigned you to this permit.</1> Collaborate on this permit application.",
            collaborationCalloutSubmitted: "<1>{{authorName}} assigned you to this permit.</1>",
          },
          referenceNumber: "Reference #",
          pdf: {
            for: "Permit application for",
            id: "Application ID",
            submissionDate: "Submission date",
            preparedBy: "Prepared by BC Building Permit Hub",
            applicant: "Applicant",
            jurisdiction: "Jurisdiction",
            page: "Page {{pageNumber}} / {{totalPages}}",
            fileNotAdded: "Not uploaded",
            permitType: "BCBC Part",
            contactInfo: "Contact information",
            applicantInfo: "Applicant contact details",
          },
          usePid: "Use '{{ inputValue }}' as PID",
          indexTitle: "My active permits",
          start: "Start a permit application",
          drafts: "Draft Permits",
          startedOn: "Started on",
          lastUpdated: "Last updated",
          viewedOn: "Viewed on",
          seeBestPractices_CTA: "See best practices",
          seeBestPractices_link:
            "https://www2.gov.bc.ca/gov/content/housing-tenancy/building-or-renovating/permits/building-permit-hub#practices",
          searchKnowledge_CTA: "Ask a question",
          searchKnowledge_link: "https://www2.gov.bc.ca/gov/content?id=A5A88A4CE1D54D95AB23D57858EF11EE",
          pidLabel: "Parcel Identification (PID) No.",
          addressLabel: "Address",
          viewed: "Viewed",
          notViewed: "New",
          newlyRevised: "Newly revised",
          status: {
            new_draft: "Draft",
            newly_submitted: "Submitted",
            resubmitted: "Resubmitted",
            revisions_requested: "Revisions Requested",
            ephemeral: "Preview",
          },
          statusGroup: {
            draft: "Draft permits",
            submitted: "Submitted permits",
          },
          columns: {
            number: "Application #",
            reference_number: "Reference #",
            permit_classification: "Types",
            submitter: "Submitter",
            submitted_at: "Submitted at",
            viewed_at: "Viewed at",
            status: "Status",
            created_at: "Created at",
            updated_at: "Updated at",
          },
          submissionInbox: {
            contactInviteWarning:
              "Please have a Review Manager setup the Submissions Inbox for all BCBC parts to allow submissions to be received.",
            title: "Submissions inbox",
            tableHeading: "Permit applications",
            submissionsSentTo:
              "A copy of all submitted applications are also sent to one or more email addresses configured by the review manager.",
          },
          fields: {
            number: "Application #",
            pin: "PIN",
            jurisdiction: "Jurisdiction",
          },
          filterMenu: {
            collaborating: "Collaborating",
          },
          new: {
            locationHeading: "Location for permit",
            submitToOwn:
              "Make sure you are submitting to a jurisdiction that you have inbox access to so that you can see it.",
            sandboxIdHeading: "Submit into Training sandbox",
            onlyHavePin: "I don't have a PID or address",
            dontHavePin: "Hide",
            selectSandboxLabel: "Select a training sandbox to submit into",
            firstNationsTitle: "First Nations",
            permitTypeHeading: "BCBC Part",
            workTypeHeading: "Work type",
            forFirstNations: "Is this permit application on <1>First Nation Registered Land</1>?",
            applicationDisclaimerInstruction:
              "Before you submit a building permit application, please ensure your proposed building siting and design complies with:",
            applicationDisclaimers: [
              { text: "provincial building code", href: "https://www.bccodes.ca/building-code.html" },
              {
                text: "local zoning bylaw",
                href: "https://www2.gov.bc.ca/gov/content/governments/local-governments/planning-land-use/land-use-regulation/zoning-bylaws",
              },
              {
                text: "official community plan regulations",
                href: "https://www2.gov.bc.ca/gov/content/governments/local-governments/planning-land-use/local-government-planning/official-community-plans",
              },
              {
                text: "applicable development permit areas",
                href: "https://www2.gov.bc.ca/gov/content/governments/local-governments/planning-land-use/land-use-regulation/development-permit-areas",
              },
              {
                text: "variances outlined in a local bylaw",
                href: "https://www2.gov.bc.ca/gov/content/governments/local-governments/planning-land-use/land-use-regulation/zoning-bylaws/board-of-variance",
              },
            ],
            applicationDisclaimerMoreInfo:
              "For more information and specific building drawing requirements and checklists, contact your local jurisdiction.",
            applicationDisclaimerMoreInfo_CTA: "Find your local jurisdiction",
            applicationDisclaimerMoreInfo_Link:
              "https://www2.gov.bc.ca/gov/content/governments/local-governments/facts-framework/local-government-maps",
            submitted: "Your application has been submitted!",
            hearBack: "Need Help?",
            contactInstruction:
              "You can log into the Building Permit Hub at any time to view a history of the applications you have submitted. Please contact the {{ jurisdictionName }} for questions related to your application.",
            whatsNextTitle: "What's next?",
            ready: "Ready to submit this application?",
            bySubmitting: "By submitting this application",
            confirmation:
              "You confirm that the information you provided was completed to the best of your knowledge and ability",
            yourReference: "For reference, your BC Building Permit Hub Application # is {{ number }}",
            noContactsAvailableTitle: "No template has been scheduled for this classification",
            noContactsAvailableDescription:
              "To start an application in Training mode, schedule a template for publishing for this classification.",
            whatsNext:
              "Upon receipt by the local jurisdiction, you will be notified via email or phone of any updates to your application's status or if additional documentation is required.",
            emailed:
              "A confirmation email has also been sent to the applicant and the {{ jurisdictionName }} building permit office",
            pinRequired: "PID not found or unavailable. Please optionally select a PIN and jurisdiction below:",
            pinVerified: "PIN is verified.",
            pinUnableToVerify: "Unable to verify PIN, please confirm and proceed as applicable.",
            needToKnow: "What you need to know",
            disclaimer1:
              "You can use this website to submit a permit application for your building project. This website checks if your application meets some codes, but approval isn't automatic.",
            disclaimer2:
              "After you've submitted your application, local officials will review it. They may ask you to fix issues or show that your application meets requirements before approving it.",
          },
          edit: {
            saveDraft: "Save and finish later",
            submit: "Submit application",
            permit: "Permit",
            fullAddress: "Full address",
            pidPin: "PID / PIN",
            clickToWriteNickname: "Click to write a nickname",
          },
          show: {
            wasSubmitted: "Application was submitted on {{ date }} to {{ jurisdictionName }}",
            submittingTo: {
              title: "You're applying to the {{ jurisdictionName }}",
              description:
                "Please verify that this building permit is in compliance with <1>local zoning bylaws</1> for this specific location.",
            },
            versionDiffContactWarning:
              "A new version of the permit is available. Please ask author or designated submitter to review and acknowledge changes to proceed.",
            contactsSummary: "Contacts summary",
            inboxDisabledTitle: "Inbox disabled",
            inboxDisabled:
              "Submissions for this local jurisdictions are currently disabled. You will be able to make edits to this permit application but will not be able to submit until this jurisdiction's is accepting submissions again and inboxes are enabled globally.",
            inboxDisabledTitleEarlyAccess: "Early Access – Submissions Not Yet Enabled",
            inboxDisabledEarlyAccess:
              "This permit is available for early access to help your team get familiar with the application process. You can view and edit your application, but submission is currently disabled. Submissions will be enabled once this permit classification is officially launched in your jurisdiction.",
            downloadApplication: "Download application",
            fetchingMissingPdf: "Fetching {{missingPdf}}...",
            missingPdfLabels: {
              permitApplication: "permit application pdf",
              stepCode: "step code checklist pdf",
            },
            contactSummaryHeading: "List of all contacts on this application",
            downloadHeading: "Download application",
            downloadPrompt: "Choose specific files or entire package:",
            downloadZip: "Download all attached files as ZIP",
            downloadForm: "Download application form",
            downloadStepCode: "Download step code checklist",
            requestRevisions: "Request revisions",
            viewRevisionRequests: "View revision requests",
            requestingRevisions: "Requesting revisions",
            requestedRevisions: "Requested revisions",
            retriggerWebhook: "Re-push to connected systems",
            retriggeringWebhook: "Re-pushing...",
            retriggerWebhookSuccess: "Re-push to connected systems successful",
            retriggerWebhookError: "Error re-pushing to connected systems",
            pleaseFix: "Please fix the requested revisions and re-submit your application",
            onlySpecified:
              "Only the the specified fields highlighted below (in yellow) and their corresponding blocks can be edited",
            showList: "Show list",
            hideList: "Hide list",
            locateRevisions: "Locate each requested revision by clicking the links below.",
            revisionsWereRequested: "Revisions to this application were requested on {{date}}",
            clickQuestion: "Click on the question(s) or requirement(s) you want the submitter to revise.",
            revision: {
              newRevision: "New revision",
              pastRequests: "Past submissions",
              reason: "Reason",
              reasonCode: "Reason code",
              revisionRequest: "Revision request",
              reasonFor: "Reason for revision",
              comment: "Comment (Optional)",
              useButton: "Use this reason",
              maxCharacters: "Maximum 350 characters",
              send: "Send to submitter",
              confirmHeader: "Send this list of revisions to the submitter?",
              originallySubmitted: "Previously submitted",
              confirmMessage: "The submitter will receive a notification end email about the changes you've requested.",
              designatedReviewerModal: {
                title: "Trying to send this revision request to the submitter?",
                body: "Only the designated reviewer can send this revision request back to the submitter. Contact that person to continue.",
                designatedReviewer: "Designated reviewer",
              },
            },
          },
        },
        sandbox: {
          disabledRow: "Disabled due to sandbox mismatch",
          formLabel: "Training sandbox",
          live: "Live (None)",
          disabledFor: "Disabled for training sandbox",
          inMode: "You're in training mode",
          scheduledModeDescription: "upcoming template sandbox",
          publishedModeDescription: "published template sandbox",
          disableJurisdictionSwitchTooltip: "Leave training mode before switching jurisdictions",
          switch: {
            label: "Training mode",
            title: "Enter training mode?",
            leaveTitle: "Leave training mode?",
            leaveWarning:
              "Save your work before leaving training mode. Any unsaved changes to permit applications or template customizations will not be kept.",
            warning:
              "Save your work before entering training mode. Any unsaved changes to permit applications or template customizations will not be kept.",
            warningTitle: "Unsaved changes will be lost",
            descriptionParagraph1:
              "Training mode lets you preview and test changes to your permit application forms without affecting live forms.",
            descriptionParagraph2:
              "You can see how your updates will appear to submitters, try out test permit applications, and publish your changes when you're ready.",
            leaveDescription: "You are about to leave training mode. Any unsaved changes will be lost.",
            liveDescription: "<strong>Live</strong>: No training sandbox. Submit directly to the live inbox.",
            continue: "Enter training mode",
            leave: "Leave training sandbox",
            superAdminAvailable: "Super Admin feature available!",
            testingPurposes: "For testing purposes, you may choose which permit applications to test.",
            trainOnUpcomingTemplates: "I want to see upcoming templates only",
          },
        },
        earlyAccessRequirementsLibrary: {
          index: {
            title: "Early access requirements library",
            description:
              "This displays all requirement blocks whose visibility has been set to 'preview only'. These blocks may not be used in any live drafts.",
            tableHeading: "Early access requirement blocks",
          },
        },
        requirementsLibrary: {
          hasDataValidation: "Has data validation",
          addAnother: "Add",
          addAnotherPerson: "Add another person",
          elective: "Elective",
          hasElective: "Has elective(s)",
          forFirstNations: "Intended for First Nations",
          hasConditionalLogic: "Has conditional logic",
          hasAutomatedCompliance: "Has automated compliance",
          inputNotSupported: "Input type not yet supported",
          associationsInfo: "Sections, tags, etc...",
          copyToEarlyAccess: {
            title: "Copy to early access",
            body: "Do you want to deuplicate this into an early access requirement block? <br /> <br /> <strong>Replace and duplicate with early access:</strong>",
            replaceButton: "Replace requirement block",
          },

          index: {
            title: "Requirements library",
            description: "List of all Requirement Blocks in the system that can be used inside Templates.",
            tableHeading: "Requirement blocks",
            createButton: "Create new requirement block",
          },
          fieldsDrawer: {
            formFields: "Form fields",
            useButton: "Use",
            dummyOption: "Option",
          },
          visibilityDescriptions: {
            any: "No restrictions on visibility.",
            live: "Can only be used in live templates only. Does not affect published templates.",
            earlyAccess:
              "Available to be used in early access preview templates only. Does not affect published templates",
          },
          visibility: {
            any: "Any",
            live: "Preview omitted",
            earlyAccess: "Preview only",
          },
          modals: {
            archived: "Archived",
            unlabeled: "Unlabeled",
            defaultContactLabel: "Contact",
            canAddMultipleContacts: "Submitter can add multiple contacts",
            addLabel: "Add label",
            displayDescriptionLabel: "Instruction/Description (public)",
            addDescriptionTrigger: "Add instructions/description for this block",
            visibilityLabel: "Visibility",
            cantEditHere: "Not currently editable here",
            changeVisibility: {
              fromEarlyAccessTitle: "Are you sure you want to promote this?",
              fromLiveTitle: "Are you sure you want to promote this?",

              confirmChangeBody1:
                "This is only possible if the block only currently exists in the correct corresponding in-progress template drafts and previews. Once changed, it will be in the corresponding library only",
              confirmChangeBody2:
                "Make sure you are ready to promote/demote this, any other previews or templates using this specific block will also reflect this change.",
              listItem1: "<strong>All</strong>: The requirement block may exist in any preview or template",
              listItem2:
                "<strong>Preview omitted</strong>: The requirement block may not exist in previews, and only in templates",
              listItem3:
                "<strong>Preview only</strong>: The requirement block may not exist in templates, and only in previews",
            },
            create: {
              triggerButton: "Create new requirement block",
              title: "New requirement block",
            },
            edit: {
              title: "Edit requirement block",
              options: "Options",
              copy: "Copy this block",
              visibilityTooltip:
                "Visibility determines if the block is restricted to live, early-access previews, or both",
              removeConfirmationModal: {
                title: "Confirm you want to archive this requirement block.",
                body: "Archiving this requirement blocks will remove it from all draft templates. This action cannot be undone.",
              },
            },
            clickToWriteDisplayName: "Click to write display name",
            clickToWriteDescription: "Click to write description",
            displayNameError: "Display name is required",
            clickToWriteNickname: "Click to write nickname",
            blockSetupTitle: "Block setup",
            internalUse: "For internal use only",
            configureFields: "Configure the form fields below that submitters will see:",
            noFormFieldsAdded: "No form fields have been added yet, start by clicking the Add button.",
            defaultRequirementLabel: "Label",
            addHelpText: "Add help text",
            addHelpTextLabel: "Help text",
            editHelpTextLabel: "Edit help text",
            helpTextPlaceHolder: "Help text",
            addInstructions: "Add Instructions",
            addInstructionsLabel: "Instructions",
            editInstructionsLabel: "Edit Instructions",
            optionalForSubmitters: "This field is optional for submitters",
            isAnElectiveField: "This is an elective field for local jurisdictions",
            allowMultipleFilesLabel: "Allow multiple files",
            optionsMenu: {
              triggerButton: "Options",
              remove: "Remove",
              conditionalLogic: "Conditional logic",
              automatedCompliance: "Automated compliance",
              dataValidation: "Data validation",
            },
            conditionalSetup: {
              ge: "Greater or equal to",
              le: "Less than or equal to",
              gt: "Greater than",
              lt: "Less than",
              ne: "Not equal to",
              when: "For question:",
              eq: "Equals",
              satisfies: "Submitter responds with:",
              then: "Then...",
              show: "Show this field",
              hide: "Hide this field",
            },
            dataValidationSetup: {
              valueMustBe: "Value must be:",
              greaterOrEqual: "Greater or equal to",
              lessOrEqual: "Less than or equal to",
              thisNumber: "this number",
              customErrorMessage: "Custom error message (Optional)",
              errorMessagePlaceholder: "Value must be greater than or equal to ...",
            },
            computedComplianceSetup: {
              module: "Module",
              valueExtractionField: "Value extraction field",
              optionsMapGrid: {
                title: "Options mapper",
                externalOption: "External option",
                requirementOption: "Requirement option",
              },
            },
            addOptionButton: "Add another option",
            templateEditWarning:
              "Any changes made here will be reflected in all unsaved preview drafts that use this requirement block.",
            previewEditWarning:
              "Any changes made here will be reflected in all in-progress template drafts that use this requirement block.",
            templates: "templates",
            previews: "previews",
            stepCodeDependencies: {
              energyStepCodeMethod: {
                tool: "Utilizing the digital step code tool",
                file: "By file upload",
                label: "Which method do you want to do use for the energy step code",
              },
              energyStepCodeToolPart9: {
                label:
                  "Please use this tool to do your fill in your step code details and it will populate onto the application.",
              },
              energyStepCodeToolPart3: {
                label:
                  "Please use this tool to do your fill in your step code details and it will populate onto the application.",
              },
              energyStepCodeReportFile: {
                label: "BC Energy Step Code Compliance Report",
              },
              energyStepCodeH2000File: {
                label: "Pre construction Hot2000 model details, Hot2000 report",
              },
            },
            architecturalDrawing: {
              dependencies: {
                method: {
                  label: "Which method do you want to use for the architectural drawing?",
                  tool: "Use the architectural drawing tool",
                  file: "Upload a file",
                },
                tool: {
                  label: "Open the architectural drawing tool",
                },
                file: {
                  label: "Architectural drawing file",
                },
              },
            },
          },
          fields: {
            name: "Name",
            firstNations: "First Nations",
            description: "Description",
            associations: "Associations",
            formFields: "Form Fields",
            updatedAt: "Updated at",
            requirementSku: "Requirement SKU",
            requirementDocuments: "Related documents",
          },
          configurationsColumn: "Configurations",
          fieldDescriptions: {
            description: "Provide some context for admins and managers for this fieldset.",
            associations: "Assign a tag to help organize and find this requirement block easier.",
            requirementSku: "Generated unique identifier",
          },
          requirementTypeLabels: {
            text: "Short text",
            checkbox: "Checkbox",
            address: "Address",
            bcaddress: "BC address",
            date: "Date",
            number: "Number",
            textArea: "Text area",
            radio: "Radio options",
            multiOptionSelect: "Multi-select checkboxes",
            select: "Single select dropdown",
            signature: "Signature",
            generalContact: "General contact",
            professionalContact: "Professional contact",
            file: "File upload",
            phone: "Phone",
            email: "E-mail",
            energyStepCode: "Energy Step Code Part 9",
            stepCodePackageFile: "Design package file for energy step code",
            pidInfo: "Pid Info",
            energyStepCodePart3: "Energy Step Code Part 3",
            energyStepCodePart9: "Energy Step Code Part 9",
            multiplySumGrid: "Grid (A × B with Total)",
            architecturalDrawing: "Architectural drawing",
          },
          multiplySumGrid: {
            title: "Grid (A × B with Total)",
            addHeaderPlaceholder: "Add header",
            itemPlaceholderSuffix: "(Item)",
            itemPlaceholder: "Item name",
            aPlaceholder: "Per item quantity",
            quantityB: "Quantity (B)",
            ab: "(A × B)",
            addRow: "Add row",
            energyStepCodePart9: "Energy Step Code Part 9",
          },
          contactFieldItemLabels: {
            firstName: "First name",
            lastName: "Last name",
            email: "Email",
            title: "Role/Position",
            phone: "Phone",
            address: "Address",
            organization: "Organization",
            businessName: "Business name",
            businessLicense: "Business license",
            professionalAssociation: "Professional association/organization",
            professionalNumber: "Professional number",
            contactType: "Contact type",
          },
          descriptionMaxLength: "(Max length: 250 characters)",
          unitLabels: {
            option: {
              noUnit: "(no unit)",
              mm: "mm - millimeters",
              cm: "cm - centimeters",
              m: "m - metres",
              in: "in - inches",
              ft: "ft - feet",
              mi: "mi - miles",
              sqm: "sqm - sq metres",
              sqft: "sqft - sq feet",
              cad: "$ - CAD",
            },
            display: {
              noUnit: "(no unit)",
              mm: "millimeters (mm)",
              cm: "centimeters (cm)",
              m: "metres (m)",
              in: "inches (in)",
              ft: "feet (ft)",
              mi: "miles (mi)",
              sqm: "sq metres (sqm)",
              sqft: "sq feet (sqft)",
              cad: "$ (CAD)",
            },
          },
        },
        formComponents: {
          energyStepCode: {
            edit: "View and edit compliance report",
            warningFileOutOfDate:
              "Plan file updated may be out of date as it differs from when the step code was created.",
          },
        },
        stepCode: {
          createButton: "Start now",
          types: {
            Part3StepCode: "BCBC Part 3",
            Part9StepCode: "BCBC Part 9",
          },
          index: {
            title: "Step Codes",
            createReportTitle: "Create a Step Codes compliance report for your project",
            createReportDescriptionPrefix:
              "Create a report that details a project's compliance with BC's Energy Step Code and Zero Carbon Step Code requirements. When a report is finished, you'll find it in",
            documentsLabel: "Documents",
            lookupTitle: "Look up local Step Codes requirements for your project",
            lookupDescriptionPrefix: "To check which Step Codes apply before generating a report,",
            lookupDescriptionLinkLabel: "look up Step Codes requirements for your project's jurisdiction",
            noReportAvailable: "No report generated yet",
          },
          shareReport: {
            action: "Share with jurisdiction",
            sharing: "Sharing...",
            success: "Report successfully shared with jurisdiction",
            error: "Failed to share report",
            errorDescription: "There was an error sharing the report. Please try again.",
          },

          noneFound: "No Step Codes found",
          columns: {
            project: "Project",
            type: "Type",
            fullAddress: "Address",
            updatedAt: "Last modified",
          },
          part3: {
            title: "Energy and Zero Carbon Step Codes for Step 3 Buildings",
            errorTitle: "There is a problem",
            cta: "Save and continue",
            sidebar: {
              responsiveButton: "Sections",
              overview: "Overview",
              start: "Start page",
              projectDetails: "Project details",
              locationDetails: "Building and location details",
              compliance: "Compliance",
              baselineOccupancies: "Occupancy classifications for buildings with a baseline",
              baselineDetails: "Baseline comparison details",
              districtEnergy: "District energy system",
              fuelTypes: "Fuel types",
              additionalFuelTypes: "Additional fuel types",
              baselinePerformance: "Baseline energy model performance",
              stepCodeOccupancies: "Occupancies subject to step 2, 3, or 4",
              stepCodePerformanceRequirements: "Performance requirements for step 2, 3, and 4 buildings",
              modelledOutputs: "Modelled outputs for entire building",
              renewableEnergy: "Renewable Energy",
              overheatingRequirements: "Overheating requirements",
              residentialAdjustments: "Residential project adjustments",
              documentReferences: "Document references",
              performanceCharacteristics: "Summary of building performance characteristics",
              hvac: "HVAC",
              results: "Results",
              contact: "Contact information",
              requirementsSummary: "Performance requriements summary",
              stepCodeSummary: "Step code summary",
            },
            startPage: {
              heading: "Energy and Zero Carbon Step Codes for Step 3 Buildings",
              description:
                "You can use this tool to generate a report about your project’s compliance. After you've submitted your application, local officials will review it. They may ask you to fix issues or show that your application meets requirements before approving it.",
              info: {
                title: "Before you start",
                body: "This form requires energy modelling results for your building. Before starting, use energy modelling software to model your building’s energy performance.",
                help: "More details can be found at <1>energystepcode.ca?<2></2></1>",
                link: "https://energystepcode.ca",
              },
              cta: "Create report",
            },
            projectDetails: {
              heading: "Project details",
              instructions:
                "Project details have been filled in from your Permit Application. Confirm the details below to continue.",
              name: "Project name",
              address: "Project address",
              postalCode: "Postal code",
              identifier: "Reference number",
              jurisdiction: "Jurisdiction",
              date: "Building permit date",
              stage: "Project stage",
              version: "Applicable version of the BC Building Code",
              confirm: "Does everything look correct?",
              cta: "Yes, continue",
              modify: "Incorrect or missing information? <1>Go back</1> to main application to fill in missing fields.",
              stages: {
                pre_construction: "Pre Construction",
                mid_construction: "Mid Construction",
                as_built: "As Built",
              },
              buildingCodeVersions: {
                BCBC_2024: "BCBC 2024",
                BCBC_2018_rev_5: "BCBC 2018 Revision 5",
                BCBC_2018_rev_4: "BCBC 2018 Revision 4",
                BCBC_2018_rev_3: "BCBC 2018 Revision 3",
                BCBC_2018_rev_2: "BCBC 2018 Revision 2",
                BCBC_2018_rev_1: "BCBC 2018 Revision 1",
              },
            },
            locationDetails: {
              heading: "Building and location details",
              errorDescription: "",
              instructions: "Set key parameters for your project.",
              aboveGradeStories: {
                label: "Number of above grade stories",
                hint: "Include half-storeys and relevant below-grade storeys",
                error: "Enter the number of above grade stories for this project.",
              },
              hdd: {
                label: "Heating degree days below 18°C",
                hint: "HDD is specified by the AHJ",
                error: "Enter the heating degree days below 18°C for this project.",
              },
              climateZone: {
                label: "Climate zone",
                error: "Select the climate zone for this project.",
              },
              climateZones: {
                zone_4: "Zone 4",
                zone_5: "Zone 5",
                zone_6: "Zone 6",
                zone_7a: "Zone 7A",
                zone_7b: "Zone 7B",
                zone_8: "Zone 8",
              },
            },
            baselineOccupancies: {
              heading: "Occupancy classifications for buildings with a baseline",
              instructions:
                "Building projects with occupancy classifications or uses subject to Step 2 (NECB Part 8) requirements as outlined in Table 10.2.3.3.-A to 10.2.3.3.-F or Subsection 10.2.2.1.(1)(a) or (b) of Division B of the BC Building Code must provide certain details to compare against a baseline energy model. <br/><br/> Note that this checklist is not intended to be used for buildings complying exclusively under Subsection 10.2.2.1.(1)(a) or (b) of Division B of the BC Building Code and the building must contain at least one Step Code occupancy or use as outlined in Table 10.2.3.3.-A to 10.2.3.3.-J of Division B of the BC Building Code.<br/><br/>These occupancy classifications are:<br /><br /><ul><li><strong>A1</strong> Assembly (viewing performing arts)</li><li><strong>A2</strong> Assembly (not elsewhere categorized)</li><li><strong>A3</strong> Assembly (arena)</li><li><strong>B1</strong> Detention</li><li><strong>B2</strong> Treatment</li><li><strong>B3</strong> Care</li><li><strong>F1</strong> High-hazard industrial</li><li><strong>F2</strong> Medium-hazard industrial</li><li><strong>F3</strong> Low-hazard industrial</li></ul>",
              isRelevant: "Does your project include any of the these occupancy classifications?",
              disabledCtaTooltip: "Please select an occupancy",
              occupancies: {
                label: "Which occupancy classifications apply to this building? Select all that apply:",
                error: "Select the occupancy classifications from the list that are in this building.",
              },
              occupancyKeys: {
                performing_arts_assembly: "<strong>A1</strong> Assembly (viewing performance arts)",
                other_assembly: "<strong>A2</strong> Assembly (not elsewhere categorized)",
                arena_assembly: "<strong>A3</strong> Assembly (arena)",
                open_air_assembly: "<strong>A4</strong> Assembly (occupants in open air)",
                detention: "<strong>B1</strong> Detention",
                treatment: "<strong>B2</strong> Treatment",
                care: "<strong>B3</strong> Care",
                high_hazard_industrial: "<strong>F1</strong> High-hazard industrial",
                medium_hazard_industrial: "<strong>F2</strong> Medium-hazard industrial",
                low_hazard_industrial: "<strong>F3</strong> Low-hazard industrial",
              },
            },
            baselineDetails: {
              heading: "Baseline comparison details",
              instructions:
                "Enter the baseline comparison details for each occupancy classification subject to Step 2 (NECB Part 8) requirements or Subsection 10.2.2.1.(1)(a) or (b) of Division B of the BC Building Code.",
              modelledFloorArea: {
                label: "What is the modelled floor area for {{occupancyName}} in square metres?",
                units: "m<sup>2</sup>",
                error: "Enter the modelled floor area for {{occupancyName}}.",
              },
              performanceRequirement: {
                label: "What is the performance requirement for {{occupancyName}}?",
                error: "Select the performance requirement for {{occupancyName}}.",
              },
              isCustomRequirement:
                "Does the authority having jurisdiction (AHJ) require higher performance than BC Building Code minimums for {{occupancyName}}?",
              requirementSource: {
                label: "What is the source of this performance requirement?",
                hint: "If this project’s authority having jurisdiction requires higher performance than BC minimums, enter the bylaw, policy, or document(s) that dictate this project’s energy requirements. ",
                error: "Enter the requirement source for {{occupancyName}}.",
              },
            },
            performanceRequirements: {
              step_2_necb: "Step 2 (NECB)",
              ashrae: "ASHRAE 90.1",
              "%_better_ashrae": "Percent (%) better than ASHRAE 90.1",
              necb: "NECB",
              "%_better_necb": "Percent (%) better than NECB",
            },
            baselineOccupancyKeys: {
              performing_arts_assembly: "A1 Assembly (viewing performance arts)",
              other_assembly: "A2 Assembly (not elsewhere categorized)",
              arena_assembly: "A3 Assembly (arena)",
              open_air_assembly: "A4 Assembly (occupants in open air)",
              detention: "B1 Detention",
              treatment: "B2 Treatment",
              care: "B3 Care",
              high_hazard_industrial: "F1 High-hazard industrial",
              medium_hazard_industrial: "F2 Medium-hazard industrial",
              low_hazard_industrial: "F3 Low-hazard industrial",
            },
            districtEnergy: {
              heading: "District energy system",
              isRelevant: "Is this project connected to a district energy system?",
              description: {
                label: "Name or description of district energy system",
                error: "Enter name or description of district energy system.",
              },
              emissionsFactor: {
                label: "Emissions factor (in kgCo<sub>2e</sub>/kWh)",
                hint: "The emissions factor for all systems or equipment powered by the system's energy",
                error: "Enter emissions factor.",
              },
              source: {
                label: "Reference for source of emissions factor value",
                hint: "Provide actual district energy system information, or details as indicated by applicable AHJ bylaw or policy",
                error: "Enter reference for source of emissions factor value.",
              },
            },
            fuelTypes: {
              heading: "Fuel types",
              instructions:
                "If your project uses fuel types other than electricity, natural gas, or district energy, you can provide details about them here.",
              isRelevant:
                "Does this project use any fuel types other than electricity, natural gas, or district energy?",
              fuelTypes: {
                label: "Fuel types used in this project other than electricity, natural gas, or district energy",
                error: "Select the fuel types from the list that are used by this building.",
              },
              fuelTypeKeys: {
                electricity: "Electricity",
                natural_gas: "Natural Gas",
                district_energy: "District Energy",
                propane: "Propane",
                light_fuel_oil: "Light fuel oil (standard)",
                heavy_fuel_oil: "Heavy fuel oil",
                diesel_fuel: "Diesel fuel (standard)",
                wood_fuel: "Wood fuel",
                other: "Other fuel type(s) not listed here",
              },
            },
            additionalFuelTypes: {
              heading: "Additional fuel types",
              instructions:
                "If your project uses other fuel types, you can enter them below. Any fuel types used that are not listed in the BC Building Code are to be discussed with the AHJ for approval.<br/><br/>For your reference, emissions factors for some fuels have been imported from <download>National Inventory Report 1990-2020: Greenhouse Gas Sources and Sinks in Canada – Part 2. En81-4- 2020-2-eng.pdf</download>",
              description: {
                label: "Fuel type",
                hint: "Enter only one fuel type, additional types can be added later",
                error: "Enter the fuel type description",
              },
              emissionsFactor: {
                label: "Emissions factor for this fuel type (in kgCO<sub>2e</sub>/kWh)",
                hint: "The emissions factor for all systems or equipment powered by the system's energy",
                error: "Enter the emissions factor for this fuel type",
              },
              source: {
                label: "Reference for source of emissions factor value",
                hint: "The name of the document where this emissions factor value was found",
                error: "Enter the reference source of the emissions factor value.",
              },
              addMore: {
                label: "Do you need to add any other fuel types?",
              },
            },
            baselinePerformance: {
              heading: "Baseline energy model performance",
              refAnnualThermalEnergyDemand: {
                label: "Total annual thermal energy use for baseline building",
                units: "kWh",
                hint: "Results for the baseline or reference building or building portion",
                error: "Enter the total annual thermal energy use for the baseline buidling",
              },
              refEnergyOutputs: {
                label: "In the table, enter the annual energy use for each fuel type",
                fuelType: "Fuel type",
                annualEnergy: "Annual energy (kWh)",
                emissionsFactor: "Emissions factor (kgCO<sub>2e</sub>/kWh)",
                emissions: "Emissions (kgCO<sub>2e</sub>)",
                totalAnnualEnergy: "Total annual energy",
                totalAnnualEmissions: "Total annual emissions",
                hint: "Need to change an emissions factor or add a fuel type? Go to <link>fuel types</link>",
              },
            },
            stepCodeOccupancies: {
              heading: "Occupancies subject to Steps 2, 3, or 4",
              instructions:
                "For occupancies subject to Steps 2, 3 or 4 as per Table 10.2.3.3.-G to Table 10.2.3.3.-J of Division B of the BC Building Code, this form will collect additional details.<br/><br/>These occupancies are:<ul><li>Group C Hotel and motel</li><li>Group C Other residential</li><li>Group D Office</li><li>Group D Other business and personal services occupancies</li><li>Group E Mercantile</li>",
              isRelevant: "Does your project include any of the these occupancies?",
              disabledCtaTooltip: "Please select an occupancy",
              cannotSelectNoWhenBaselineEmpty:
                "Please select at least one occupancy if no baseline occupancies are selected",
              occupancies: {
                label: "Which occupancies apply to this building? Select all that apply:",
                error: "Select the occupancies from the list that apply to this building.",
              },
              occupancyKeys: {
                hotel_motel: "<strong>Group C</strong> Hotel and motel",
                residential: "<strong>Group C</strong> Other residential",
                office: "<strong>Group D</strong> Office",
                other: "<strong>Group D</strong> Other business and personal services occupancies",
                mercantile: "<strong>Group E</strong> Mercantile",
              },
            },
            stepCodeOccupancyKeys: {
              hotel_motel: "Group C Hotel and motel",
              residential: "Group C Other residential",
              office: "Group D Office",
              other: "Group D Other business and personal services occupancies",
              mercantile: "Group E Mercantile",
            },
            stepCodePerformanceRequirements: {
              heading: "Performance requirements for Step 2, 3, and 4 Buildings",
              instructions:
                "If there are occupancies subject to Steps 2, 3, or 4 (not including Step 2 with a reference building as outlined in Tables 10.2.3.3.-A to 10.2.3.3.-F) in your project, this section will collect additional details.",
              stepCodeRequirement: {
                isCustom: {
                  label:
                    "Does the authority having jurisdiction require higher performance than BC building code minimums for {{occupancyName}}?",
                  hint: "Although this form is for Step Code compliance, some AHJs require higher performance than BCBC minimums",
                },
                energyStepRequired: {
                  label: "Energy step required",
                  error: "Select energy step required",
                },
                source: {
                  label: "What determines this performance requirement for {{occupancyName}}?",
                  hint: "Enter the bylaw, policy, rezoning condition, etc. from the authority having jurisdiction (AHJ)",
                  error: "Enter the performance requirement source",
                },
              },
              occupanciesTable: {
                headers: {
                  occupancy: "Occupancy",
                  modelledFloorArea: "Modelled floor area (m<sup>2</sup>)",
                  ghg: "GHG emissions level",
                },
                hint: "Need to add an occupancy or change the occupancies in this table? Go to <stepCodeOccupanciesLink>Occupancies subject to Steps 2, 3, or 4</stepCodeOccupanciesLink> and select the occupancies that apply.",
              },
              modelledFloorArea: {
                label: "What is the modelled floor area for {{occupancyName}} in square metres?",
                units: "m<sup>2</sup>",
                error: "Enter the modelled floor area",
              },
              zeroCarbonStepRequired: {
                error: "Select GHG emissions level",
              },
            },
            modelledOutputs: {
              heading: "Modelled outputs for entire building",
              description:
                "Enter the annual energy consumption by end use and fuel type in kWh. For end uses served by multiple fuels or fuel mixtures, enter as separate end uses. If you need additional use types, you can add additional rows to the table.",
              useInfoIconLabel: "Use info",
              infoDescriptions: {
                generalHeating:
                  "If project includes heating provided by multiple fuel types these must be entered separately in this section. This includes systems that use supplementary fuel sources\n\n(e.g. air source heat pump with auxiliary natural gas heating below a minimum ambient temperature)",
                domesticHotWater:
                  "If project includes DHW heating provided by multiple fuel types these must be entered separately in this section. This includes systems that use supplementary fuel sources\n\n(e.g. air source heat pump with auxiliary natural gas heating below a minimum ambient temperature)",
                totalAnnualEnergy:
                  "For Step 2 (NECB) compliance, please refer to cell B39 for the 'Total Energy Use' for the Reference Case. The 'Total Energy Use' of the Design Case is not to exceed the Reference Case.",
                wholeBuildingAnnualThermalEnergyDemand:
                  "Note this is total kWh, not kWh/m2; it is used to calculate TEDI along with the MFA.",
                wholeBuildingAnnualCoolingEnergyDemand:
                  "Note this is total kWh, not kWh/m2; it is used to calculate cooling energy demand intensity along with the MFA.\n\nThis is not a compliance metric and is used for information purposes only. The definition is the same as TEDI, but for cooling rather than heating.",
                stepCodeAnnualThermalEnergyDemand:
                  "Portions of building with TEDI requirements must comply with those targets prior to being averaged with non-Step Code building results.\n\nIf the building only contains Step 2 (NECB) occupancies (reported in Section B), this entry is not required.",
              },
              energyOutputsTable: {
                column: {
                  use: "Use",
                  annualEnergy: "Annual energy (kWh)",
                  fuelType: "Fuel type",
                  emissionsFactor: "Emissions factor (kgCO2e/kWh)",
                  emissions: "Emissions (kgCO2e)",
                },
                useTypes: {
                  interior_lighting: "Interior lighting",
                  exterior_lighting: "Exterior lighting",
                  heating_general: "Heating",
                  cooling: "Cooling",
                  pumps: "Pumps",
                  fans: "Fans",
                  domestic_hot_water: "Domestic hot water",
                  plug_loads: "Plug loads",
                  other: "Other",
                },
                fuelTypes: {
                  electricity: "Electricity",
                  natural_gas: "Natural gas",
                  district_energy: "District energy",
                  propane: "Propane",
                  light_fuel_oil: "Light fuel oil",
                  heavy_fuel_oil: "Heavy fuel oil",
                  diesel_fuel: "Diesel fuel",
                  wood_fuel: "Wood fuel",
                  other: "Other",
                },
                addUseType: "Add use type",
                totalByFuelType: "Total <1>{{fuelType}}</1>",
                totalByFuelTypeOther: "Total <1>{{fuelTypeDescription}}</1> (Other)",
                totalAnnualEnergy: "Total annual energy",
                totalEmissions: "Total annual emissions",
                fuelTypeRequired: "To add an energy use type, select a fuel type first.",
                fuelTypeClearHelpText: "To remove this energy use type entry, clear the fuel type.",
              },
              annualEnergyWholeBuildingTable: {
                tableHeader: "Annual energy for calculations (whole building)",
                annualThermalEnergyDemand: "Annual thermal energy demand for TEDI (kWh)",
                annualCoolingEnergyDemand: "Annual cooling energy demand for CEDI (kWh)",
              },
              stepCodeBuildingPortionsTable: {
                tableHeader: "Step code building portions",
                annualThermalEnergyDemand: "Annual thermal energy demand for TEDI",
                kwhM2: "(kWh/(m2⋅year))",
              },
            },
            renewableEnergy: {
              heading: "Renewable energy",
              isRelevant: "Does this project include on-site generated renewable electricity for compliance?",
              generatedElectricity: {
                label: "Total electricity generated on site (kWh)",
                error: "Enter eletricity generated on site.",
                units: "kWh",
              },
              percentOfUse: {
                label: "Percentage of total energy use",
                hint: "Automatically calculated",
                units: "%",
              },
              adjustedEF: {
                label: "Adjusted electricity emissions factor kgCO<sub>2e</sub>/kWh",
                hint: "Automatically calculated",
              },
            },
            overheatingRequirements: {
              heading: "Overheating requirements",
              isRelevant: "Is the project subject to overheating limits?",
              limit: {
                label: "Overheating hours limit",
                hint: "This value is set according to City of Vancouver Energy Modeling Guidelines, Section 4",
              },
              worstCase: {
                label: "Overheating hours for worst case suite/zone",
                error: "Enter overheating hours for worst case suite/zone",
              },
              compliance: {
                pass: "This building complies with overheating criteria. Worst case suite/zone overheating hours are below the limit.",
                fail: "This building does not comply with overheating criteria. Worst case suite/zone overheating hours are over the limit.",
              },
            },
            residentialAdjustments: {
              heading: "Residential project adjustments",
              hdd: {
                label: "Heating degree days",
                hint: "Provided during project set-up section",
              },
              pressurizedDoors: {
                label: "Number of suite doors pressurized",
                error: "Enter number of suite doors pressurized",
              },
              airflow: {
                label: "Airflow for pressurization per door (L/s/door)",
                error: "Enter airflow ",
              },
              area: {
                label: "Area of corridors pressurized (m<sup>2</sup>)",
                hint: "Provide only corridor area related to pressurizing corridors that lead to suites",
                units: "m<sup>2</sup>",
                error: "Enter area of corridors pressurized",
              },
              muaFuel: {
                label: "Make-up air fuel type",
                error: "Select make-up air fuel type",
                mixture: {
                  option: "Make-up air (MUA) fuel mixture",
                  fuelType: { label: "MUA fuel type", error: "Select MUA fuel type" },
                  emissionsFactor: "Emissions factor (kgCO<sub>2e</sub>/kWh)",
                  required: "Select MUA fuel mixture",
                  percentOfLoad: {
                    label: "% of annual load",
                    units: "%",
                    error: "Enter % of load",
                  },
                  totalPercentOfLoad: {
                    error: "Percent of load must add up to 100",
                  },
                  add: "Add line",
                },
              },
              suiteSubMetering: {
                isRelevant: {
                  label: "Is suite hydronic heating sub-metered?",
                  hint: "Select no if sub-metering is required per City of Vancouver Energy Modelling Guidelines Section 2.7",
                  error: "Select option",
                  options: {
                    yes: "Yes",
                    no: "No",
                    not_applicable: "Not applicable",
                  },
                },
                heatingEnergy: {
                  label: "Residential occupancies heating energy (kWh)",
                  hint: "The 15% adjustment per City of Vancouver Modelling Guidelines section 2.7 only applies to this portion of the heating energy and not the inputs for the whole building",
                  units: "kWh",
                  error: "Enter residential occupancies heating energy",
                },
              },
            },
            hvac: {
              heading: "HVAC",
              description:
                "Choose the most appropriate plant and system types for this project. If you don’t see a plant or system type that fits this project, you can select ‘Other’ to provide a short description.",
              heatingSystemPlant: {
                heading: "Heating plant",
                options: {
                  none: "None (no central plant)",
                  air_source_heat_pump: "Air source heat pump",
                  ground_source_heat_pump: "Ground source heat pump",
                  air_source_vrf: "Air source VRF",
                  ground_source_vrf: "Ground source VRF",
                  gas_boiler: "Gas boiler",
                  district_system: "District system",
                  other: "Other",
                },
              },
              heatingSystemType: {
                heading: "Heating system",
                options: {
                  electric_baseboard: "Electric baseboard",
                  hydronic_basebaord: "Hydronic baseboard",
                  hydronic_fan_coils: "Hydronic fan coils",
                  vav_reheat: "VAV reheat",
                  air_source_heat_pump: "Air source heat pump",
                  vrf_units: "VRF units",
                  radiant_floor_cooling: "Radiant floor/cooling",
                  gas_fired_rooftop: "Gas fired rooftop unit",
                  electric_resistance_rooftop: "Electric resistance rooftop unit",
                  heat_pump_rooftop: "Heat pump rooftop unit",
                  other: "Other",
                },
              },
              coolingSystemPlant: {
                heading: "Cooling plant",
                options: {
                  none: "None (no central plant)",
                  air_cooled_chiller: "Air cooled chiller",
                  water_cooled_chiller: "Water cooled chiller",
                  air_source_heat_pump: "Air source heat pump",
                  ground_source_heat_pump: "Ground source heat pump",
                  air_source_vrf: "Air source VRF",
                  ground_source_vrf: "Ground source VRF",
                  other: "Other",
                },
              },
              coolingSystemType: {
                heading: "Cooling system",
                options: {
                  ptac: "PTACs",
                  hydronic_fan_coils: "Hydronic fan coils",
                  hydronic_baseboards: "Hydronic baseboards",
                  vrf_units: "VRF units",
                  radiant_floor_ceiling: "Radiant floor/ceiling",
                  none: "None",
                  other: "Other",
                },
              },
              dhwSystemType: {
                heading: "DHW system",
                options: {
                  heat_pump_space_heating: "Heat pump integrated with space heating",
                  air_source_heat_pump: "Dedicated heat pump (air source)",
                  ground_source_heat_pump: "Dedicated heat pump (ground source)",
                  gas_space_heating: "Gas integrated with space heating",
                  gas: "Dedicated gas",
                  suite_electric: "Suite electric",
                  suite_gas: "Suite gas",
                  other: "Other",
                },
              },
            },
            performanceCharacteristics: {
              heading: "Summary of building performance characteristics",
              software: {
                label: "Software used to create energy modelling report for this project",
                error: "Select software used",
                options: {
                  ies_ve: "IES VE",
                  energy_plus: "EnergyPlus",
                  design_builder: "DesignBuilder",
                  open_studio: "OpenStudio",
                  e_quest: "eQuest",
                  doe_2_other: "DOE-2 Other",
                  phpp: "PHPP",
                  other: "Other",
                },
              },
              softwareName: {
                label: "Software Name",
                error: "Enter software name",
              },
              weatherFile: {
                label: "Name of simulation weather file",
                error: "Enter simulation weather file name",
              },
              ventilation: {
                label: "Is demand control ventilation used?",
                error: "Select option",
              },
              buildingCharacteristics: {
                description: "Description",
                value: "Value",
                result: "Result",
              },
              aboveGroundWallArea: {
                label: "Modelled above-ground wall area (m<sup>2</sup>)",
                error: "Enter above-ground wall area",
                hint: "Gross vertical façade area, includes glazed and opaque vertical surfaces.<br /><br />Report for spaces within MFA (e.g. if above-grade parkade, exlude those walls).",
              },
              vfar: { label: "Vertical facade-to-floor area ratio (VFAR)" },
              wwr: { label: "Window-to-wall area ratio (WWR)", units: "%", error: "Enter window-to-wall area ratio" },
              wfr: {
                label: "Window-to-floor area ratio (WFR)",
                hint: "Calculated value for informational purposes, based on MFA, WWR and wall area values entered.",
              },
              airtightness: {
                label: "Assumed design airtightness (L/S⋅m<sup>2</sup> @ 75 Pa)",
                error: "Enter design airtightness",
                hint: "This is the q75Pa described in CoV EMG v2 Section 2.4.1.",
              },
              infiltrationRate: {
                label: "Modelled infiltration rate (L/s/m<sup>2</sup> facade)",
                error: "Enter infiltration rate",
                hint: "This is the IAGW described in CoV EMG v2 Section 2.4.1",
              },
              wallClearField: {
                label: "Average wall clear field R-value (m<sup>2</sup>K/w)",
                error: "Enter average wall clear field R-value",
                hint: "Above grade walls only - includes uniformly distributed thermal bridges only.<br /><br />Report for spaces within MFA (e.g. if above-grade parkade, exlude those walls).",
                conversionUnits: "ft<sup>2</sup>hr°F/Btu",
              },
              wallEffectiveField: {
                label: "Average wall effective field R-value (m<sup>2</sup>K/w)",
                error: "Enter average wall effective field R-value",
                hint: "Above grade walls only - includes all thermal bridging.<br /><br />Report for spaces within MFA (e.g. if above-grade parkade, exlude those walls).",
              },
              roofClearField: {
                label: "Average roof clear field R-value (m<sup>2</sup>K/w)",
                error: "Enter average roof clear field R-value",
                hint: "Includes uniformly distributed thermal bridges only.",
                conversionUnits: "ft<sup>2</sup>hr°F/Btu",
              },
              roofEffectiveField: {
                label: "Average roof effective field R-value (m<sup>2</sup>K/w)",
                error: "Enter average roof effective field R-value",
                hint: "Includes all thermal bridging.",
              },
              windowEffective: {
                label: "Average window effective U-value (W/m<sup>2</sup>K)",
                hint: "Value should be area-weighted based on all windows on project.",
                error: "Enter average window effective U-value",
                conversionUnits: "Btu/ft<sup>2</sup>hr°F",
              },
              windowSolar: {
                label: "Average window solar heat gain coefficient",
                error: "Enter average window solar heat gain coefficient",
                hint: "Value should be area-weighted based on all windows on project.",
              },
              occupantDensity: {
                label: "Average occupant density (m<sup>2</sup>/person)",
                error: "Enter average occupant density",
                hint: "Use the MFA and the total building occupancy from energy model for spaces within the MFA.",
              },
              lightingDensity: {
                label: "Average lighting power density (W/m<sup>2</sup>)",
                error: "Enter average lighting power density",
                hint: "Use the total lighting power load, not considering operating schedules and control schemes, for spaces within the MFA (e.g. ignore parkade lighting) and the MFA.",
              },
              ventilationRate: {
                label: "Average ventilation rate (L/s/m<sup>2</sup>)",
                error: "Enter average ventilation rate",
                hint: "Use peak building ventilation, not considering operating schedules, servings spaces within the MFA, and the MFA.",
              },
              dhwSavings: {
                label: "Total building DHW low-flow savings (%)",
                error: "Enter total building DHW low-flow savings",
                hint: "% savings is intended to represent reduction over code minimum flow rates, if a rate below the peak hourly is being used, per CoV EMG v2 2.2.1.",
                units: "%",
              },
              hrvErvEfficiency: {
                label: "Average HRV/ERV sensible efficiency",
                error: "Enter average HRV/ERV sensible efficiency",
                hint: "Use SRE (sensible recovery efficiency) per CoV EMG v2 2.6.1.",
              },
            },
            metrics: {
              totalEnergy: { label: "Total energy", units: "kWh" },
              teui: { label: "TEUI", units: "kWh/m<sup>2</sup>/year" },
              tedi: { label: "TEDI", units: "kWh/m<sup>2</sup>/year" },
              ghgi: { label: "GHGI", units: "kgCO<sub>2</sub>/m<sup>2</sup>/year" },
            },
            requirementsSummary: {
              heading: "Performance requirements summary",
              missingInfo: {
                title: "You haven't entered any relevant performance details",
                message:
                  "Performance requirements will appear here after you have entered information in <baselineOccupanciesLink>Baseline energy performance requirements</baselineOccupanciesLink> and <stepCodeOccupanciesLink>Performance requirements for Step 2, 3, and 4 Buildings</stepCodeOccupanciesLink>.",
              },
              buildingType: {
                label: "Building type summary",
                hint: "A summary of your building determined by your responses ",
                options: {
                  stepCode: "Single-occupancy building with a Step 2, 3, or 4 occupancy class",
                  baseline: "Single-occupancy building with no Step 2, 3, or 4 occupancy classes",
                  mixedUse: "Mixed-use building",
                },
              },
              baselineRequirements: {
                title: "Baseline performance requirements results",
                hint: {
                  singleOccupancy:
                    "This value is calculated from inputs in <baselinePerformanceLink>Baseline energy performance requirements</baselinePerformanceLink>",
                  mixedUse:
                    "These values are calculated from inputs in <baselinePerformanceLink>Baseline energy performance requirements</baselinePerformanceLink><br /><br /><strong>Note:</strong> GHGI is to be reported in all cases, but will only be taken into account for compliance if GHGI is a requirements of the local government.",
                },
              },
              stepCodeRequirements: {
                title: "Step Code performance requirements results for Step 2, 3, and 4 Buildings",
                occupancy: "Occupancy classification",
                hint: "These values are calculated from inputs in <stepCodePerformanceLink>Performance requirements for Step 2, 3, and 4 Buildings</stepCodePerformanceLink><br /><br /><strong>Note:</strong> GHGI is to be reported in all cases, but will only be taken into account for compliance if GHGI is a requirements of the local government.",
              },
              residentialAdjustments: {
                title: "Residential project adjustments",
                wholeBuilding: { label: "Whole building adjustment", units: "kWh/m<sup>2</sup>/year" },
                stepCodePortion: { label: "Step Code portion adjustment", units: "kWh/m<sup>2</sup>/year" },
                hint: "Step Code portion adjustment is used in buildings where the Step Code portion of the building needs to meet TEDI on its own.",
              },
              wholeBuildingRequirements: {
                title: "Whole building performance requirements",
                hint: {
                  singleOccupancy:
                    "This value is calculated from inputs in <baselinePerformanceLink>Baseline energy performance requirements</baselinePerformanceLink> and <stepCodePerformanceLink>Performance requirements for Step 2, 3, and 4 Buildings</stepCodePerformanceLink><br /><br />Note: GHGI is to be reported in all cases, but will only be taken into account for compliance if GHGI is a requirements of the local government.<br /><br />Note: If the building has GHGI target as indicated in <stepCodePerformanceLink>Performance requirements for Step 2, 3, and 4 Buildings</stepCodePerformanceLink>, the value is determined as the area weighted average between the baseline/reference building GHGI from <baselinePerformanceLink>Baseline energy performance requirements</baselinePerformanceLink> and GHGI from <stepCodePerformanceLink>Performance requirements for Step 2, 3, and 4 Buildings</stepCodePerformanceLink> (if applicable)",
                  mixedUse:
                    "These values are calculated from inputs in <baselinePerformanceLink>Baseline energy performance requirements</baselinePerformanceLink> and <stepCodePerformanceLink>Performance requirements for Step 2, 3, and 4 Buildings</stepCodePerformanceLink><br /><br /><strong>Note:</strong> GHGI is to be reported in all cases, but will only be taken into account for compliance if GHGI is a requirements of the local government.<br /><br /><strong>Note:</strong> If the building has GHGI target as indicated in <stepCodePerformanceLink>Performance requirements for Step 2, 3, and 4 Buildings</stepCodePerformanceLink>, the value is determined as the area weighted average between the baseline/reference building GHGI from <baselinePerformanceLink>Baseline energy performance requirements</baselinePerformanceLink> and GHGI from <stepCodePerformanceLink>Performance requirements for Step 2, 3, and 4 Buildings</stepCodePerformanceLink> (if applicable)",
                },
              },
              confirm: { label: "Does everything look correct?", cta: "Yes, view summary" },
              help: "Incorrect or missing information? Go to the relevant section to make corrections.",
            },
            documentReferences: {
              heading: "Document references",
              documentTypes: {
                architectural_drawing: "Architectural drawing",
                mechanical_drawing: "Mechanical drawing",
                electrical_drawing: "Electrical drawing",
                other: "Other",
              },
              otherDocumentQuestion: "Do you need to add any other documents?",
              otherDocumentAnswers: {
                yes: "Yes",
                no: "No",
              },
              documentFields: {
                documentName: "Name of document(s)",
                issuedFor: "Issued for",
                documentTypeDescription: "Type of document",
                dateIssued: "Date issued",
                preparedBy: "Company name of preparer",
              },
            },
            completedByContact: {
              heading: "Contact information",
              description: "Enter contact information for the individual who completed this form.",
              disclaimer:
                "This form is not intended to be professionally sealed. The design professional responsible for energy modelling must document energy modelling information in an Energy Modelling Report as described by the Joint Architectural Institute of BC and Engineers and Geoscientists BC Professional Practice Guidelines – Whole Building Energy Modelling Services.",
              fields: {
                completedByName: "Name",
                completedByTitle: "Job title",
                completedByEmail: "Email",
                completedByOrganization: "Organization or company name",
                completedByPhoneNumber: "Phone",
              },
            },
            stepCodeSummary: {
              missingInfo: {
                title: "You haven't entered any relevant performance details",
                message:
                  "Performance requirements will appear here after you have entered information in <baselineOccupanciesLink>Baseline energy performance requirements</baselineOccupanciesLink> and <stepCodeOccupanciesLink>Performance requirements for Step 2, 3, and 4 Buildings</stepCodeOccupanciesLink>.",
              },
              stepCode: {
                heading: "Step Code summary",
                compliancePath: "BC Building Code Performance Compliance Path: ",
                stepCodeOccupancy: { label: "Step Code occupancy", mixedUse: "Refer to mixed-use section" },
                required: "Required",
                achieved: "Achieved",
                performanceRequirement: {
                  notAchieved: "Requirement not achieved",
                },
                energy: {
                  title: "Energy Step Code",
                  multiOccupancy:
                    "Project has multiple Step Code occupancies. Refer to “Summary for mixed-use buildings” for compliance results.",
                  stepRequired: "Step required",
                  achieved: "Step achieved",
                  notAchieved: "Step not achieved",
                  result: {
                    success: "Required step for Energy Step Code achieved",
                    failure: "Required step for Energy Step Code not achieved",
                  },
                },
                zeroCarbon: {
                  title: "Zero Carbon Step Code",
                  multiOccupancy:
                    "Project has multiple Step Code occupancies. Refer to “Summary for mixed-use buildings” for compliance results.",
                  levelRequired: "Level required",
                  required: "Required",
                  notRequired: "No Step Code requirement",
                  achieved: "Level achieved",
                  notAchieved: "Level not achieved",
                  result: {
                    success: "Required step for Zero Carbon Step Code achieved",
                    failure: "Required step for Zero Carbon Step Code not achieved",
                  },
                },
              },
              mixedUse: {
                heading: "Summary for mixed-use buildings",
                wholeBuilding: {
                  title: "Whole building requirements",
                  requirements: "Blended requirements",
                  performance: "Performance achieved",
                  compliance: "Does building comply?",
                },
                stepCode: {
                  title: "Step code requirements",
                  requirement: "TEDI requirement",
                  performance: "TEDI achieved",
                  compliance: "Does building comply?",
                },
                occupancies: {
                  title: "Step code occupancies",
                  occupancy: "Occupancy",
                  energy: "Energy requirement",
                  ghgi: "Zero Carbon requirement",
                },
              },
              cta: "Save and exit",
              standaloneCta: "Generate report",
            },
          },
          title: "Step code auto-compliance tool",
          subTitle:
            "You can use this tool to generate your BC Energy Step Code Compliance Report. Approval is not automatic. After you've submitted your application, local officials will review it. They may ask you to fix issues or show that your application meets requirements before approving it.",
          checklistGuide: "See checklist guide",
          helpLink: "https://www2.gov.bc.ca/gov/content?id=C4F8CA77AC5648CBB86948C1AEA58C8F",
          helpLinkText: "What does each step code level mean?",
          saveAndGoBack: "Save and go back",
          markAsComplete: "Mark as complete",
          back: "Go back",
          complete: "Complete",
          restart: {
            trigger: "Restart",
            confirm: {
              title: "Are you sure?",
              body: "Restarting will clear all checklist fields",
            },
          },
          info: {
            title: "BC Energy Compliance Reports",
            energy: "Energy Step Code",
            zeroCarbon: "Zero Carbon Step Code",
            performancePaths: {
              title: "For Performance Paths:",
              ers: "9.36.6. BC Energy Step Code ERS",
              necb: "9.36.6. BC Energy Step Code NECB",
              passive: "9.36.6. Passive House",
              stepCode: "9.36.5 BC Energy Step Code",
            },
            more: {
              prompt: "More details can be found at ",
              link: "energystepcode.ca",
            },
          },
          drawingsWarning: {
            title: "Before you start",
            description:
              "Please make sure you have finished uploading all your finalized drawings before generating the report. If you make changes to your uploaded drawings after import, you will need to go through this Step Code Auto-Compliance Tool again.",
          },
          import: {
            title: "Import",
            selectFile: "Select .h2k file",
            compliancePath: {
              label: "BC Building Code Performance Compliance Path:",
              select: "Select",
              options: {
                step_code_ers: "9.36.6 BC Energy Step Code ERS",
                step_code_necb: "9.36.6 BC Energy Step Code NECB",
                passive_house: "9.36.6 Passive House",
                step_code: "9.36.5 BC Energy Step Code",
              },
            },
            districtEnergyEF: "District energy EF",
            districtEnergyConsumption: "District energy consumption",
            otherGhgEf: "Other GHG EF",
            otherGhgConsumption: "Other GHG consumption",
            create: "Create",
            addData: "Add data",
          },
        },
        stepCodeChecklist: {
          pdf: {
            for: "Step code pre-construction checklist for",
            forPart3: "Part 3 Step code checklist for",
          },
          edit: {
            heading: "BC Step Code Compliance Checklist - Part 9 Buildings",
            notice: "Relevant data fields below has been filled in for you by Auto-Compliance.",
            energyStepNotMet:
              "Minimum energy step was not met. Please see <1>F: 9.36.6 Energy Step Code Compliance</1> for details.",
            zeroCarbonStepNotMet:
              "Minimum zero carbon step was not met. Please see <1>G: Zero Carbon Step Code Compliance</1> for details.",
            projectInfo: {
              stages: {
                pre_construction: "Pre Construction",
                mid_construction: "Mid Construction",
                as_built: "As Built",
              },
              heading: "A: Project Information",
              permitNum: "Permit reference number",
              builder: "Builder",
              address: "Project address",
              postalCode: "Postal code",
              jurisdiction: "Municipality / District",
              pid: "PID or legal description",
              buildingType: {
                label: "Building type",
                placeholder: "Select",
                options: {
                  laneway: "Laneway house",
                  single_detached: "Single detached",
                  double_detached: "Double/Semi-detached (non-MURB)",
                  row: "Row house (non-MURB)",
                  multi_plex: "Multi-plex (non-MURB)",
                  single_detached_with_suite: "Single detatched w/ secondary suite",
                  low_rise_murb: "Low-rise MURB",
                  stacked_duplex: "Stacked duplex (MURB)",
                  triplex: "Triplex (MURB)",
                  retail: "Retail",
                  other: "Other",
                },
              },
              select: "Select",
              dwellingUnits: "Number of dwelling units",
            },
            codeComplianceSummary: {
              heading: "B: Code Compliance Summary",
              required: "Required",
              achieved: "Achieved",
              notMet: "not achieved",
              stepRequirement: {
                heading: "Step Requirements",
                label: "Please select the energy and zero carbon step combination you are trying to achieve:",
                helpText:
                  "Please reference the <1>step code tool page<2></2></1> for more details and helpful information.",
              },
              compliancePath: {
                label: "BC Building Code Performance Compliance Path:",
                options: {
                  step_code_ers: "9.36.6 BC Energy Step Code ERS",
                  step_code_necb: "9.36.6 BC Energy Step Code NECB",
                  passive_house: "9.36.6 Passive House",
                  step_code: "9.36.5 BC Energy Step Code",
                },
              },
              energyStepRequired: "Energy step code required",
              zeroCarbonStepRequired: "Zero carbon step required",
              notRequired: "Not Required",
              energyStepCode: {
                heading: "Energy Step Code",
                stepRequired: "Step required",
                stepProposed: "Proposed step achieved",
                steps: {
                  null: "None",
                  "2": "2",
                  "3": "3",
                  "4": "4",
                  "5": "5",
                },
              },
              zeroCarbonStepCode: {
                heading: "Zero Carbon Step Code",
                stepRequired: "Level required",
                stepProposed: "Proposed step achieved",
                steps: {
                  null: "None",
                  "0": "None",
                  "1": "EL 1",
                  "2": "EL 2",
                  "3": "EL 3",
                  "4": "EL 4",
                },
              },
              planInfo: {
                title: "Based on info provided by the builder & the following drawings:",
                author: "Plan author",
                version: "Plan version",
                date: "Plan date",
              },
            },
            completedBy: {
              heading: "C: Completed By",
              description:
                "Energy advisors working in teams may designate a contact person for this permit.  This person may or may not be the modeler.  The registration numbers must match the actual modelers registration.",
              energyAdvisor: "Energy Advisor",
              name: "Full name",
              date: "Date",
              company: "Company name",
              organization: "Service organization",
              phone: "Phone",
              energyAdvisorId: "Energy advisor ID#",
              address: "Address",
              email: "Email",
              codeco: "CODECO placed in Field 8 of H2K",
              yes: "Yes",
              no: "No",
              pFile: "P File #",
            },
            buildingCharacteristicsSummary: {
              heading: "D: Building Characteristics Summary",
              details: "Details (assembly / system type / fuel type / etc.)",
              addLine: "Add line",
              averageRSI: "Average effective RSI",
              performanceValues: "Performance values",
              roofCeilings: "Roof / Ceilings",
              aboveGradeWalls: "Above grade walls",
              framings: "Rim Joists / floor headers and lintels",
              unheatedFloors: "Floors over unheated space",
              belowGradeWalls: "Walls below grade",
              slabs: "Slabs",
              windowsGlazedDoors: "Windows and glazed doors:",
              usi: "USI",
              u_imp: "U-Imp",
              shgc: "SHGC",
              doors: "Doors:",
              rsi: "RSI",
              airtightness: "Air barrier system & location:",
              ach: "ACH",
              nla: "NLA",
              nlr: "NLR",
              spaceHeatingCooling: "Space heating / cooling:",
              principal: "Principal:",
              secondary: "Secondary:",
              afue: "AFUE",
              hspf: "HSPF",
              sse: "SSE",
              cop: "COP",
              seer: "SEER",
              hotWater: "Domestic hot water:",
              percent_eff: "% EFF",
              uef: "UEF",
              ef: "EF",
              eer: "EER",
              ventilation: "Ventilation",
              litersPerSec: "L/s",
              other: "Other",
              fossilFuels: {
                label: "Fossil fuels",
                no: "The building including all units is designed with NO fossil fuel use or infrastructure",
                yes: "The building IS designed to use fossil fuels or has infrastructure for it",
                unknown: "Fossil fuel use and infrastructure is unknown at this time",
              },
            },
            energyPerformanceCompliance: {
              heading: "E: Energy Performance Compliance",
              proposedHouseEnergyConsumption: "Proposed house energy consumption:",
              referenceHouseRatedEnergyTarget: "Reference house rated energy target:",
              energyUnit: "GJ/year",
              hvac: "HVAC",
              dwhHeating: "DWH Heating",
              sum: "SUM",
              calculationAirtightness:
                "The airtightness value used in the energy model calculations for the Proposed house is:",
              calculationTestingTarget: "OR Testing Target",
              compliance: "The above calculation was performed in compliance with Subsection 9.36.5. of Division B",
              airtightnessValue: {
                select: "Select",
                options: {
                  two_point_five: "2.5 ACH",
                  three_point_two: "3.2 ACH",
                },
              },
              epcTestingTargetType: {
                select: "Select",
                options: {
                  ach: "ACH@50Pa",
                  nla: "NLA@10Pa",
                  nlr: "NLR L/s/m2",
                },
              },
            },
            energyStepCodeCompliance: {
              heading: "F: 9.36.6 Energy Step Code Compliance",
              proposedConsumption: "Proposed House Rated Energy Consumption",
              refConsumption: "Reference House Rated Energy Target",
              consumptionUnit: "GJ/year",
              proposedMetrics: "Proposed House Metrics",
              requirement: "Proposed Step Requirement",
              results: "Proposed House Results",
              passFail: "Proposed House Pass or Fail",
              step: "Step Code Level",
              meui: "Mechanical Energy Use Intensity (MEUI)",
              meuiUnits: {
                numerator: "kWh",
                denominator: "m²·yr",
              },
              max: "(max)",
              min: "(min)",
              meuiImprovement: "% Improvement",
              tedi: "Thermal Energy Demand Intensity (TEDI)",
              tediUnits: {
                numerator: "kWh",
                denominator: "m²·yr",
              },
              hlr: "% Heat Loss Reduction",
              ach: "Airtightness in Air Changes per Hour at 50 Pa differential",
              achUnits: {
                numerator: "ACH",
                denominator: "@50Pa",
              },
              nla: "Normalized Leakage Area (NLA₁₀)",
              nlaUnits: {
                numerator: "10 Pa",
                denominator: "cm²/m²",
              },
              nlr: "Normalized Leakage Rate (NLR₅₀)",
              nlrUnits: "L/s/m²",
              requirementsMet: "Step Code requirements met:",
              otherData: {
                header: "Other data",
                software: "Software used",
                softwareVersion: "Software version",
                heatedFloorArea: "Heated floor area",
                volume: "Building volume",
                surfaceArea: "Building surface area",
                fwdr: "FWDR",
                climateLocation: "Climate data (location)",
                hdd: "Degree Days Below 18°C (HDD)",
                spaceCooled: "% Of Space Cooled",
              },
            },
            zeroCarbonStepCodeCompliance: {
              heading: "G: Zero Carbon Step Code Compliance",
              proposedMetrics: "Proposed House Metrics",
              stepRequirement: "Proposed Step Requirement",
              result: "Proposed House Result",
              passFail: "Proposed House Pass or Fail",
              step: "Zero Carbon Step Code Level",
              max: "Max",
              min: "Min",
              ghg: {
                label: "Total GHG",
                units: {
                  numerator: "kg CO₂ₑ",
                  denominator: "yr",
                },
              },
              co2: {
                title: "CO₂ₑ per floor area with max:",
                perFloorArea: {
                  label: "CO₂ₑ per floor area",
                  units: {
                    numerator: "kg CO₂ₑ",
                    denominator: "m²·yr",
                  },
                },
                max: {
                  label: "CO₂ₑ max",
                  units: "kg CO₂ₑ",
                },
              },
              prescriptive: {
                title: "Prescriptive:",
                heating: "Heating",
                hotWater: "Hot water",
                other: "All building systems, equipment, and appliances",
                zero_carbon: "zero carbon",
                carbon: "carbon",
              },
              requirementsMet: "Target reached:",
            },
            complianceGrid: {
              requirementsMetTag: {
                pass: "Pass",
                fail: "Fail",
              },
            },
          },
        },
        resource: {
          fileRemovedDescription: "This file was removed after a routine scan and can't be opened.",
        },
        home: {
          jurisdictionsTitle: "Jurisdictions",
          projectReadinessTools: {
            title: "Tools",
            stepCodeLookupTool: {
              title: "Where are you building?",
              description: "Enter an address to check service availability and local requirements including Step Codes",
              cantFindAddress: "Can't find your address?",
              browseJurisdictions: "Browse list of jurisdictions",
              checkWhatIsNeededToApplyForPermitsInThisCommunity:
                "Check what's needed to apply for permits in this community",
              startAPermitApplication: "Start a permit application",
              projectsNew: "Start a new project",
              lookUpEnergyStepCodeAndZeroCarbonStepCodeRequirements:
                "Look up Energy Step Code and Zero Carbon Step Code requirements",
              notAcceptingPermitApplications: "Not currently accepting permit applications through Building Permit Hub",
              permitInformationForThisCommunityIsntAvailable:
                "Permit information for this community isn’t available: check with the local government to learn how to apply",
            },
            pageHeading: "Prepare and check your project documents",
            pageDescription: "Use these tools to help prepare a complete and compliant permit application",
            checkYourProject: "Check your project against Provincial regulations",
            prepareYourApplication: "Prepare your application package for submission",
            checkYourProjectAgainstProvincialRegulations: "Check your project against Provincial regulations",
            lookUpStepCodesRequirementsForYourProject: "Look up Step Codes requirements for your project",
            lookUpToolProjectDescription:
              "Enter an address to find the Energy and Zero Carbon Step Code requirements for your project",
            checkIfYourProjectMeetsBCsStepCodesRequirements: "Check if your project meets BC's Step Codes requirements",
            generateAReportThatDetailsAProjectsComplianceWithBCsEnergyStepCodeAndZeroCarbonStepCodeRequirements:
              "Generate a report that details a project's compliance with BC's Energy Step Code and Zero Carbon Step Code requirements",
            letterOfAssuranceLink: "Create your Letters of Assurance",
            letterOfAssuranceDescription:
              "Complete Letters of Assurance to confirm who is professionally responsible for design and field review on your project, as required by the BC Building Code for some building types",
            letterOfAssurancePage: {
              createYourLOAsTitle: "Create your Letters of Assurance",
              createYourLOAsIntro:
                "Some building permit applications need Letters of Assurance (LOAs). Letters of Assurance are legal documents that clearly identify the responsibilities of architects, engineers and other registered professionals when designing building components and reviewing them in the field.",
              createYourLOAsInstructions: "Registered professionals can use the forms on this page to:",
              createYourLOAsInstructionFill: "Fill out Letters of Assurance for your project",
              whoThisIsForTitle: "Who this is for",
              whoThisIsForDescription:
                "If your project requires Letters of Assurance, each registered professional involved must sign and seal their form as part of the building permit process.",
              whoThisIsForMayNeed: "You may need Letters of Assurance if your project:",
              whoThisIsForComplex: "is a complex building (usually Part 3 of the Building Code)",
              whoThisIsForSimpler:
                "is a simpler building (Part 9 of the Building Code) where Letters of Assurance are required by your local government",
              whoThisIsForInvolves: "involves registered professionals like architects or engineers",
              whoThisIsForCheckWithLG:
                "Check with your local government to find out if LOAs are required for your project. You can also read the <1>Letters of Assurance guide for BC Building Code 2018 and Vancouver Building By-law 2019 (PDF, 526 KB)</1> for more information.",
              whenToSubmitTitle: "When to submit Letters of Assurance",
              whenToSubmitDescription:
                "Only submit Letters of Assurance if your project needs them under the Building Code or local bylaws.",
              whenToSubmitIfRequired: "If required, submit these forms when you apply for your building permit:",
              whenToSubmitScheduleA:
                "<strong>Schedule A:</strong> signed by the owner and a Coordinating Registered Professional (usually the architect)",
              whenToSubmitScheduleB:
                "<strong>Schedule B:</strong> one form for each professional (like a structural or mechanical engineer) taking responsibility for a part of the project",
              whenToSubmitNotEvery:
                "Not every project needs all types of Schedule B. Your coordinating professional decides which are needed.",
              whenToSubmitBeforeOccupy:
                "Before you can occupy the building, additional Letters of Assurance are required:",
              whenToSubmitScheduleCA:
                "<strong>Schedule C-A:</strong> submitted by the coordinating professional to confirm everything meets the Building Code",
              whenToSubmitScheduleCB:
                "<strong>Schedule C-B:</strong> submitted by each professional who submitted a Schedule B earlier",
              whatLOAsCoverTitle: "What Letters of Assurance cover",
              whatLOAsCoverDescription:
                "Each registered professional takes responsibility for a specific part of the project. For example:",
              whatLOAsCoverArchitect: "<strong>Architect:</strong> overall design and coordination",
              whatLOAsCoverStructural: "<strong>Structural engineer:</strong> the frame and foundation",
              whatLOAsCoverMechanical:
                "<strong>Mechanical engineer:</strong> heating, ventilation, and air conditioning (HVAC)",
              whatLOAsCoverPlumbing: "<strong>Plumbing engineer or plumber:</strong> water and drainage systems",
              whatLOAsCoverFire: "<strong>Fire suppression engineer:</strong> sprinklers or other systems (if needed)",
              whatLOAsCoverGeotechnical: "<strong>Geotechnical engineer:</strong> ground stability and excavation",
              whatLOAsCoverIfThree:
                "If there are 3 or more professionals involved, you'll also need a Coordinating Registered Professional to oversee the design and field reviews.",
              fillableLettersOfAssurance: "Fillable Letters of Assurance",
              scheduleAFileLink: "Schedule A (PDF, 361 KB)",
              scheduleADescription:
                "Confirms that a Coordinating Registered Professional like an architect or engineer has been hired by the building owner. Submit as part of a building permit application.",
              scheduleBFileLink: "Schedule B (PDF, 587 KB)",
              scheduleBDescription:
                "Confirms that a Registered Professional of Record takes responsibility for certain building components and applicable field reviews. Submit before construction begins on each building component.",
              scheduleCAFileLink: "Schedule C-A (PDF, 260 KB)",
              scheduleCADescription:
                "Confirms the Coordinating Registered Professional fulfilled their obligations under Schedule A. Submit after project completion, but before an occupancy permit or final inspection.",
              scheduleCBFileLink: "Schedule C-B (PDF, 259 KB)",
              scheduleCBDescription:
                "Confirms the Registered Professional of Record fulfilled their obligations under Schedule B. Submit after project completion, but before an occupancy permit or final inspection.",
              previousLettersOfAssuranceTitle: "Previous Letters of Assurance",
              previousLettersOfAssuranceDescription:
                "For projects that were permitted prior to March 8, 2024 you can find Letters of Assurance on the BC Codes website:",
              previousLettersOfAssuranceLink: "Projects December 11, 2018 to March 8, 2024",
              previousLettersOfAssuranceLink2: "Projects December 20, 2012 to December 10, 2018",
              pageTitle: "",
              loaResponsibilities: {
                buildingDesign:
                  "Building design – architect responsible for the overall building design and coordination.",
                structural: "Structural– engineer designs the building\'s frame and foundation.",
                mechanical: "Mechanical– engineer designs heating, ventilation, and air conditioning (HVAC).",
                plumbing: "Plumbing – engineer or plumber designs water and drainage systems.",
                fireSuppression: "Fire suppression systems – engineer designs systems like sprinklers (if required).",
                geotechnical:
                  "Geotechnical - engineer reviews ground and slope stability for excavation, foundation, temporary retaining systems during constructions and finished building.",
              },
            },
            lookUpStepCodesRequirementsForYourProjectScreen: {
              title: "Look up Step Codes requirements for your project",
              jurisdiction: "Jurisdiction",
              addressSearched: "Address Searched",
              description:
                "The BC Energy Step Code and Zero Carbon Step Code set performance targets for new buildings. The Province sets minimum requirements for energy efficiency. Local governments and First Nations can choose to require higher steps.",
              enterYourProjectAddress:
                "Enter your project address to look up the applicable Energy and Zero Carbon Step Code requirements.",
              checkAddress: "Check address",
              cantFindYourAddress: "Can't find your address?",
              browseListOfJurisdictions: "Browse list of jurisdictions",
              generateAStepCodesReport: "Generate a Step Codes report",
              ifYoureReadyToCreateA:
                "If you're ready to create a Step Codes report to include in an application package, you can create a report using the separate reporting tool.",
              checkIfYourProjectMeetsBCsStepCodesRequirements: "Create a Step Codes compliance report for your project",
              stepCodeRequirementsFor: "Step Code Requirements for",
              checkAnotherAddress: "Check another address",
              startPermitApplication: "Start a permit application",
              generateStepCodesReport: "Generate Step Codes report",
              generateStepCodesReportDescription:
                "If you're ready to create a Step Codes report to include in an application package, you can create a report using the separate reporting tool.",
              stepCodeRequirementsDescription:
                "This page shows which Energy and Zero Carbon Step Codes apply to new buildings in this community. Requirements may vary based on building type, occupancies, and local bylaws.",
            },
          },
          joinTheBuildingPermitHub: {
            title: "Join Building Permit Hub",
            subtitle: "A voluntary permitting platform built with BC communities, for BC communities",
            about: {
              title: "About Building Permit Hub",
              description:
                "Building Permit Hub is designed to make building permitting faster and easier for everyone:",
              audiences: {
                localGovernments: "Local governments",
                builders: "Builders",
                homeowners: "Homeowners",
                anyone: "Anyone applying for a permit",
              },
              freeAndVoluntary:
                "Building Permit Hub is free and voluntary. It supports local government processes, from property identification through to permit approval.",
              workingTo: "We're working to:",
              goals: {
                speedUp: "Speed up housing approvals",
                support: "Support your existing workflows",
                reduce: "Reduce duplication and delays",
              },
              flexible:
                "Because every community is different, Building Permit Hub is designed to be flexible. You can use only the features that suit your team, whether you're digital, hybrid, or paper-based.",
            },
            availableFeatures: {
              title: "Available features",
              description: "Building Permit Hub is live and ready for use.",
              features: {
                title: "Current features include:",
                permitApplications: "Permit applications for small-scale multi-unit housing classifications",
                automatedStepCodes: "Automated Step Codes compliance tools for Part 3 & Part 9 buildings",
                collaborativeWorkflows: "Collaborative workflows for application submission and review",
                customizablePermits: "Customizable permits tailored to your bylaws",
                resubmissionTools: "Resubmission and revision tools",
              },
            },
            coDeveloped: {
              title: "Co-developed with BC communities",
              description:
                "Building Permit Hub is being built in partnership with local governments, First Nations, and industry. Your feedback helps shape what we build next.",
              recentFeatures: {
                title: "Recent features based on community input:",
                multipleFiles: "Support for uploading multiple files",
                maliciousFiles: "Scanning for malicious files",
                collaborationTools: "Collaboration tools for reviewing and tracking submissions",
              },
            },
            newFeatures: {
              title: "New features in development",
              description: "Over the next 6 to 7 months, we're building:",
              features: {
                permitProjectFolders: {
                  title: "Permit project folders",
                  description: "Group related permits for phased or complex builds.",
                },
                preApplicationTools: {
                  title: "Pre-application tools",
                  description: "Use calculators and other tools before starting a permit form.",
                },
                uploadDocuments: {
                  title: "Upload documents outside of application forms",
                  description: "Attach supporting documents that aren't tied to a specific form field.",
                },
                standardHousing: {
                  title: "Standard housing design catalogues",
                  description: "Reduce review time and support consistent approvals.",
                },
                crossJurisdiction: {
                  title: "Cross-jurisdiction dashboards",
                  description: "Give builders and staff a single view of activity across multiple communities.",
                },
                realTimeStatus: {
                  title: "Real-time status updates",
                  description: "Help staff and applicants track permit progress as it happens.",
                },
              },
            },
            flexibleUse: {
              title: "Flexible use and adoption",
              description:
                "You can adopt just the Building Permit Hub features that support your current systems. For example:",
              examples: {
                stepCode: "Receive Step Code compliance reports without changing your workflows",
                newFeatures: "Adopt new features like document upload or project folders as they become available",
                preApplication: "Give builders access to pre-application tools without changing how permits are issued",
              },
              note: "Building Permit Hub is designed to meet most jurisdictions' needs without replacing what already works.",
            },
            integration: {
              title: "Integration with your existing systems",
              description:
                "We're building tools to support integration with common systems such as Tempest and CityView.",
              includes: "This includes:",
              features: {
                openApi: "Open API for permit submissions",
                automaticTransfer: "Automatic transfer of applications into your permitting system",
                comingSoon:
                  "(Coming soon) Sending status updates from your system back to the Hub for applicants to view",
              },
            },
            howToJoin: {
              title: "How to join",
              step1: {
                title: "Step 1: Connect with our team",
                description:
                  "Tell us about your current process and what you're looking for by emailing our team: <mailTo>{{email}}</mailTo>",
                email: "digital.codes.permits@gov.bc.ca",
                emailText: "digital.codes.permits@gov.bc.ca",
              },
              step2: {
                title: "Step 2: Start onboarding",
                description: "We'll support you through readiness, setup, and rollout. Go at your own pace.",
              },
            },
            learnMore: {
              title: "Learn more about Building Permit Hub",
              description:
                "We're available to help you explore how Building Permit Hub might work in your community. We can:",
              options: {
                liveOnboarding: "Provide a live onboarding session",
                liveDemo: "Walk you through a live demo",
                technicalQuestions: "Answer technical questions",
                share: "Share what other communities have done",
              },
              contact: "You can reach our team by sending an email to <mailTo>{{email}}</mailTo>",
              email: "digital.codes.permits@gov.bc.ca",
              emailText: "digital.codes.permits@gov.bc.ca",
            },
          },
          siteConfigurationTitle: "Configuration management",
          jurisdictionsDescription:
            "Administer Review Managers and their roles within local jurisdictions through the Building Permit Hub. This includes inviting or removing managers, managing overall jurisdictions, customizing community pages, and handling jurisdiction-specific settings.",
          permitTemplateCatalogueTitle: "Permit templates catalogue",
          reportingTitle: "Reporting",
          reportingDescription:
            "Explore reports and analytics to gain insights and make informed decisions about your permit applications",
          permitTemplateCatalogueDescription:
            "Develop and publish a collection of permit templates that provide a standardized foundation for building permits across local jurisdictions. These templates include requirement blocks to establish a structured flow for the building permit template.",
          requirementsLibraryTitle: "Requirements library",
          requirementsLibraryDescription:
            "Construct and maintain requirement blocks that form the core structure of permit templates. This library allows you to create, update, and manage the questions that define each requirement block.",
          earlyAccess: {
            title: "Early Access",
            adminDescription:
              "Access and manage Early access previews and requirement sets before they become publicly available.",
            previews: {
              title: "Early access previews",
              description:
                "View and manage non-submittable permit templates in Early Access, shared with selected users for service design purposes.",
            },
            requirements: {
              title: "Early access requirements",
              description:
                "Explore and manage pre-release requirement blocks sets designed for testing within Early Access projects.",
            },
          },
          configurationManagement: {
            title: "Configuration",
            reviewManagerDescription:
              "Set up your submission inbox, define Step Codes, configure features, and edit the 'About' page to reflect specific local information",
            adminDescription: "Manage system-wide settings, notifications, and administrative access",
            jurisdictionLocalityTypeLabel: "Locality type of local jurisdiction",
            jurisdictionNameLabel: "Name of local jurisdiction",
            jurisdictionLocationLabel: "Location",
            users: {
              title: "Users",
              description: "Manage and invite reviewers and other staff for this jurisdiciton",
            },
            submissionsInboxSetup: {
              title: "Submissions inbox setup",
              description: "Specify email addresses that should receive applications",
              inboxEnabled: "Enable inbox",
              emailLabel: "to recipient email(s)",
              addEmail: "Add another email",
              confirmationRequired: "Action required: please click link in verification email",
            },
            stepCodeRequirements: {
              title: "Energy Step Code configuration",
              description: "Define step code configuration values for your jurisdiction",
              setMinimum:
                "Set the minimum acceptable levels of Energy Step Code and Zero Carbon Step Code for BCBC part 9 buildings below:",
              part9Tab: "Part 9",
              part3Tab: "Part 3",
              part3SetMinimum:
                "Set the heating degree days below 18°C for BCBC part 3 buildings. This value is used to determine climate zone requirements:",
              heatingDegreeDays: {
                label: "Heating degree days below 18°C",
              },
              part9Building: "Part 9 Building",
              addStep: "Add another requirement combination",
              deleteCustomization: "Delete customization",
              overriddenWarning: "This was overridden by your customized requirements below.",
              notRequired: "Not required",
              stepRequired: {
                permitTypeHeading: "BCBC part",
                standardToPass: "Standard Step Code compliance to pass",
                customizedMinimum: "Customized minimum requirement for submission",
                energy: {
                  title: "Energy Step Code Level",
                  options: {
                    null: "Not required",
                    "2": "2",
                    "3": "3",
                    "4": "4",
                    "5": "5",
                  },
                },
                zeroCarbon: {
                  title: "Zero Carbon Step Code Level",
                  options: {
                    null: "Not required",
                    "0": "Not required",
                    "1": "EL 1 - Measure Only",
                    "2": "EL 2 - Moderate",
                    "3": "EL 3 - Strong",
                    "4": "EL 4 - Zero Carbon",
                  },
                },
              },
            },
            globalFeatureAccess: {
              title: "Global feature access",
              description: "Turn system features on or off for all users system-wide.",
              submissionInbox: "Submissions inbox",
              submissionInboxDescription:
                "Enable review managers to accept and process permit applications. If you turn off this feature, submitters can't submit applications, and review managers won't receive new applications.",
              toggleOn: "On",
              toggleOff: "Off",
              acceptPermitApplications: "Accept permit applications",
              switchButtonInstructions:
                "Turning this on lets users submit applications. The email addresses set in this section will receive submitted applications",
            },
            featureAccess: {
              title: "Feature access and settings",
              description: "Turn features on or off for all users in your jurisdiction",
              submissionInbox: "Submissions inbox setup",
              submissionInboxDescription: "Specify where submitted permit applications should be sent",
              myJurisdictionAboutPage: "My Jurisdiction's About page",
              myJurisdictionAboutPageDescription:
                "Show a custom About page on Building Permit Hub with information specific to your jurisdiction's requirements, contact information, or common issues to watch for.<br> Only turn this page on after you've added your content. If it's turned on without custom content, the page will appear blank.<br> <1> Edit your jurisdiction's About page content",
              myJurisdictionAboutPageEdit: "Edit",
              designatedReviewer: "Limit who can request revisions from submitters",
              editJurisdictionAboutPage: "Edit my jurisdiction About page",
              editDesignatedReviewer: {
                intro: "You can restrict who’s allowed to request revisions from applicants.",
                item1:
                  "When this setting is <strong>off</strong>, any reviewer with access to the application can send revisions",
                item2:
                  "When <strong>on</strong>, only a person assigned to a permit application as a designated reviewer can send revision requests",
              },
              editJurisdictionEditButton: "Edit page",
              toggleOn: "On",
              toggleOff: "Off",
              acceptPermitApplications: "Accept permit applications",
              switchButtonInstructions:
                "Turning this on lets users submit applications. The email addresses set in this section will receive submitted applications",
            },
            externalApiKeys: {
              title: "API settings",
              description: "Manage API keys for the Building Permit Hub",
            },
            resources: {
              titleLabel: "Resource title",
              descriptionLabel: "Description",
              title: "Resources for applicants",
              shortDescription:
                "Add, edit, or remove documents and links that applicants can use for guidance or reference.",
              description:
                "Add, edit, or remove documents and links that applicants can use for guidance or reference. These resources will appear on your community’s About page and can be included in permit applications.",
              addResource: "Add resource",
              editResource: "Edit resource",
              category: "Category",
              resourceType: "Resource type",
              file: "File",
              linkUrl: "Link URL",
              confirmDelete: "Delete resource?",
              confirmDeleteBody: "Are you sure you want to delete this resource? This action cannot be undone.",
              types: {
                file: "File",
                link: "Link",
                pdf: "PDF",
                linkTag: "LINK",
              },
            },
            myJurisdictionAboutPage: {
              title: "About Page",
              description:
                "Add information about your jurisdiction including requirements, contact information, or common issues to watch for",
            },
          },
          superAdminTitle: "Admin home",
          submissionsInboxTitle: "Submissions",
          submissionsInboxDescription: "View all submitted building permit applications.",
          permitsTitle: "Digital building permits",
          permitsDescription:
            "Set up helpful tips for submitters and select elective questions to customize the permit application process for your local jurisdiction",
          userManagementTitle: "User management",
          userManagementDescription: "Invite or remove Review Managers or Reviewers in the Building Permit Hub.",
          auditLogTitle: "Audit log",
          stepCodes: "Step Codes",
        },
        projectReadinessTools: {
          title: "Project readiness tools",
          pageHeading: "Prepare and check your project documents",
          pageDescription: "Use these tools to help prepare a complete and compliant permit application",
          checkYourProject: "Check your project against Provincial regulations",
          prepareYourApplication: "Prepare your application package for submission",
          letterOfAssuranceLink: "Create your Letters of Assurance",
          lookupStepCodeLink: "Look up Step Code requirements for your project",
          lookupStepCodeDescription:
            "Enter an address to find the the Energy and Zero Carbon Step Code requirements for your project",
          meetStepCodeLink: "Create a Step Codes compliance report for your project",
          digitalSealValidator: {
            title: "Check digital seals",
            descriptionToolPage:
              "Check that a document has a valid digital seal (signature) from an AIBC or EGBC member",
            description:
              "Use this service to check whether a document includes a digital seal (signature) from a member of:",
            listItem1: "the Architectural Institute of British Columbia (AIBC)",
            listItem2: "Engineers and Geoscientists British Columbia (EGBC)",
            howItWorks: {
              title: "How it works",
              description:
                "Upload a document to check whether a supported digital seal is present. If a digital seal is found, the service will show:",
              listItem1: "the name of the person who applied the seal",
              listItem2: "the date the document was sealed",
              listItem3: "This service does not save your document or the result of the check.",
            },
            validateSeal: "Validate document",
            cantFindYourSeal: "Can't find your document?",
            noSignaturesFound: "No digital signatures found.",
            browseListOfDocuments: "Browse list of documents",
            fileRequirementsTitle: "File requirements",
            checkAnotherDocument: "Check another document",
            Validated: "Validated",
            notValidated: "There was a problem checking the seal on",
            signedAt: "Signed at",
            lastModified: "Last modified:",
            digitalSignaturesDetected: "Digital seal Detected",
            dragAndDrop: "Drag and drop files here, or",
            requirement1: "PDF format only",
            requirement2: "Upload one file at a time",
            requirement3: "Maximum file size: 200 MB",
            fileName: "File Name",
            size: "Size",
            browseDevice: "browse your device",
            help: {
              description:
                "A digital seal is an electronic version of a professional seal used by licensed engineers, architects, and other certified professionals. ",
              pass: "Pass/Verified:",
              passDesc:
                "The seal is valid, the signer’s identity is confirmed, and the document was not modified after it was sealed. Your document is safe to submit.",
              fail: "Fail/Unable to verify:",
              failDesc:
                "The system could not confirm the seal. This may mean the seal is invalid, the document was altered, or the signature does not meet Notarius verification standards. Try another file or contact the signing professional.",
            },
          },
          meetStepCodeDescription:
            "Generate a report that details a project's compliance with BC's Energy Step Code and Zero Carbon Step Code requirements",
          preCheckDrawingsLink: "Pre-check your drawings for compliance with BC Building Code",
          preCheckDrawingsDescription:
            "Upload your drawings to receive a report showing where your drawings comply or don't comply with select areas of the BC Building Code",
          checkDrawingsLink: "Check if your drawings follow the BC Building Code",
          checkDrawingsDescription:
            "Upload your drawings to get a report about where your drawings follow or don't follow certain sections of the BC Building Code",
          signDocumentsLink: "Digitally sign and authenticate your permit documents",
          signDocumentsDescription:
            "Add secure digital signatures that meet provincial requirements for authenticity and integrity in building permit submissions",
          createLoaDescription:
            "Complete Letters of Assurance to confirm who is professionally responsible for design and field review on your project, as required by the BC Building Code for some building types",
          compliantApplicationLink: "complete and compliant permit application",
          letterOfAssurancePage: {
            createYourLOAsTitle: "Create your Letters of Assurance",
            createYourLOAsIntro:
              "Some building permit applications need Letters of Assurance (LOAs). Letters of Assurance are legal documents that clearly identify the responsibilities of architects, engineers and other registered professionals when designing building components and reviewing them in the field.",
            createYourLOAsInstructions: "Registered professionals can use the forms on this page to:",
            createYourLOAsInstructionFill: "Fill out Letters of Assurance for your project",
            whoThisIsForTitle: "Who this is for",
            whoThisIsForDescription:
              "If your project requires Letters of Assurance, each registered professional involved must sign and seal their form as part of the building permit process.",
            whoThisIsForMayNeed: "You may need Letters of Assurance if your project:",
            whoThisIsForComplex: "is a complex building (usually Part 3 of the Building Code)",
            whoThisIsForSimpler:
              "is a simpler building (Part 9 of the Building Code) where Letters of Assurance are required by your local government",
            whoThisIsForInvolves: "involves registered professionals like architects or engineers",
            whoThisIsForCheckWithLG:
              "Check with your local government to find out if LOAs are required for your project. You can also read the <1>Letters of Assurance guide for BC Building Code 2018 and Vancouver Building By-law 2019 (PDF, 526 KB)</1> for more information.",
            whenToSubmitTitle: "When to submit Letters of Assurance",
            whenToSubmitDescription:
              "Only submit Letters of Assurance if your project needs them under the Building Code or local bylaws.",
            whenToSubmitIfRequired: "If required, submit these forms when you apply for your building permit:",
            whenToSubmitScheduleA:
              "<strong>Schedule A:</strong> signed by the owner and a Coordinating Registered Professional (usually the architect)",
            whenToSubmitScheduleB:
              "<strong>Schedule B:</strong> one form for each professional (like a structural or mechanical engineer) taking responsibility for a part of the project",
            whenToSubmitNotEvery:
              "Not every project needs all types of Schedule B. Your coordinating professional decides which are needed.",
            whenToSubmitBeforeOccupy:
              "Before you can occupy the building, additional Letters of Assurance are required:",
            whenToSubmitScheduleCA:
              "<strong>Schedule C-A:</strong> submitted by the coordinating professional to confirm everything meets the Building Code",
            whenToSubmitScheduleCB:
              "<strong>Schedule C-B:</strong> submitted by each professional who submitted a Schedule B earlier",
            whatLOAsCoverTitle: "What Letters of Assurance cover",
            whatLOAsCoverDescription:
              "Each registered professional takes responsibility for a specific part of the project. For example:",
            whatLOAsCoverArchitect: "<strong>Architect:</strong> overall design and coordination",
            whatLOAsCoverStructural: "<strong>Structural engineer:</strong> the frame and foundation",
            whatLOAsCoverMechanical:
              "<strong>Mechanical engineer:</strong> heating, ventilation, and air conditioning (HVAC)",
            whatLOAsCoverPlumbing: "<strong>Plumbing engineer or plumber:</strong> water and drainage systems",
            whatLOAsCoverFire: "<strong>Fire suppression engineer:</strong> sprinklers or other systems (if needed)",
            whatLOAsCoverGeotechnical: "<strong>Geotechnical engineer:</strong> ground stability and excavation",
            whatLOAsCoverIfThree:
              "If there are 3 or more professionals involved, you'll also need a Coordinating Registered Professional to oversee the design and field reviews.",
            fillableLettersOfAssurance: "Fillable Letters of Assurance",
            scheduleAFileLink: "Schedule A (PDF, 361 KB)",
            scheduleADescription:
              "Confirms that a Coordinating Registered Professional like an architect or engineer has been hired by the building owner. Submit as part of a building permit application.",
            scheduleBFileLink: "Schedule B (PDF, 587 KB)",
            scheduleBDescription:
              "Confirms that a Registered Professional of Record takes responsibility for certain building components and applicable field reviews. Submit before construction begins on each building component.",
            scheduleCAFileLink: "Schedule C-A (PDF, 260 KB)",
            scheduleCADescription:
              "Confirms the Coordinating Registered Professional fulfilled their obligations under Schedule A. Submit after project completion, but before an occupancy permit or final inspection.",
            scheduleCBFileLink: "Schedule C-B (PDF, 259 KB)",
            scheduleCBDescription:
              "Confirms the Registered Professional of Record fulfilled their obligations under Schedule B. Submit after project completion, but before an occupancy permit or final inspection.",
            previousLettersOfAssuranceTitle: "Previous Letters of Assurance",
            previousLettersOfAssuranceDescription:
              "For projects that were permitted prior to March 8, 2024 you can find Letters of Assurance on the BC Codes website:",
            previousLettersOfAssuranceLink: "Projects December 11, 2018 to March 8, 2024",
            previousLettersOfAssuranceLink2: "Projects December 20, 2012 to December 10, 2018",
            pageTitle: "",
            loaResponsibilities: {
              buildingDesign:
                "Building design – architect responsible for the overall building design and coordination.",
              structural: "Structural– engineer designs the building\'s frame and foundation.",
              mechanical: "Mechanical– engineer designs heating, ventilation, and air conditioning (HVAC).",
              plumbing: "Plumbing – engineer or plumber designs water and drainage systems.",
              fireSuppression: "Fire suppression systems – engineer designs systems like sprinklers (if required).",
              geotechnical:
                "Geotechnical - engineer reviews ground and slope stability for excavation, foundation, temporary retaining systems during constructions and finished building.",
            },
          },
          checkStepCodeRequirementsScreen: {
            pageHeading: "Check if your project meets BC's Step Codes requirements",
            toolIntro: "You can use this tool to:",
            toolPoint1: "generate a Step Codes compliance report for Part 3 and Part 9 Buildings",
            toolPoint2:
              "submit a completed Step Codes compliance report to the local government or First Nation responsible for approving permits",
            loginButton: "Log in to start",
            whoTitle: "Who this tool is for",
            whoDescription: "This Step Codes reporting tool is designed for:",
            whoPoint1: "energy modellers",
            whoPoint2: "architects and other design professionals",
            whenTitle: "When to create a Step Codes report",
            whenDescription:
              "The local government or First Nation responsible for approving permits may ask for Step Codes compliance information at different stages of your project. You can use this tool to generate a report instead of submitting the Excel checklists from the Energy Step Code website.",
            whatToExpectTitle: "What to expect",
            whatToExpectDescription:
              "You'll be asked for energy modelling results for your project. Before starting, use energy modelling software to model your building's energy performance.",
            whatsIncludedTitle: "What's included in a Step Code report:",
            whatsIncludedPoint1: "the Energy and Zero Carbon steps your project must meet (if any)",
            whatsIncludedPoint2: "whether your project meets the required steps",
            downloadSampleLink: "Download a sample report",
          },
          startCheckStepCodeRequirementsScreen: {
            back: "Back",
            title: "Building categories",
            description:
              "This tool supports Step Code reporting for buildings that fall under Part 3 or Part 9 of the BC Building Code:",
            part3Buildings: {
              title: "Part 3 buildings",
              description:
                "Step-by-step entry of your energy modelling results. Estimated time to complete: 30-45 minutes",
            },
            part9Buildings: {
              title: "Part 9 buildings",
              description:
                "Enter project details and upload your HOT2000 (H2K) file. Estimated time to complete: 5-10 minutes",
            },
            otherBuildingTypes: {
              title: "Other building types",
              description: "The BC Energy Step Code currently applies only to Part 3 and Part 9 buildings",
            },
            question: "Which part of the BC Building Code applies to your project?",
            part3: "Part 3",
            part9: "Part 9",
            next: "Next",
          },
        },
        admin: {},
        errors: {
          fetchJurisdiction: "Something went wrong fetching the jurisdiction",
          fetchPermitApplication: "Something went wrong fetching the permit application",
          fetchPermitTypeOptions: "Something went wrong fetching the BCBC part options",
          fetchAutoComplianceModuleConfigurations: "Something went wrong fetching the auto compliance module options",
          fetchActivityOptions: "Something went wrong fetching the activity options",
          workTypeNotFound: "Work type not found",
          fetchWorkTypeOptions: "Something went wrong fetching the work type options",
          fetchRequirementTemplate: "Something went wrong fetching the requirement template",
          fetchTemplateVersion: "Something went wrong fetching the template version",
          fetchCurrentUserLicenseAgreements: "Please confirm your account to see license agreement",
          fetchTemplateVersions: "Something went wrong fetching template versions",
          fetchBuildingPermits: "Something went wrong fetching building permits",
          fetchBuildingPermit: "Something went wrong fetching building permit",
          fetchBuildingPermitJurisdictionChanges: "Something went wrong fetching building permit jurisdiction changes",
          fetchOptions: "Something went wrong fetching options",
          fetchJurisdictionTemplateVersionCustomization:
            "Something went wrong fetching jurisdiction template version customization",
          fetchIntegrationMapping: "Something went wrong fetching jurisdiction integration requirements mapping",
        },
        user: {
          fields: {
            role: "Role",
            email: "Email",
            name: "Name",
            createdAt: "Date added",
            lastSignInAt: "Last sign in",
          },
          index: {
            tableHeading: "User accounts",
            inviteButton: "Invite users",
          },
          changeRole: "Change role",
          newEmail: "New notification email address",
          changeEmail: "Change email",
          deleteAccount: "To delete your account, please contact <1>digital.codes.permits@gov.bc.ca</1>.",
          addUser: "Add more emails",
          invite: "Invite",
          invitedBy: "<strong>{{email}}</strong> has invited you to join:",
          invitedAsAdmin:
            "<strong>{{email}}</strong> has invited you to join BC Building Permit Hub as an administrator",
          invitedAs: "as a",
          invitationIntent:
            "This invitation is intended for <strong>{{email}}</strong>, if this is incorrect please contact the sender above.",
          invalidInvitationToken: {
            title: "Invalid invite",
            message: "Please contact your jurisdiction to request a new invitation link.",
          },
          createAccount: "Proceed with your account creation",
          omniauthProviders: {
            idir: "IDIR",
            bceidbasic: "Basic BCeID",
            bceidbusiness: "Business BCeID",
            bcsc: "BC Services Card Account",
          },
          changeBceid: "If you want to change your BCeID information, please go to ",
          changeBceidLinkText: "bceid.ca",
          confirmationRequiredWithEmail:
            "Action required: please click the link in the verification email that was sent to you. You will continue to receive emails at <strong>{{email}}</strong> until your new email is confirmed. <br/><br/>(Didn't receive it? <1>Resend email</1>)",
          confirmationRequired:
            "Action required: please click the link in the verification email that was sent to you. <br/><br/>(Didn't receive it? <1>Resend email</1>)",
          receiveNotifications: "Receive notifications",
          notificationsEmail: "Notification email address",
          firstName: "First name",
          lastName: "Last name",
          myProfile: "Your profile",
          inviteTitle: "Invite users",
          adminInviteTitle: "Invite super admins",
          inviteSuccess: "Invite sent!",
          reinvite: "Re-invite",
          reinviteSuccess: "Invite re-sent!",
          inviteTakenError: "Email taken",
          inviteError: "Invite error",
          takenErrorTitle: "Some of these emails already belong to existing users",
          takenErrorDescription:
            "One or more of the requested users have an existing account. Please ask them to change their email on their current account. You can then re-invite them into your local jurisdiction.",
          sendInvites: "Send invites",
          acceptInvitation: "Accept invitation",
          acceptInstructions: "Enter your login and other user info below to finalize your account creation.",
          rolesAndPermissions: "User roles & permissions",
          inviteInstructions:
            "Enter the email addresses of whom you wish to invite below.  For details about permissions for each role, please see",
          notifications: {
            essential: "Essential communications (cannot disable)",
            event: "Event",
            enableNotification: "Enable notification",
            templateChanged: "Changes to permit requirements",
            templateCustomized: "Jurisdiction customizations to permit requirements",
            applicationSubmitted: "Application submitted to jurisdiction",
            applicationViewed: "Application viewed by jurisdiction",
            applicationRevisionsRequested: "Revisions requested by jurisdiction",
            collaboration: "Collaboration",
            integrationMapping: "API integration mapping",
            unmappedApiNotification: "Unmapped API Notification",
            resourceReminder: "Resource reminder",
          },
          emailConfirmed: {
            heading: "Email confirmed!",
            description: "You will receive updates and notifications at the confirmed email address.",
          },
          inApp: "In-App",
          email: "Email",
          // Leave in snake case so we can use: t(`user.roles.${role}`)
          roles: {
            submitter: "Submitter",
            regional_review_manager: "Regional Review Manager",
            review_manager: "Review Manager",
            reviewer: "Reviewer",
            super_admin: "Super Admin",
            technical_support: "Technical Support",
          },
          rolesExplanation: {
            submitter:
              "The Submitter is typically an external user, such as a contractor, homeowner, or architect," +
              " who initiates the building permit application process. They are responsible for providing all necessary documentation and information required for the permit application. Submitters need to ensure their submissions are complete, accurate, and comply with local regulations.",
            review_manager:
              "The Review Manager supervises the Reviewers and the entire building permit review operation. In addition to possessing all the permissions of a Reviewer, Review Managers are tasked with administrative oversight. Their responsibilities include the distribution of work among Reviewers, maintaining efficiency and consistency in the review processes, and ensuring that the quality of service meets established standards. Moreover, Review Managers have extended privileges to modify local government-specific configurations within the building permit application system, such as updating Step Code requirements, managing content on the 'About' page, and other application settings pertinent to their jurisdictional needs.",
            reviewer:
              "A Reviewer is typically an employee within the local government or a designated authority responsible for examining building permit applications submitted by the Submitter. Reviewers assess the documentation for compliance with building codes, zoning laws, and other regulatory requirements. They may request additional information, approve, reject, or provide comments on the applications.",
            super_admin:
              "The Super Admin is the highest-level user within the system, with overarching control over the entire permit application platform. They have the authority to manage user roles, including creating and removing user accounts, and to modify the system configuration. This role is responsible for the maintenance of the system, including updates and enhancements, and ensuring that the system meets the operational and strategic objectives of the local government or the organization.",
            technical_support:
              "The Technical Support - LJ role is designed to assist local jurisdictions with technical aspects of the Building Permit Hub. This role acts as the first point of contact for troubleshooting and managing technical configurations related to the API and user access. They provide support to ensure that local jurisdictions can effectively integrate with the platform and maintain smooth operations.",
          },
          assignTo: "Assign to...",
          department: "Department",
        },
        earlyAccessRequirementTemplate: {
          show: {},
          index: {
            tableHeading: "Previews",
            title: "Early access templates catalogue",
            invitationInfo:
              "Early access previews are non-submittable and accessible only by registered users who are invited. Access is granted for 60 days and can be extended or revoked at any time.",
            createButton: "Create new early access template",
            seeArchivedButton: "See archived",
            sharePreviewLink: "Share ({{ n }})",
            sharePreviewTitle: "Share preview",
            inviteToPreviewTitle: "Invite to preview",
            inviteToPreviewHint: "Separate each email with a comma ,",
            revokeButton: "Revoke",
            unrevokeButton: "Unevoke",
            extendButton: "Extend",
            inviteToPreviewButton: "Send invites",
            noPreviewersYet: "No previewers yet. Click invite to add previewers to this template",
            inviteToPreviewPartialSuccess: "Some invites failed to send",

            confirmation: {
              revokeTitle: "Are you sure you want to revoke access for {{ name }}?",
              revokeBody:
                "Revoking access will immediately prevent this user from accessing the early access content. This may be undone.",
              extendTitle: "Extend Access Duration for {{ name }}",
              extendBody:
                "Extending access will give the user 60 additional days to interact with the early access content. Do you want to proceed?",
              unrevokeTitle: "Restore Access for {{ name }}",
              unrevokeBody:
                "Restoring access will allow the user to access the early access content again. Are you sure you want to proceed?",
            },
          },
          new: {
            title: "Create new preview",
            modalTitle: "Create new preview",
            startingFresh: "Starting fresh?",
            addFromExisitng: "Add requirements from an exisitng permit?",
            startWithBlank: "Start with blank permit",
            copyFromLive: "Copy from live permit",
            copyFromThis: "Copy from this",
          },
          edit: {
            lastFetched: "Last fetched",
            fetchLatest: "Fetch latest",
            auditLog: "Audit log",
            confirmRemoveModalTitle: "Archive preview?",
            confirmRemoveModalBody: "This preview will no longer be accessible by invitees",
            public: "Grant public access?",
          },
          fields: {
            nickname: "Nickname",
            permitType: "BCBC Part",
            activity: "Work type",
            firstNations: "First nations?",
            sharedWith: "Shared with",
            updatedAt: "Updated at",
            assignee: "Assigned",
          },
        },
        requirementTemplate: {
          compareAction: 'Requirement "{{ requirementName }}" has been {{ action }}',
          changed: "changed",
          added: "added",
          removed: "removed",
          filter: "Template",
          edit: {
            requirementsLibraryTab: "Requirements Library",
            earlyAccessRequirementsLibraryTab: "Early Access Requirements Library",
            earlyAccessTabDescription: "Early access previews cannot add 'Preview omitted' blocks ",
            options: {
              button: "Options",
              copyTips: "Import tips from ({{ templateLabel }})",
              copyElectives: "Import electives from ({{ templateLabel }})",
            },
            promoteElectives: "Export changes",
            promoteElectivesMessage:
              "This will publish your training sandboxed customizations and overwrite your non-training sandboxed live electives!",
            clickToWriteDescription: "Click to write description",
            title: "Permit Application Builder",
            dndTitle: "Drag to reorder",
            dndInstructions:
              "Change the order of requirements by using the menu on the left to drag items up or down. Click the 'Done' button to return to the form.",
            addSectionButton: "Add section",
            addRequirementButton: "Add requirement",
            saveDraft: "Save as draft",
            closeEditor: "Close editor",
            sectionsSidebarTitle: "Contents",
            reorderButton: "Reorder",
            removeConfirmationModal: {
              title: "Are you sure you want to remove this section?",
              body: "Any requirements inside this section will also be removed along with it.",
            },
            emptyTemplateSectionText: "Start by clicking the Add Section button",
            blockRemoved: "Requirement block removed",
            sectionRemoved: "Section removed",
            wasRemoved: "{{name}} was removed",
            stepCodeWarnings: {
              energyStepCodeRecommended:
                'Warning:"Design package energy step code file" is present in the template, but there is no "Energy step code" requirement.',

              duplicateStepCodePackage:
                'Warning: Multiple "Design package energy step code files" found. Please ensure there is only one "Design package energy step code file".',
            },
            stepCodeErrors: {
              duplicateEnergyStepCode:
                'Warning: Multiple "Energy step code" requirements found. Please ensure there is only one "Energy step code" in the template.',
              stepCodePackageRequired:
                'Warning: "Energy step code" is required to have the "Design package energy step code file".',
              duplicateStepCodePackage:
                'Multiple "Design package energy step code files" found. Please ensure there is only one "Design package energy step code file" when there is an "Energy step code" requirement',
            },
            goToTop: "Go to top",
            collapseAll: "Collapse all",
            scheduleModalTitle: "Publish permit?",
            scheduleModalBody:
              "Once you publish, local jurisdictions and submitters will be able to see and use this new version of the form.",
            scheduleModalHelperText: "Schedule to <1>publish</1> (at midnight 00:01 PST)",
            scheduleModalCancelMessage: "Changes were not scheduled.",
            forcePublishNow: "Force publish!",
            pleaseReview: "Please review the following:",
            errorsBox: {
              title: "There are {{count}} fields with errors on the page",
              instructions: "Please fix the following before submitting:",
            },
            diffBox: {
              title: "Template changes",
              instructions: "Please review the following:",
              added: "Added",
              changed: "Changed",
              removed: "Removed",
              updateToNewVersion: "See new",
            },
            duplicateRequirementBlockDisabledReason: "This requirement block is already in the template",
            goToLatest: "Go to latest",
          },
          fields: {
            status: "Status",
            permitType: "BCBC Part",
            activity: "Work type",
            firstNations: "First Nations",
            description: "Description",
            currentVersion: "Current version",
            usedBy: "Used by",
          },
          status: {
            published: "Published",
            scheduled: "Scheduled",
            draft: "Draft",
            deprecated: "Deprecated",
          },

          index: {
            tableHeading: "Templates",
            title: "Permit templates catalogue",
            description:
              "List of all permit templates in the system that's been created by the Super Admin. Only published templates will be visible to jurisdictions and submitters.",
            createButton: "Create new template",
            seeArchivedButton: "See archived",
          },
          new: {
            title: "Create new template",
            typePrompt: "What kind of building permit is this?",
            descriptionHelpText:
              "Provide some context for review managers and administrators on what kinds of buildings this permit is meant for.",
            createButton: "Create template",
            firstNationsLand: "This permit is intended only for <1>First Nation Registered Land</1>",
            copyExistingByClassifications: "Copy from existing template of this BCBC part and work type if available",
          },
          versionSidebar: {
            triggerButton: "Versions",
            title: "Template versions",
            subtitlePrefix: "For:",
            viewTemplateButton: "View template",
            resumeDraftButton: "Resume draft",
            unscheduleButton: "Unschedule",
            listTitles: {
              published: "Published",
              draft: "Drafts",
              scheduled: "Scheduled",
              deprecated: "Deprecated (last 3)",
            },
            unscheduleWarning: {
              title: "Are you sure you want to unschedule this template?",
              body: "This action cannot be undone.",
            },
            deprecationReasonLabels: {
              unscheduled: "reason: unscheduled",
              new_publish: "reason: new publish",
            },
            lastUpdated: "Last updated",
          },
          export: {
            title: "Export Templates",
            downloadSummaryCsv: "Download Summary CSV",
            templateSummaryFilename: "Template Summary",
            downloadCustomizationCsv: "Download Customizations CSV",
            downloadCustomizationJson: "Download Customizations JSON",
          },
        },
        apiMappingsSetup: {
          title: "API mappings setup",
          index: {
            helperSubtitle: "See details of how fields are mapped to the API.",
            seeButton: "See {{status}}",
          },
          edit: {
            permitTemplate: "Permit template",
            seeApiDoc: "See API documentation",
            heading: "<1>Manage mapping for</1> <2>{{permitClassification}}</2>",
            table: {
              blockAccordionButton: "{{blockName}} <1>requirement block code: {{blockCode}}</1>",
              filter: {
                showAll: "Show all",
                showOnlyUnmapped: "Show only unmapped",
              },
              title: "API mappings",
              headers: {
                localField: "Your local field name",
                localFieldInfo: "Local field mapping info",
                templateField: "Map to <1>requirement code</1> in template",
                requirementDetail: "Field in template",
              },
              localFieldEdit: {
                addMapping: "Add local mapping",
                addMappingLabel: "Local mapping",
              },
            },
          },
        },
        digitalBuildingPermits: {
          index: {
            title: "Digital Building Permits",
            permitType: "BCBC part",
            selectPermit: "Select a digital permit:",
            workType: "Work type",
            manageButton: "Manage",
            lastUpdated: "Last updated",
            requestNewPromptWithLink:
              "Your administrator has made the above permit classifications available for digital submissions. If there is another classification you want please <1>request a new classification</1>.",
            emptyPermitsText:
              "No available building permits of the selected work type. Please wait for updates from the Ministry of Housing.",
          },
          edit: {
            requirementBlockSidebar: {
              description:
                "Local jurisdictions can change building permit applications to fit their needs by adding elective fields and offering submitters practical tips. This helps make the application forms reflect the distinct regulations, standards, and requirements of each jurisdiction, so applicants provide the correct information needed by their area.",
              tipLabel: "Tip for submitters (optional)",
              resourcesLabel: "Resources for applicants",
              noResourcesYet: "When you add resources, they'll appear here.",
              addResourcesLink: "Add resources for applicants",
              manageResourcesLink: "Manage resources",
              filterLabel: "Search electives",
              sortLabel: "Sort by",
              filterPlaceholder: "Search electives",
              sortOptions: {
                labelAsc: "Elective (A-Z)",
                labelDesc: "Elective (Z-A)",
                reasonAsc: "Reason (A-Z)",
                reasonDesc: "Reason (Z-A)",
              },
              manageFieldsButton: "Manage elective field(s)",
              resetToDefaults: "Reset to defaults",
              selectFieldsTitle: "Select elective fields",
              noElectiveFields: "There are no elective fields enabled for this block",
              electiveFormFields: "Elective form fields",
              addSelectedButton: "Add selected",
              reason: "Reason:",
              requiredForSubmitter: "Required for submitter",
              reasonLabels: {
                placeholder: "Select a reason",
                bylaw: "Bylaw",
                zoning: "Zoning",
                policy: "Policy",
              },
            },
          },
        },
        siteConfiguration: {
          title: "Configuration",
          adminUserIndex: {
            title: "Users",
            description: "View and manage administrative users",
          },
          permitClassifications: {
            title: "Permit classifications",
            description: "Manage BCBC parts and work types",
            descriptionLabel: "Description",
            permitTypes: "BCBC parts",
            permitType: "BCBC part",
            activities: "Work types",
            activity: "Work type",
            addPermitType: "Add BCBC part",
            addActivity: "Add work type",
            code: "Code",
            name: "Name",
            enabled: "Enabled",
            category: "Category",
          },
          standardizationPageSetup: {
            title: "Standardization preview page setup",
            description: "Select the open access previews that will be displayed on the standardization preview page.",
            selectOpenAccessPreviews:
              "Set open access previews to display on the standardization preview page. Select from the available public access previews below.",
            smallScale: "Set as Small Scale New Contruction Preview on standardization preview page",
            fourPlus: "Set as Four Plus New Construction Preview",
          },
          globalFeatureAccess: {
            title: "Global feature access",
            description: "Turn system features on or off for all users",
            submissionInbox: "Submissions inbox",
            submissionInboxDescription:
              "Enable review managers to accept and process permit applications. If you turn off this feature, submitters can't submit applications, and review managers won't receive new applications.",
            toggleOn: "On",
            toggleOff: "Off",
            accessControlRevisionRequests: "Access control for revision requests to submitters",
            designatedReviewerDescription: "Turn the designated reviewer on or off site-wide.",
            editDesignatedReviewer: {
              intro:
                "Allow jurisdictions to require that only designated reviewers can send revision requests to submitters.",
              item1:
                "When this setting is <strong>off</strong>, all reviewers with access to a permit can send revisions, across all jurisdictions",
              item2:
                "When <strong>on</strong>, jurisdictions can choose to limit who can request revisions from applicants",
            },
            codeCompliance: "Code compliance",
            codeComplianceSetup: {
              title: "Code compliance",
              description:
                "Enable review managers to turn on or off code compliance services globally. These services let applicants run automated checks through a third-party system. If turned off, applicants cannot run compliance checks in their permit applications.",
              toggleTitle: "Code compliance",
              individualServices: "Individual services",
              individualServicesDescription:
                "Configure specific compliance services and their availability by jurisdiction.",
              archistarEcheck: "Archistar eCheck",
              enableForAll: "Enable for all jurisdictions",
              enrolledJurisdictions: "Select jurisdictions",
              allJurisdictionsEnabled: "All jurisdictions enabled",
              allJurisdictionsEnabledDescription:
                "All jurisdictions are currently enabled for Archistar eCheck. Turn off the switch above to select specific jurisdictions.",
              jurisdictionsCount: "{{count}} jurisdictions enabled",
              jurisdictionsCount_one: "{{count}} jurisdiction enabled",
              jurisdictionsCount_other: "{{count}} jurisdictions enabled",
              searchJurisdictions: "Search and select jurisdictions...",
            },
          },
          sitewideMessage: {
            title: "Site-wide message",
            description: "Enable and configure a site-wide message",
            enable: "Show",
            label: "Site-wide message",
            hint: "This message will appear at the top of each page for all users.",
            settings: "Site-wide message settings",
          },
          revisionReasonsAttributesSetup: {
            title: "Revision reasons",
            description: "Manage revision request reasons",
            options: "Selectable options",
            fields: {
              reasonCode: "Reason code",
              reasonDescription: "Reason description",
              descriptionHint: "A short descriptor for the reason",
            },
          },
          helpDrawerSetup: {
            title: "Help drawer",
            description: "Manage help drawer links",
            settings: "Links",
            fields: {
              show: "Show",
              title: "Title",
              href: "CMS Lite GUID Link Url",
              description: "Description",
              titleHint: "Text for the main call-to-action",
              descriptionHint: "Short description below to give context",
            },
            getStartedLinkItem: {
              label: "Get started",
            },
            bestPracticesLinkItem: {
              label: "Best practices",
            },
            dictionaryLinkItem: {
              label: "Dictionary of terms",
            },
            userGuideLinkItem: {
              label: "User and role guide",
            },
          },
        },

        reporting: {
          title: "Reporting",
          tableHeading: "Available reports",
          filterPlaceholder: "Filter reports by name",
          stepCodeSummaryName: "Energy step code configuration by jurisdiction",
          stepCodeSummaryDescription: "Energy step code configuration by jurisdiction",
          templateSummary: {
            name: "Template summary",
            description: "A summary of template usage by jurisdictions",
            title: "Export Template Summary",
          },
          stepCodeSummary: {
            name: "Energy step code configuration by jurisdiction",
            description: "A summary of step code requirements by jurisdictions",
            title: "Export energy step code configuration by jurisdiction",
            filename: "Energy step code configuration by jurisdiction",
          },
          stepCodeMetrics: {
            name: "Energy step code metrics for all jurisdictions",
            description: "Energy step code metrics for all jurisdictions",
            title: "Energy step code metrics for all jurisdictions",
            filename: "Energy step code metrics for all jurisdictions",
            filenamePart3: "Part 3 step code metrics",
            filenamePart9: "Part 9 step code metrics",
            downloadPart3: "Download Part 3 metrics",
            downloadPart9: "Download Part 9 metrics",
          },
          applicationMetrics: {
            name: "Basic Application metrics for all jurisdictions",
            description:
              "Submitted and draft application metrics by jurisdiction and type, excluding submissions created by employee accounts",
            title: "Basic Application metrics for all jurisdictions",
            filename: "Basic Application metrics for all jurisdictions",
          },
          preCheckUserConsent: {
            name: "Archistar Tool User Consent Report",
            description:
              "Export user contact information and submission details for users who consented to be contacted for research on the Archistar tool. Respects research participation opt-out preferences.",
            title: "Archistar Tool User Consent Report",
            filename: "Archistar Tool User Consent Report",
          },
          columnHeaders: {
            name: "Name",
            description: "Description",
          },
        },
        externalApiKey: {
          index: {
            createExternalApiKey: "Create new API key",
            enabled: "Enabled",
            disabled: "Disabled",
            accessDocs: "Access the API Documentation",
            table: {
              heading: "API keys",
            },
            apiKeyInfo: {
              title: "Generate API Keys for Third-Party Integrators",
              body: "Use this screen to generate API keys for third-party integrations. For technical details on using the API, refer to our documentation site.<1>Access the API Documentation</1> Share the above link with developers or technical team members needing detailed integration information.",
            },
            disabledWarningTitle:
              "API keys for this jurisdiction have not been enabled. To enable them, please contact" + " us at",
            disabledTooltipLabel: "User is not authorized to make this change",
            disableConfirmationModal: {
              title: "Are you sure you want to disable API keys for this jurisdiction?",
              body: "All active API keys will be disabled",
            },
          },
          modal: {
            createTitle: "Create API key",
            manageTitle: "Manage API key",
            removeConfirmationModal: {
              title: "Are you sure you want to revoke this API key?",
              body: "Any applications using this token will be unable to access the API.",
            },
          },
          fieldLabels: {
            name: "Name",
            connectingApplication: "Application connecting to",
            revokedAt: "Revoked at",
            webhookUrl: "Webhook URL",
            expiredAt: "Expires on",
            createdAt: "Created at",
            token: "Token",
            status: "Status",
            notificationEmail: "Notification email",
            sandbox: "Training sandbox",
          },
          notificationEmailHint:
            "This email will be used to notify your local integration partner about upcoming changes to API mappings. Note: Jurisdiction review managers will be notified via their registered email irrespective of this field",
          fieldPlaceholders: {
            webhookUrl: "https://example.com/webhook",
          },
          status: {
            active: "Active",
            notActive: "Not-Active",
          },
        },
        site: {
          closeMenu: "Close menu",
          redirecting: "Redirecting...",
          validating: "Validating...",
          loggingOut: "Logging out...",
          loading: "Loading...",
          title: "Building Permit Hub",
          titleLong: "Building Permit Hub",
          adminBarTitle: "Building Permit Hub - Admin Panel",
          adminPanel: "Admin Panel",
          beta: "Beta",
          linkHome: "Navigate home",
          didYouFind: "Did you find what you were looking for?",
          thankYouForResponse: "Thank you for your response!",
          actionRequired: {
            application_revisions_request:
              "You have received a request for revisions on application <1 />. Please revise before resubmitting (you won't lose your place in line).",
          },
          navMenu: {
            sections: {
              account: "Account",
              settings: "Settings",
              permits: "Permits",
              support: "Support",
              other: "Other",
              about: "About",
            },
            projectReadiness: {
              all: {
                label: "All project tools",
                description: "A short description about this link",
              },
              stepCodes: {
                label: "Look up Step Codes requirements",
                description:
                  "Enter an address to find the Energy and Zero Carbon Step Code requirements for your project",
              },
              bcBuildingCode: {
                label: "BC Building Code pre-check",
                description: "Get a report showing how your drawings comply with areas of the BC Building Code",
              },
            },
            about: {
              aboutHub: {
                label: "About Building Permit Hub",
              },
              participatingCommunities: {
                label: "Participating communities",
                description: "Find out if you can use this service to apply for permits in your community",
              },
              forLocalGovernments: {
                label: "For local governments",
                description: "Information for local governments interested in joining Building Permit Hub",
              },
              standardPermitApplicationMaterials: {
                label: "Standard permit application materials",
                description: "Review and provide feedback on permit application materials under development",
              },
            },
          },
          govFeedbackResponseNoReasons: {
            unclear: "This information is unclear",
            missingInfo: "This page is missing the information I need",
            notRelated: "This page is not related to what I searched for",
            other: "Other",
          },
          territorialAcknowledgement:
            "The B.C. Public Service acknowledges the territories of First Nations around B.C. and is grateful to carry out our work on these lands. We acknowledge thse rights, interests, priorities, and concerns of all Indigenous Peoples - First Nations, Métis, and Inuit - respecting and acknowledging their distinct cultures, histories, rights, laws, and governments.",
          home: "Home",
          contact: "Contact us",
          contactEmail: "digital.codes.permits@gov.bc.ca",
          contactInstructions_1: "If you have any questions or need assistance, see the contact options below:",
          contactInstructions_2: "Have a question about your digital permit application?",
          contactInstructions_3:
            "Please contact your local jurisdiction for questions related to your permit application.",
          contactTeamInstructionsTitle: "Contact the Building Permit Hub Team",
          contactTeamInstructions: [
            "Do you have some feedback for the Building Permit Hub Team?",
            "Do you have any questions or need assistance regarding your experience using the Building Permit Hub?",
          ],
          contactUs: {
            responseAim:
              "We aim to respond to Building Permit Hub inquiries within 2 to 5 days business days. For urgent permit application issues, please contact your local jurisdiction directly.",
            hours: {
              title: "When We're Available",
              availability: "Building Permit Hub Support: Monday-Friday, 8:30 AM - 4:30 PM (Pacific Time)",
              note: "Note: Local jurisdictions may have different hours for permit-specific questions",
            },
            quickHelp: {
              title: "Try These First",
              loginIssues:
                "<strong>Log in Issues?</strong> Clear your browser cache or try an incognito window (Link to BCeID or BC Servcices Card Account)",
              uploadProblems: "<strong>Upload Problems?</strong> Ensure files are under 200MB",
              applicationStatus: "<strong>Application Status?</strong> Log into your account to view real-time updates",
            },
            routing: {
              title: "Choose the Right Contact Method",
              technical: {
                title: "Technical Issues with the Website",
                description: "Browser errors, login problems, file upload issues",
                email: "📧 digital.codes.permits@gov.bc.ca",
              },
              permit: {
                title: "Permit Application Questions",
                description: "Requirements, timelines, approval status",
                instruction: "📞 Contact your local building department (find yours below)",
              },
            },
            jurisdictionFinder: {
              title: "Find Your Local Building Department",
              prompt: "<i>Not sure which jurisdiction handles your permit?</i>",
              search: "[Search by address or postal code] → Link to jurisdiction lookup tool",
            },
          },
          contactTeamCTA: "Please contact us at",
          contactNeedHelp: "Need general help?",
          contactNeedHelpInstructions:
            "Services are available in a variety of different languages and channels through Service BC.",
          contactNeedHelpCTA: "Get help with government services",
          listJurisdictions: "See list of jurisdictions",
          help: "Help",
          aboutTitle: "About",
          disclaimerTitle: "Disclaimer",
          copyrightHolder: "Government of British Columbia.",
          metaDescription:
            "The Building Permit Hub helps you submit a building permit application through a streamlined and standardized approach across jurisdictions in B.C. This tool connects you with local government and First Nations information to support the building permit submission process.",
          metaKeywords: "BC, british columba, permit, portal, hub, permitting, permit application",
          loggedInWelcome: "Welcome back!",
          myPermits: "My permits",
          myProjects: "Projects",
          newApplication: "New permit application",
          activePermits: "Active permits",
          approvedPermits: "Approved permits",
          myAccount: "My Account",
          giveFeedback: "Give feedback",
          error: "Something went wrong, please try refreshing the page",
          menu: "Menu",
          somethingWrong: "Something went wrong",
          pageNotFound: "Error, we can't find that page",
          pageNotFoundInstructions: "Please check that the web URL has been entered correctly.",
          pageNotFoundCTA: "Go back to home",
          pageNotFoundContactInstructions: "Do you believe this to be in error or are you stuck?",
          seeConsoleForDetails: "See the browser console for details",
          accessibility: "Accessibility",
          copyright: "Copyright",
          foippaWarning:
            "We are collecting your personal information for the purpose of creating and submitting a building permit application. We are collecting your personal information under section 26(c) of the Freedom of Information and Protection of Privacy Act. If you have questions about our collection of your information, please contact us at ",
          needMoreHelp: "Need more help?",
          pleaseContact: "Please contact your local government for questions related to your permit application.",
          forHelp: "For help with the Building Permit Hub please contact:",
          reviewNotifications: "Review notifications",
          privacyPolicy: "Privacy Policy",
          privacyPolicyEffectiveDate: "Effective Date: January 6, 2025",
          privacyPolicyLastUpdated: "Last Updated: July 1, 2025",
          privacyPolicyAppliesTo: "Applies To: Building Permit Hub",
          privacyPolicyOverview: "Overview",
          privacyPolicyOverviewDescription1:
            "The Building Permit Hub is committed to safeguarding your personal information and ensuring your data is handled responsibly. We are a government-supported platform created to streamline the building permit process across British Columbia, helping builders, homeowners, and local governments collaborate digitally.",
          privacyPolicyOverviewDescription2:
            "This Privacy Policy outlines how we collect, use, disclose, and protect your personal information in accordance with the Freedom of Information and Protection of Privacy Act (FIPPA), and the Government of British Columbia’s website privacy statement.",
          privacyPolicyWhatInformationWeCollect: "What Information We Collect",
          privacyPolicyWhatInformationWeCollectDescription1:
            "We collect only the minimum information necessary to deliver services. Depending on how you use the Building Permit Hub, this may include:",
          privacyPolicyWhatInformationWeCollectItem1:
            "Name, contact information, and user credentials (for account creation and secure access)",
          privacyPolicyWhatInformationWeCollectItem2:
            "Project and permit application details (e.g., property address, BCBC part, uploaded documents)",
          privacyPolicyWhatInformationWeCollectItem3:
            "Jurisdictional or regulatory information (e.g., zoning, bylaw data, step code compliance)",
          privacyPolicyWhatInformationWeCollectItem4:
            "System use analytics (to improve service performance and user experience)",
          privacyPolicyWhatInformationWeCollectDescription2:
            "Some data may also be collected from third parties (e.g., municipalities, LTSA, BC Assessment) where authorized or required for application processing.",
          privacyPolicyHowWeUseYourInformation: "How We Use Your Information",
          privacyPolicyHowWeUseYourInformationDescription: "We use your information to:",
          privacyPolicyHowWeUseYourInformationItem1: "Provide secure access to the Building Permit Hub",
          privacyPolicyHowWeUseYourInformationItem2:
            "Allow you to submit, track, and manage building permit applications",
          privacyPolicyHowWeUseYourInformationItem3: "Communicate with you about your applications or account",
          privacyPolicyHowWeUseYourInformationItem4:
            "Enable collaboration between local governments, First Nations, and regulators",
          privacyPolicyHowWeUseYourInformationItem5:
            "Improve service delivery through aggregated, non-identifiable usage analytics",
          privacyPolicyHowWeUseYourInformationItem6:
            "Meet our legal obligations under FIPPA and relevant building regulations",
          privacyPolicyHowWeUseYourInformationDescription2:
            "We do not use your information for marketing or advertising purposes.",
          privacyPolicyWhoCanAccessYourInformation: "Who Can Access Your Information",
          privacyPolicyWhoCanAccessYourInformationDescription: "Your information may be accessed by:",
          privacyPolicyWhoCanAccessYourInformationItem1:
            "Local governments and First Nations processing your permit application",
          privacyPolicyWhoCanAccessYourInformationItem2:
            "Authorized Ministry of Housing and Municipal Affairs staff supporting the platform",
          privacyPolicyWhoCanAccessYourInformationItem3:
            "Our compliance tools allow you, with your authorization, to interact with regulatory bodies (e.g., BC Hydro and others) involved in compliance checks, where applicable.",
          privacyPolicyWhoCanAccessYourInformationItem4:
            "Our compliance tools allow you, with your authorization, to interact with 3rd party tools (e.g., BC Building Code Compliance tool and others) involved in compliance checks, where applicable.",
          privacyPolicyWhoCanAccessYourInformationDescription2:
            "Access is role-based and granted only to individuals who need the information to do their job.",
          privacyPolicyHowWeProtectYourInformation: "How We Protect Your Information",
          privacyPolicyHowWeProtectYourInformationDescription:
            "We use a combination of physical, technical, and administrative measures to safeguard your information:",
          privacyPolicyHowWeProtectYourInformationItem1: "All information is stored within Canada",
          privacyPolicyHowWeProtectYourInformationItem2:
            "Your information is not transmitted outside of Canada without your authorization",
          privacyPolicyHowWeProtectYourInformationItem3: "Encryption is used for data transmission and storage",
          privacyPolicyHowWeProtectYourInformationItem4:
            "Access controls and audit logs are implemented to ensure accountability",
          privacyPolicyHowWeProtectYourInformationItem5:
            "Information is retained only as long as necessary to fulfill its purpose",
          privacyPolicyYourRights: "Your Rights",
          privacyPolicyYourRightsDescription: "As a user of the Building Permit Hub, you have the right to:",
          privacyPolicyYourRightsItem1: "Request access to your personal information",
          privacyPolicyYourRightsItem2: "Correct inaccuracies in your records",
          privacyPolicyYourRightsItem3: "Withdraw consent for non-essential uses",
          privacyPolicyYourRightsItem4: "Learn how your information is being used",
          privacyPolicyYourRightsContactIntro: "For assistance with any of these rights, please contact:",
          privacyPolicyYourRightsContactTitle:
            "Information and Privacy Officer, Ministry of Housing and Municipal Affairs",
          privacyPolicyYourRightsContactEmail: "Email: [Insert Contact]",
          privacyPolicyYourRightsContactPhone: "Phone: [Insert Contact]",
          privacyPolicyThirdPartyServicesAndIntegrations: "Third-Party Services and Integrations",
          privacyPolicyThirdPartyServicesAndIntegrationsDescription1:
            "Where the Building Permit Hub connects with third-party systems (e.g., LTSA, BCeID, BC Service Card, and others), information is shared strictly to support service delivery and is governed by inter-agency agreements and data-sharing policies.",
          privacyPolicyThirdPartyServicesAndIntegrationsDescription2:
            "We do not permit third parties to store or use your data for unrelated purposes.",
          privacyPolicyChangesToThisPolicy: "Changes to This Policy",
          privacyPolicyChangesToThisPolicyDescription:
            "This Privacy Policy may be updated from time to time to reflect changes in legislation, technology, or service delivery. Significant changes will be communicated via email and on this page.",
          privacyPolicyContactUs: "Contact Us",
          privacyPolicyContactUsDescription:
            "If you have questions about this policy or how your personal information is handled, please contact us at:",
          privacyPolicyContactUsTitle: "Ministry of Housing and Municipal Affairs",
          privacyPolicyContactUsAddress1: "PO Box 9071 Stn Prov Govt",
          privacyPolicyContactUsAddress2: "Victoria, BC V8W 9E2",
          privacyPolicyContactUsEmail: "Email:",
          privacyPolicyContactUsEmailAddress: "digital.codes.permits@gov.bc.ca",
          breadcrumb: {
            standardizationSetup: "Standardization setup",
            standardizationPreview: "Standardization preview",
            preCheck: "Pre-check",
            projects: "Projects",
            checkDigitalSeals: "Check digital seals",
            codeCompliance: "Code compliance",
            permitClassifications: "Permit classifications",
            documents: "Documents",
            checkStepCodeRequirements: "Check step code requirements",
            latest: "Latest",
            profile: "Profile",
            jurisdictions: "Jurisdictions",
            new: "Create new",
            privacyPolicy: "Privacy Policy",
            invite: "Invite",
            templateVersions: "Template versions",
            requirementsLibrary: "Requirements library",
            requirementTemplates: "Permit templates catalogue",
            edit: "Edit",
            users: "Users",
            editTemplate: "Edit template",
            editPermit: "Edit permit",
            permitApplications: "Permit applications",
            submissionInbox: "Submissions",
            configuration: "Configure jurisdiction",
            sucessfulSubmission: "Application submitted",
            stepCodes: "Step Codes",
            digitalBuildingPermits: "Configure permits",
            contact: "Contact us",
            configurationManagement: "Configuration",
            featureAccess: "Feature access",
            myJurisdictionAboutPage: "My jurisdiction's about page",
            accessControlForRevisionRequestsToSubmitters: "Access control for revision requests to submitters",
            limitWhoCanRequestRevisionsFromSubmitters: "Access control for revision requests to submitters",
            submissionInboxSetup: "Submissions inbox setup",
            energyStep: "Energy Step Code requirements",
            submissionsInboxSetup: "Submissions inbox setup",
            confirmed: "E-mail confirmed",
            welcome: "Welcome",
            sitewideMessage: "Site-Wide Message",
            apiSettings: "API settings",
            create: "Create",
            exportTemplates: "Export templates",
            reporting: "Reporting",
            exportTemplateSummary: "Export template summary",
            helpDrawerSetup: "Help drawer setup",
            revisionReasonsAttributesSetup: "Revision reason setup",
            apiMappings: "API mappings",
            manageMapping: "Manage mapping",
            revisionReasonSetup: "Revision reason setup",
            acceptInvitation: "Accept invitation",
            eula: "End user license agreement",
            earlyAccess: "Early access",
            update: "Update",
            globalFeatureAccess: "Global feature access",
            permitProjects: "Permit projects",
            projectReadinessTools: "Prepare and check your project documents",
            createYourLettersOfAssurance: "Create your Letters of Assurance",
            lookUpStepCodesRequirementsForYourProject: "Look up Step Codes requirements for your project",
            onboardingChecklistPageForLgAdopting: "Onboarding checklist page for LG adopting",
            stepCodeRequirements: "Step code requirements",
            start: "Start",
            select: "Select",
            resources: "Resources",
            preChecks: "Pre-checks",
          },
          earlyAccessStepCodePreviewNotAvailable: "Early access step code preview not available",
        },
        automatedCompliance: {
          baseMessage: `This field has Auto-Compliance capability`,
          defaultValueMessage: `Auto-Compliance found the default value to be "{{defaultValue}}".`,
          failedValueMessage: `Auto-Compliance was unable fill this field, please check with your local jurisdiction if this is required.`,
        },
        classification: {
          categories: {
            buildings_and_structures: "Buildings and Structures",
            trades: "Trades",
            site_preparation: "Site Preparation",
            other: "Other",
          },
        },
      },
    },
    // ... other languages
  },
  lng: "en", // default language
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  parseMissingKeyHandler: (key) => {
    // You can log the missing key, send it to a backend, etc.
    console.warn(`Missing translation key: ${key}`)
    return process.env.NODE_ENV === "development" ? `[Missing: ${key}]` : "—" // Custom fallback string
  },
}

i18n.use(initReactI18next).init(options)

export type TTranslationResources = (typeof options)["resources"]

export default i18n
