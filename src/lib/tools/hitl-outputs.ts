const WEATHER_OPTIONS = ["sunny", "cloudy", "rainy", "snowy"] as const;

/** HITL 批准后的假成功结果（不落库、不真发信） */
export function fakePublishResult(title: string) {
  return {
    ok: true,
    id: `copy_${Date.now()}`,
    title,
    publishedAt: new Date().toISOString(),
  };
}

export function fakeSendTestEmailResult(to: string, subject: string) {
  return {
    ok: true,
    messageId: `msg_${Date.now()}`,
    to,
    subject,
    sentAt: new Date().toISOString(),
  };
}

export function fakeWeather() {
  return WEATHER_OPTIONS[Math.floor(Math.random() * WEATHER_OPTIONS.length)];
}
