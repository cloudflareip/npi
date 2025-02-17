// 空间配置
const SPACES = [
  {
    url: 'https://one887-ki88.hf.space',
    weight: 1
  },
  {
    url: 'https://one887-ki882.hf.space',
    weight: 1
  },
  {
    url: 'https://one887-ki883.hf.space',
    weight: 1
  }
];

// 缓存配置
const HEALTH_CACHE_TTL = 30; // 30秒缓存
const healthCache = new Map();

// 健康检查
async function checkHealth(space) {
  try {
    const response = await fetch(`${space.url}/api/v1/health`, {
      method: 'GET',
      headers: {
        'User-Agent': 'N8N-Worker-HealthCheck/1.0'
      },
      timeout: 5000
    });
    return response.ok;
  } catch (error) {
    console.error(`Health check failed for ${space.url}:`, error);
    return false;
  }
}

// 选择空间
function selectSpace(healthySpaces) {
  if (!healthySpaces || healthySpaces.length === 0) {
    throw new Error('No healthy spaces available');
  }
  return healthySpaces[Math.floor(Math.random() * healthySpaces.length)];
}

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