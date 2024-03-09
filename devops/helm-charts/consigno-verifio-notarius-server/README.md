# Setting up Cosigno Server (Notarius)

To use the HELM chart, first build and push the consigno image to the imagestream

## Build the Docker Image / Push it to Registry

Build using linux/amd64
`docker buildx build --platform linux/amd64 -t consigno-server-automation:latest .`

Login to Openshift and then once logged in, login to the registry with Docker
`docker login -u $(oc whoami) -p $(oc whoami -t) image-registry.apps.silver.devops.gov.bc.ca`

Tag the image
docker tag consigno-server-automation image-registry.apps.silver.devops.gov.bc.ca/bb18ab-dev/consigno-server-automation

Push the image
docker push image-registry.apps.silver.devops.gov.bc.ca/bb18ab-dev/consigno-server-automation

2. Deploy this HELM chart, it will source secrets from the vault for Consigno Server
