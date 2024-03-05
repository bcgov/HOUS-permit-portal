#!/bin/bash
# Start the CSA service
csa-service start

# Prevent the openshift container from "Completing"
tail -f /dev/null
