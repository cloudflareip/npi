// 这个文件会自动从 src 目录编译生成
import { checkHealth } from '../src/health.js'
import { selectSpace } from '../src/router.js'
import { reportStatus } from '../src/monitor.js'

// Worker 配置
export default {
  async fetch(request, env, ctx) {
    try {
      // 1. 健康检查
      const now = Date.now();
      const healthySpaces = [];
      
      for (const space of SPACES) {
        // 检查缓存
        const cachedHealth = healthCache.get(space.url);
        if (cachedHealth && (now - cachedHealth.timestamp) < HEALTH_CACHE_TTL * 1000) {
          if (cachedHealth.healthy) {
            healthySpaces.push(space);
          }
          continue;
        }

        // 执行健康检查
        const isHealthy = await checkHealth(space);
        healthCache.set(space.url, {
          healthy: isHealthy,
          timestamp: now
        });

        if (isHealthy) {
          healthySpaces.push(space);
        }
      }

      // 2. 没有健康的空间
      if (healthySpaces.length === 0) {
        await reportStatus('error', 'All spaces are unhealthy');
        return new Response('Service Unavailable', { status: 503 });
      }

      // 3. 选择目标空间
      const targetSpace = selectSpace(healthySpaces);

      // 4. 构建转发请求
      const url = new URL(request.url);
      const targetUrl = targetSpace.url + url.pathname + url.search;

      // 5. 转发请求
      return fetch(targetUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }
}; 