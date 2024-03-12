FROM ubuntu:20.04

# Update system and install necessary packages
RUN apt-get update && \
    apt-get install -y lsb-release fontconfig xfonts-base xfonts-100dpi xfonts-75dpi xfonts-cyrillic wget net-tools && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set environment variables
ENV CSA_HOME=/opt/consigno-server-automation \
    CSA_WORKING_DIR=/tmp/csaworkingdir \
    CSA_WEBSERVICES_ENABLED=true \
    CSA_PDFA_LIB=/usr/lib/pdfalib/lib
    # These are injected by vault annotations in the Openshift pod
    # CSA_LICENSE=
    # CSA_SIGNATURE_KEY=

# Copy CSA and PDF/A lib packages into the container
COPY consigno-server-automation-2.16.9-unix-x64.tar.gz /opt/
COPY pdfalib-14.2.612-unix-x64.tar.gz /usr/lib/

# Unpack the CSA package
RUN tar -xf /opt/consigno-server-automation-2.16.9-unix-x64.tar.gz -C /opt/ && \
    rm /opt/consigno-server-automation-2.16.9-unix-x64.tar.gz

# Modify logging to output to SYSTEM_OUT (so we can get logs in the foreground)
COPY log4j.xml /opt/consigno-server-automation/conf/log4j.xml
COPY logback.xml /opt/consigno-server-automation/conf/logback.xml

# Unpack the PDF/A lib package
RUN tar -xf /usr/lib/pdfalib-14.2.612-unix-x64.tar.gz -C /usr/lib/ && \
    rm /usr/lib/pdfalib-14.2.612-unix-x64.tar.gz
    
# Create and set permissions for the CSA directories
RUN chmod -R 777 /opt/consigno-server-automation
RUN mkdir -p /.consigno-api/acl && \
    chmod -R 777 /.consigno-api

# Set up the PATH
ENV PATH=${CSA_HOME}/bin:${PATH}

COPY entrypoint.sh /
ENTRYPOINT ["./entrypoint.sh"]

# See Entrypoint script above since we want to start in foreground we won't use csa-service start
# CMD ["csa-service", "start"]

# Expose any ports your application needs
EXPOSE 8080
