# N8N Worker - 多空间负载均衡器

这是一个基于 Cloudflare Workers 的负载均衡器,用于管理多个 N8N Huggingface Space 实例。

## 功能特性

- 智能负载均衡
- 自动健康检查
- 故障自动转移
- 监控告警集成
- 全球边缘分发

## 目录结构
```
n8n-Worker/
├── src/                    # 源代码
│   ├── index.js           # Worker 主入口
│   ├── health.js          # 健康检查逻辑
│   ├── router.js          # 路由策略
│   └── monitor.js         # 监控告警
├── config/                 # 配置文件
│   └── spaces.json        # 空间配置
├── test/                  # 测试文件
└── docs/                  # 文档
    ├── setup.md          # 部署指南
    └── monitoring.md     # 监控指南
```

## 快速开始

1. 克隆仓库
2. 修改 config/spaces.json 配置
3. 部署到 Cloudflare Workers

## 详细文档

- [部署指南](docs/setup.md)
- [监控指南](docs/monitoring.md) 