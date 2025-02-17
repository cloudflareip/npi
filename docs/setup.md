# N8N Worker 部署指南

本文档详细说明如何部署和配置 N8N Worker。

## 前置条件

1. Cloudflare 账号
2. 已配置的域名
3. N8N 实例部署在 Huggingface Spaces

## 部署步骤

### 1. 配置 Cloudflare Workers

1. 登录 Cloudflare Dashboard
2. 创建新的 Worker
3. 复制 `src/index.js` 内容到 Worker 编辑器

### 2. 配置空间信息

修改 `config/spaces.json`:

```json
{
  "spaces": [
    {
      "url": "https://your-space-1.hf.space",
      "weight": 1,
      "healthEndpoint": "/healthz"
    },
    {
      "url": "https://your-space-2.hf.space",
      "weight": 1,
      "healthEndpoint": "/healthz"
    }
  ]
}
```

### 3. 配置告警通知

1. 创建飞书/Discord Webhook
2. 在 Worker 设置中添加环境变量:
   - `FEISHU_WEBHOOK_URL`
   - `DISCORD_WEBHOOK_URL`

### 4. 配置域名

1. 在 Cloudflare DNS 添加记录
2. 将域名指向 Worker

### 5. 配置健康检查

1. 在 Worker 设置中添加定时触发器
2. 推荐每 1 分钟执行一次

## 验证部署

1. 访问你的域名
2. 检查负载均衡是否正常工作
3. 测试健康检查和故障转移
4. 验证告警通知

## 故障排除

### 常见问题

1. 健康检查失败
   - 检查空间状态
   - 验证健康检查端点
   - 检查网络连接

2. 告警未收到
   - 验证 Webhook URL
   - 检查环境变量配置
   - 查看 Worker 日志

3. 路由异常
   - 检查域名配置
   - 验证 Worker 路由规则
   - 检查请求日志

## 监控和维护

1. 定期检查:
   - Worker 状态
   - 空间健康状况
   - 告警配置
   - 日志记录

2. 性能优化:
   - 调整缓存策略
   - 优化路由规则
   - 监控资源使用

## 安全建议

1. 启用 Cloudflare 安全功能
2. 定期更新 Webhook 密钥
3. 监控异常访问
4. 配置访问控制 