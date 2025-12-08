# frozen_string_literal: true

# ClamAV virus scanning configuration
#
# ClamAV is accessed via TCP socket using the clamav-client gem.
# The daemon should be running and accessible at the configured host/port.
#
# Environment variables:
#   CLAM_AV_HOSTNAME  - The hostname of the ClamAV daemon (e.g., "clamav" or "clamav-service")
#   CLAM_AV_PORT - The port of the ClamAV daemon (default: 3310)

CLAMAV_ENABLED = ENV["CLAM_AV_HOSTNAME"].present?

CLAMAV_CONFIG = {
  host: ENV.fetch("CLAM_AV_HOSTNAME", "localhost"),
  port: ENV.fetch("CLAM_AV_PORT", 3310).to_i,
  # Connection timeout in seconds
  connect_timeout: 5,
  # Read/write timeout in seconds
  timeout: 300
}.freeze
