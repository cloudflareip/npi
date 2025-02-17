// 简化后的健康检查逻辑
export async function checkHealth(space) {
  try {
    // 1. 检查 n8n API 是否可访问
    const apiCheck = await fetch(`${space.url}/api/v1/health`, {
      method: 'GET',
      headers: {
        'User-Agent': 'N8N-Worker-HealthCheck/1.0'
      },
      timeout: 5000
    });

    if (!apiCheck.ok) {
      console.error(`API health check failed for ${space.url}`);
      return false;
    }

    // 2. 验证响应内容
    const healthData = await apiCheck.json();
    
    // 只要能访问并返回正常响应，就认为服务健康
    return true;

  } catch (error) {
    console.error(`Health check failed for ${space.url}:`, error);
    return false;
  }
}

// 高级健康检查 (可选)
export async function deepHealthCheck(space) {
  try {
    const results = {
      basic: false,
      api: false,
      workflow: false,
      database: false,
      metrics: {}
    };

    // 1. 基础检查
    results.basic = await checkHealth(space);

    // 2. API 响应时间
    const apiStart = Date.now();
    await fetch(`${space.url}/api/v1/health`);
    results.metrics.apiLatency = Date.now() - apiStart;

    // 3. 工作流执行测试
    const workflowCheck = await fetch(`${space.url}/api/v1/workflows/health-check`, {
      method: 'POST'
    });
    results.workflow = workflowCheck.ok;

    // 4. 收集性能指标
    const metrics = await fetch(`${space.url}/api/v1/metrics`);
    if (metrics.ok) {
      const metricsData = await metrics.json();
      results.metrics = {
        ...results.metrics,
        ...metricsData
      };
    }

    return results;

  } catch (error) {
    console.error(`Deep health check failed for ${space.url}:`, error);
    return null;
  }
} 