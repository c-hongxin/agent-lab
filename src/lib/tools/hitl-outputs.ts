const WEATHER_OPTIONS = ["sunny", "cloudy", "rainy", "snowy"] as const;

// 确认发布后写入的假结果，不落库。
export function fakePublishResult(title: string) {
  return {
    ok: true,
    id: `copy_${Date.now()}`,
    title,
    publishedAt: new Date().toISOString(),
  };
}

// 确认试发后写入的假回执，不真发信。
export function fakeSendTestEmailResult(to: string, subject: string) {
  return {
    ok: true,
    messageId: `msg_${Date.now()}`,
    to,
    subject,
    sentAt: new Date().toISOString(),
  };
}

// HITL 练习页里 getWeather 被用户确认后返回的假天气。
export function fakeWeather() {
  return WEATHER_OPTIONS[Math.floor(Math.random() * WEATHER_OPTIONS.length)];
}
