// Worker 入口文件
import { checkHealth } from './health';
import { selectSpace } from './router';
import { reportStatus } from './monitor';

// 空间配置
const SPACES = [
  {
    url: 'https://one887-ki88.hf.space',
    weight: 1,
    healthEndpoint: '/healthz'
  },
  {
    url: 'https://one887-ki882.hf.space',
    weight: 1,
    healthEndpoint: '/healthz'
  },
  {
    url: 'https://one887-ki883.hf.space',
    weight: 1,
    healthEndpoint: '/healthz'
  }
];

// 缓存健康状态
const HEALTH_CACHE_TTL = 30; // 30秒缓存
const healthCache = new Map();

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
      const response = await fetch(targetUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body
      });

      // 6. 返回响应
      return response;

    } catch (error) {
      // 错误报告
      await reportStatus('error', error.message);
      return new Response('Internal Server Error', { status: 500 });
    }
  },

  // 定时健康检查 - 每分钟执行一次
  async scheduled(event, env, ctx) {
    try {
      // 检查所有空间
      const results = await Promise.all(
        SPACES.map(async (space) => {
          const isHealthy = await checkHealth(space);
          return { space: space.url, healthy: isHealthy };
        })
      );

      // 更新健康状态缓存
      results.forEach(({ space, healthy }) => {
        healthCache.set(space, {
          healthy,
          timestamp: Date.now()
        });
      });

      // 如果所有空间都不健康，发送告警
      const healthyCount = results.filter(r => r.healthy).length;
      if (healthyCount === 0) {
        await reportStatus('error', 'All spaces are unhealthy!');
      } else if (healthyCount < SPACES.length) {
        await reportStatus('warning', `${SPACES.length - healthyCount} spaces are unhealthy`);
      }

    } catch (error) {
      console.error('Scheduled health check failed:', error);
    }
  }
}; 