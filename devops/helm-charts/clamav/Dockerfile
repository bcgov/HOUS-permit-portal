FROM registry.access.redhat.com/ubi9/ubi
ARG VERSION=1.0.5

LABEL name="ubi9-clamav" \
      vendor="Red Hat" \
      version="${VERSION}" \
      release="1" \
      summary="UBI 9 ClamAV" \
      description="ClamAV for UBI 9" \
      maintainer="EPIC"

RUN yum -y update && \
    yum -y install \
      https://www.clamav.net/downloads/production/clamav-${VERSION}.linux.x86_64.rpm \
      nc \
      wget && \
    yum clean all && \
    rm -rf /var/cache/yum

# Create all required directories and files in a single layer
RUN mkdir -p /opt/app-root/src \
             /var/log/clamav \
             /var/run/clamav && \
    touch /var/log/clamav/clamav.log \
          /var/log/clamav/freshclam.log && \
    chgrp -R 0 /opt/app-root/src \
               /var/log/clamav \
               /var/run/clamav \
               /opt/app-root && \
    chmod -R g+rwx /opt/app-root/src \
                   /var/log/clamav \
                   /var/run/clamav \
                   /opt/app-root

# Copy configs — must be LF line endings, not CRLF
COPY config/clamd.conf /usr/local/etc/clamd.conf
COPY config/freshclam.conf /usr/local/etc/freshclam.conf

# Copy scripts
COPY scripts/clamdcheck.sh /opt/app-root/clamdcheck.sh
COPY scripts/entrypoint.sh /opt/app-root/entrypoint.sh

RUN chmod ug+rx /opt/app-root/clamdcheck.sh \
                /opt/app-root/entrypoint.sh

USER 1001

EXPOSE 3310

CMD ["/opt/app-root/entrypoint.sh"]