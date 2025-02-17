// 监控和告警实现
export async function reportStatus(level, message) {
  try {
    // 1. 基础日志记录
    console.log(`[${level.toUpperCase()}] ${JSON.stringify(message)}`);

    // 2. 发送告警通知
    if (level === 'error' || level === 'warning') {
      await sendAlert(level, message);
    }

    // 3. 记录监控指标
    await recordMetrics(level, message);

  } catch (error) {
    console.error('Failed to report status:', error);
  }
}

// 发送告警
async function sendAlert(level, message) {
  // 支持多种通知渠道
  const channels = [
    sendFeishuAlert,
    sendDiscordAlert,
    sendEmailAlert
  ];

  // 并行发送所有通知
  await Promise.all(channels.map(channel => 
    channel(level, message).catch(err => 
      console.error(`Alert channel failed:`, err)
    )
  ));
}

// 飞书通知
async function sendFeishuAlert(level, message) {
  const FEISHU_WEBHOOK = 'https://open.larksuite.com/open-apis/bot/v2/hook/4a578774-1a64-4dd6-8cd5-a0106e6d438b';
  
  const color = {
    error: 'red',
    warning: 'yellow',
    info: 'blue'
  }[level] || 'grey';

  const payload = {
    msg_type: "interactive",
    card: {
      header: {
        title: {
          tag: "plain_text",
          content: `N8N Worker ${level.toUpperCase()} Alert`
        },
        template: color
      },
      elements: [
        {
          tag: "div",
          text: {
            tag: "plain_text",
            content: typeof message === 'string' ? message : JSON.stringify(message, null, 2)
          }
        },
        {
          tag: "hr"
        },
        {
          tag: "note",
          elements: [
            {
              tag: "plain_text",
              content: `Time: ${new Date().toISOString()}`
            }
          ]
        }
      ]
    }
  };

  await fetch(FEISHU_WEBHOOK, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

// Discord 通知
async function sendDiscordAlert(level, message) {
  const DISCORD_WEBHOOK = 'YOUR_DISCORD_WEBHOOK_URL';
  
  const payload = {
    embeds: [{
      title: `N8N Worker ${level.toUpperCase()} Alert`,
      description: typeof message === 'string' ? message : JSON.stringify(message, null, 2),
      color: {
        error: 0xFF0000,
        warning: 0xFFFF00,
        info: 0x0000FF
      }[level] || 0x808080,
      timestamp: new Date().toISOString()
    }]
  };

  await fetch(DISCORD_WEBHOOK, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

// 邮件通知
async function sendEmailAlert(level, message) {
  // 实现邮件发送逻辑
  // 可以使用 SendGrid、Mailgun 等服务
}

// 记录监控指标
async function recordMetrics(level, message) {
  // 可以将指标发送到监控系统
  // 例如 Prometheus、DataDog 等
} 