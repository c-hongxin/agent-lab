const WEATHER_OPTIONS = ["sunny", "cloudy", "rainy", "snowy"] as const;

// Fake publish result after approval (not persisted).
export function fakePublishResult(title: string) {
  return {
    ok: true,
    id: `copy_${Date.now()}`,
    title,
    publishedAt: new Date().toISOString(),
  };
}

// Fake test-email receipt after approval (no real send).
export function fakeSendTestEmailResult(to: string, subject: string) {
  return {
    ok: true,
    messageId: `msg_${Date.now()}`,
    to,
    subject,
    sentAt: new Date().toISOString(),
  };
}

// Fake weather after approval on the HITL practice page.
export function fakeWeather() {
  return WEATHER_OPTIONS[Math.floor(Math.random() * WEATHER_OPTIONS.length)];
}
