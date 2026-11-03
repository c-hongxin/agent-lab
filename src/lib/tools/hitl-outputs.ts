const WEATHER_OPTIONS = ["sunny", "cloudy", "rainy", "snowy"] as const;

// 批准后的假发布结果（不落库）。
export function fakePublishResult(title: string) {
  return {
    ok: true,
    id: `copy_${Date.now()}`,
    title,
    publishedAt: new Date().toISOString(),
  };
}

// 批准后的假试发回执（不真发信）。
export function fakeSendTestEmailResult(to: string, subject: string) {
  return {
    ok: true,
    messageId: `msg_${Date.now()}`,
    to,
    subject,
    sentAt: new Date().toISOString(),
  };
}

// HITL 练习页批准后的假天气结果。
export function fakeWeather() {
  return WEATHER_OPTIONS[Math.floor(Math.random() * WEATHER_OPTIONS.length)];
}
