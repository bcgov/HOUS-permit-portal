{{/* Generate basic labels */}}
{{- define "matomo.labels" }}
  labels:
    app.kubernetes.io/name: {{ .name }}
    app.kubernetes.io/instance: {{ .instance }}
    app.kubernetes.io/component: {{ .component }}
    app.kubernetes.io/part-of: {{ .partOf }}
    app.kubernetes.io/managed-by: {{ .managedBy }}
{{- end }}

{{- define "matomo.images.pullSecrets" -}}
  {{- $pullSecrets := list }}

  {{- if .global }}
    {{- range .global.imagePullSecrets -}}
      {{- $pullSecrets = append $pullSecrets . -}}
    {{- end -}}
  {{- end -}}

  {{- range .images -}}
    {{- range .imagePullSecrets -}}
      {{- $pullSecrets = append $pullSecrets . -}}
    {{- end -}}
  {{- end -}}

  {{- if (not (empty $pullSecrets)) }}
imagePullSecrets:
    {{- range $pullSecrets }}
  - name: {{ . }}
    {{- end }}
  {{- end }}
{{- end -}}

{{- define "matomo.image" -}}
{{- $registry := .registry | default "" -}}
{{- $image := .image | default "" -}}
{{- if $registry -}}
{{- printf "%s/%s" (trimSuffix "/" $registry) (trimPrefix "/" $image) -}}
{{- else -}}
{{- $image -}}
{{- end -}}
{{- end -}}

{{- define "matomo.resources" -}}
{{- $resources := .resources | default .defaultResources -}}
{{- if $resources }}
resources:
{{ toYaml $resources | indent 2 }}
{{- end -}}
{{- end -}}

{{/* Render 1/0 for Matomo ini/json booleans */}}
{{- define "matomo.bool01" -}}
{{- if . -}}1{{- else -}}0{{- end -}}
{{- end -}}

{{/*
  Optional runAsUser for OpenShift restricted SCC (omit when null/empty).
  Usage: include "matomo.securityContext" (dict "runAsUser" .Values.matomo.runAsUser)
*/}}
{{- define "matomo.securityContext" -}}
securityContext:
  privileged: false
  allowPrivilegeEscalation: false
  {{- if or (kindIs "float64" .runAsUser) (kindIs "int" .runAsUser) (kindIs "int64" .runAsUser) }}
  runAsUser: {{ .runAsUser }}
  {{- end }}
{{- end -}}

{{/*
  Privacy Manager + shared General settings written to common.config.ini.php.
  Matomo merges this file on every request and CLI invocation.
*/}}
{{- define "matomo.commonConfigIni" -}}
{{- $privacy := .Values.matomo.privacy | default dict -}}
{{- $deleteLogs := $privacy.deleteLogs | default dict -}}
{{- $deleteReports := $privacy.deleteReports | default dict -}}
; <?php exit; ?> DO NOT REMOVE THIS LINE
; This file is managed by the Matomo Helm chart.
; Privacy purge + shared runtime settings (override config.ini.php).

[General]
proxy_client_headers[] = "HTTP_X_FORWARDED_FOR"
assume_secure_protocol = 1
browser_archiving_disabled_enforce = 1
enable_browser_archiving_triggering = 0
archiving_range_force_on_browser_request = 0
enable_sql_optimize_queries = 0
proxy_ips[] = "10.0.0.0/8"
proxy_ips[] = "172.16.0.0/12"
proxy_ips[] = "192.168.0.0/16"

{{- /*
  [Plugins]/[PluginsInstalled] must be identical across every pod (dashboard,
  tracker, cli, cronjobs). Each pod gets its own emptyDir webroot, and
  matomo.init only ever writes [database]/[General] into config.ini.php — so
  without this, only the dashboard pod (where the install wizard ran and
  Matomo wrote these sections back to its own local config.ini.php) has a
  working plugin list. Every other pod's Tracker::loadTrackerPlugins() treats
  every plugin as "not installed" (Plugin\Manager::isPluginInstalled() reads
  [PluginsInstalled]), so isTrackerPlugin() returns false for all of them,
  including CoreHome — which is what actually inserts rows into log_visit.
  Symptom: matomo.php returns 200/204 and looks fine, but no visit is ever
  recorded, because the Tracker context ends up running with zero plugins
  wired in beyond whatever survives the "not to load" filtering.
*/}}
[Plugins]
Plugins[] = "CoreVue"
Plugins[] = "CorePluginsAdmin"
Plugins[] = "CoreAdminHome"
Plugins[] = "CoreHome"
Plugins[] = "WebsiteMeasurable"
Plugins[] = "IntranetMeasurable"
Plugins[] = "Diagnostics"
Plugins[] = "CoreVisualizations"
Plugins[] = "Proxy"
Plugins[] = "API"
Plugins[] = "Widgetize"
Plugins[] = "Transitions"
Plugins[] = "LanguagesManager"
Plugins[] = "Actions"
Plugins[] = "Dashboard"
Plugins[] = "MultiSites"
Plugins[] = "Referrers"
Plugins[] = "UserLanguage"
Plugins[] = "DevicesDetection"
Plugins[] = "Goals"
Plugins[] = "Ecommerce"
Plugins[] = "SEO"
Plugins[] = "Events"
Plugins[] = "UserCountry"
Plugins[] = "GeoIp2"
Plugins[] = "VisitsSummary"
Plugins[] = "VisitFrequency"
Plugins[] = "VisitTime"
Plugins[] = "VisitorInterest"
Plugins[] = "RssWidget"
Plugins[] = "Feedback"
Plugins[] = "Monolog"
Plugins[] = "Login"
Plugins[] = "TwoFactorAuth"
Plugins[] = "UsersManager"
Plugins[] = "SitesManager"
Plugins[] = "Installation"
Plugins[] = "CoreUpdater"
Plugins[] = "CoreConsole"
Plugins[] = "ScheduledReports"
Plugins[] = "UserCountryMap"
Plugins[] = "Live"
Plugins[] = "PrivacyManager"
Plugins[] = "ImageGraph"
Plugins[] = "Annotations"
Plugins[] = "MobileMessaging"
Plugins[] = "Overlay"
Plugins[] = "SegmentEditor"
Plugins[] = "Insights"
Plugins[] = "Morpheus"
Plugins[] = "Contents"
Plugins[] = "BulkTracking"
Plugins[] = "Resolution"
Plugins[] = "DevicePlugins"
Plugins[] = "Heartbeat"
Plugins[] = "Intl"
Plugins[] = "Marketplace"
Plugins[] = "ProfessionalServices"
Plugins[] = "UserId"
Plugins[] = "CustomJsTracker"
Plugins[] = "Tour"
Plugins[] = "PagePerformance"
Plugins[] = "CustomDimensions"
Plugins[] = "JsTrackerInstallCheck"
Plugins[] = "FeatureFlags"
Plugins[] = "AIAgents"
Plugins[] = "BotTracking"
Plugins[] = "TagManager"

[PluginsInstalled]
PluginsInstalled[] = "Diagnostics"
PluginsInstalled[] = "Login"
PluginsInstalled[] = "CoreAdminHome"
PluginsInstalled[] = "UsersManager"
PluginsInstalled[] = "SitesManager"
PluginsInstalled[] = "Installation"
PluginsInstalled[] = "Monolog"
PluginsInstalled[] = "Intl"
PluginsInstalled[] = "JsTrackerInstallCheck"
PluginsInstalled[] = "CoreVue"
PluginsInstalled[] = "CorePluginsAdmin"
PluginsInstalled[] = "CoreHome"
PluginsInstalled[] = "WebsiteMeasurable"
PluginsInstalled[] = "IntranetMeasurable"
PluginsInstalled[] = "CoreVisualizations"
PluginsInstalled[] = "Proxy"
PluginsInstalled[] = "API"
PluginsInstalled[] = "Widgetize"
PluginsInstalled[] = "Transitions"
PluginsInstalled[] = "LanguagesManager"
PluginsInstalled[] = "Actions"
PluginsInstalled[] = "Dashboard"
PluginsInstalled[] = "MultiSites"
PluginsInstalled[] = "Referrers"
PluginsInstalled[] = "UserLanguage"
PluginsInstalled[] = "DevicesDetection"
PluginsInstalled[] = "Goals"
PluginsInstalled[] = "Ecommerce"
PluginsInstalled[] = "SEO"
PluginsInstalled[] = "Events"
PluginsInstalled[] = "UserCountry"
PluginsInstalled[] = "GeoIp2"
PluginsInstalled[] = "VisitsSummary"
PluginsInstalled[] = "VisitFrequency"
PluginsInstalled[] = "VisitTime"
PluginsInstalled[] = "VisitorInterest"
PluginsInstalled[] = "RssWidget"
PluginsInstalled[] = "Feedback"
PluginsInstalled[] = "TwoFactorAuth"
PluginsInstalled[] = "CoreUpdater"
PluginsInstalled[] = "CoreConsole"
PluginsInstalled[] = "ScheduledReports"
PluginsInstalled[] = "UserCountryMap"
PluginsInstalled[] = "Live"
PluginsInstalled[] = "PrivacyManager"
PluginsInstalled[] = "ImageGraph"
PluginsInstalled[] = "Annotations"
PluginsInstalled[] = "MobileMessaging"
PluginsInstalled[] = "Overlay"
PluginsInstalled[] = "SegmentEditor"
PluginsInstalled[] = "Insights"
PluginsInstalled[] = "Morpheus"
PluginsInstalled[] = "Contents"
PluginsInstalled[] = "BulkTracking"
PluginsInstalled[] = "Resolution"
PluginsInstalled[] = "DevicePlugins"
PluginsInstalled[] = "Heartbeat"
PluginsInstalled[] = "Marketplace"
PluginsInstalled[] = "ProfessionalServices"
PluginsInstalled[] = "UserId"
PluginsInstalled[] = "CustomJsTracker"
PluginsInstalled[] = "Tour"
PluginsInstalled[] = "PagePerformance"
PluginsInstalled[] = "CustomDimensions"
PluginsInstalled[] = "FeatureFlags"
PluginsInstalled[] = "AIAgents"
PluginsInstalled[] = "BotTracking"
PluginsInstalled[] = "TagManager"

[Deletelogs]
delete_logs_enable = {{ include "matomo.bool01" ($deleteLogs.enable | default true) }}
delete_logs_schedule_lowest_interval = {{ $deleteLogs.scheduleLowestInterval | default 1 }}
delete_logs_older_than = {{ $deleteLogs.olderThanDays | default 180 }}
delete_logs_max_rows_per_query = {{ $deleteLogs.maxRowsPerQuery | default 100000 }}
enable_auto_database_size_estimate = {{ include "matomo.bool01" ($deleteLogs.enableAutoDatabaseSizeEstimate | default true) }}
enable_database_size_estimate = {{ include "matomo.bool01" ($deleteLogs.enableDatabaseSizeEstimate | default true) }}

[Deletereports]
delete_reports_enable = {{ include "matomo.bool01" ($deleteReports.enable | default true) }}
delete_reports_older_than = {{ $deleteReports.olderThanMonths | default 12 }}
delete_reports_keep_basic_metrics = {{ include "matomo.bool01" ($deleteReports.keepBasicMetrics | default true) }}
delete_reports_keep_day_reports = {{ include "matomo.bool01" ($deleteReports.keepDayReports | default false) }}
delete_reports_keep_week_reports = {{ include "matomo.bool01" ($deleteReports.keepWeekReports | default false) }}
delete_reports_keep_month_reports = {{ include "matomo.bool01" ($deleteReports.keepMonthReports | default true) }}
delete_reports_keep_year_reports = {{ include "matomo.bool01" ($deleteReports.keepYearReports | default true) }}
delete_reports_keep_range_reports = {{ include "matomo.bool01" ($deleteReports.keepRangeReports | default false) }}
delete_reports_keep_segment_reports = {{ include "matomo.bool01" ($deleteReports.keepSegmentReports | default false) }}
{{- end -}}

{{- define "matomo.init" -}}
{{- $initResources := .Values.matomo.initResources | default dict -}}
initContainers:
  - name: matomo-init
    image: {{ include "matomo.image" (dict "registry" (.Values.matomo.imageRegistry | default .Values.global.imageRegistry) "image" .Values.matomo.image) }}
    {{- include "matomo.securityContext" (dict "runAsUser" .Values.matomo.runAsUser) | nindent 4 }}
    imagePullPolicy: Always
    env:
    - name: MATOMO_FIRST_USER_NAME
      value: {{ .Values.matomo.dashboard.firstuser.username | quote }}
    - name: MATOMO_FIRST_USER_EMAIL
      value: {{ .Values.matomo.dashboard.firstuser.email | quote }}
    - name: MATOMO_FIRST_USER_PASSWORD
      value: {{ .Values.matomo.dashboard.firstuser.password | quote }}
    - name: MATOMO_DB_HOST
      value: {{ .Values.db.hostname | quote }}
    - name: MATOMO_DB_NAME
      value: {{ .Values.db.name | quote }}
{{- if .Values.db.prefix }}
    - name: MATOMO_DB_PREFIX
      value: {{ .Values.db.prefix | quote }}
{{- end }}
    - name: MATOMO_DB_USERNAME
      value: {{ .Values.db.username | quote }}
    - name: MATOMO_DB_PASSWORD
      valueFrom:
        secretKeyRef:
          name: {{ .Values.db.password.secretKeyRef.name }}
          key: {{ .Values.db.password.secretKeyRef.key }}
{{- include "matomo.license" . | nindent 4 }}
    command:
      - sh
      - -ec
      - |
        mkdir -p /var/www/html/config
        if [ ! -f /var/www/html/config/config.ini.php ]; then
          cat > /var/www/html/config/config.ini.php <<EOF
        ; <?php exit; ?> DO NOT REMOVE THIS LINE
        [database]
        host = "{{ .Values.db.hostname }}"
        username = "{{ .Values.db.username }}"
        password = "${MATOMO_DB_PASSWORD}"
        dbname = "{{ .Values.db.name }}"
        tables_prefix = "{{ .Values.db.prefix }}"

        [General]
        proxy_client_headers[] = "HTTP_X_FORWARDED_FOR"
        assume_secure_protocol = 1
        EOF
        fi
        cp -R /usr/src/matomo/. /var/www/html/
        # Ensure shared chart-managed config is present even before volume mounts
        # (CLI jobs that only use the emptyDir still get purge settings).
        if [ -f /tmp/matomo/common.config.ini.php ]; then
          cp /tmp/matomo/common.config.ini.php /var/www/html/config/common.config.ini.php
        fi
    {{- if $initResources }}
    resources:
{{ toYaml $initResources | indent 6 }}
    {{- else }}
    resources:
      limits:
        cpu: 500m
        memory: 512Mi
      requests:
        cpu: 100m
        memory: 128Mi
    {{- end }}
    volumeMounts:
      - name: static-data
        mountPath: /var/www/html
      - name: matomo-configuration
        mountPath: /tmp/matomo/
        readOnly: true
{{- end -}}

{{- define "matomo.license" }}
{{- if .Values.matomo.license }}
- name: MATOMO_LICENSE
  valueFrom:
    secretKeyRef:
      name: {{ .Values.matomo.license.secretKeyRef.name }}
      key: {{ .Values.matomo.license.secretKeyRef.key }}
{{- end -}}
{{- end -}}
