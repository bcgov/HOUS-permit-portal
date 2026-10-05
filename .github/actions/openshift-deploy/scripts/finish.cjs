module.exports = async ({ github, context, core, env = process.env }) => {
  const deploymentId = Number(env.DEPLOYMENT_ID)
  if (!Number.isSafeInteger(deploymentId) || deploymentId <= 0) {
    throw new Error("Invalid deployment ID")
  }
  const state = env.DEPLOY_STATUS
  if (state !== "success" && state !== "failure") {
    throw new Error("Invalid deployment status")
  }
  await github.rest.repos.createDeploymentStatus({
    ...context.repo,
    deployment_id: deploymentId,
    state,
    description: env.DEPLOY_DESCRIPTION,
    log_url: env.DEPLOY_LOG_URL,
    environment_url: state === "success" ? env.DEPLOY_ENV_URL : "",
    auto_inactive: false,
  })
  if (state !== "success") return

  try {
    const { data: current } = await github.rest.repos.getDeployment({
      ...context.repo,
      deployment_id: deploymentId,
    })
    const currentTime = Date.parse(current.created_at)
    if (!Number.isFinite(currentTime)) throw new Error("Invalid deployment creation time")
    for await (const { data: deployments } of github.paginate.iterator(github.rest.repos.listDeployments, {
      ...context.repo,
      environment: env.DEPLOY_ENVIRONMENT,
      per_page: 100,
    })) {
      for (const deployment of deployments) {
        const time = Date.parse(deployment.created_at)
        const older = time < currentTime || (time === currentTime && deployment.id < deploymentId)
        if (deployment.id === deploymentId || deployment.environment !== env.DEPLOY_ENVIRONMENT || !older) continue
        try {
          const { data: statuses } = await github.rest.repos.listDeploymentStatuses({
            ...context.repo,
            deployment_id: deployment.id,
            per_page: 1,
          })
          if (statuses[0]?.state !== "success") continue
          await github.rest.repos.createDeploymentStatus({
            ...context.repo,
            deployment_id: deployment.id,
            state: "inactive",
            auto_inactive: false,
          })
        } catch (error) {
          core.warning(`Could not retire deployment ${deployment.id}: ${error.message}`)
        }
      }
    }
  } catch (error) {
    core.warning(`Could not clean up older deployments: ${error.message}`)
  }
}
