# [AUDITED VIBES TODO]: Configure audited gem defaults
#
# The audited gem automatically captures the current_user in Rails controllers
# via Audited::Sweeper (included by default in ActionController::Base).
#
# After adding the gem, run:
#   bundle install
#   rails generate audited:install
#   rails db:migrate
#
# This will create the `audits` table used by ProjectActivityService to
# power the activity feed. See the Activity Feed Event Trigger Reference
# for the full list of events captured.
#
# Docs: https://github.com/collectiveidea/audited

Audited.config do |config|
  # [AUDITED VIBES TODO]: Tune these settings as needed
  # config.max_audits = 100  # limit audits per record if desired
end
