// 路由策略实现
export function selectSpace(healthySpaces) {
  if (!healthySpaces || healthySpaces.length === 0) {
    throw new Error('No healthy spaces available');
  }

  // 1. 加权随机选择
  const totalWeight = healthySpaces.reduce((sum, space) => sum + space.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const space of healthySpaces) {
    random -= space.weight;
    if (random <= 0) {
      return space;
    }
  }

  // 兜底返回第一个健康的空间
  return healthySpaces[0];
}

// 高级路由策略
export function advancedSelectSpace(healthySpaces, request) {
  // 1. 获取请求信息
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // 2. 特定路径的路由规则
  if (path.startsWith('/webhook')) {
    // Webhook 请求优先选择负载较低的空间
    return selectLeastLoadedSpace(healthySpaces);
  }

  if (path.startsWith('/api/v1/workflows')) {
    // 工作流执行请求使用一致性哈希
    return selectSpaceByHash(healthySpaces, path);
  }

  // 3. 默认使用加权随机
  return selectSpace(healthySpaces);
}

// 选择负载最低的空间
function selectLeastLoadedSpace(spaces) {
  return spaces.reduce((min, space) => {
    if (!min || space.metrics?.load < min.metrics?.load) {
      return space;
    }
    return min;
  });
}

// 一致性哈希选择
function selectSpaceByHash(spaces, key) {
  const hash = simpleHash(key);
  const index = hash % spaces.length;
  return spaces[index];
}

// 简单的哈希函数
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
} 