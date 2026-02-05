// server/services/feedScore.js

export function calculateFeedScore(video) {
  const now = Date.now();

  // 🧱 BASE SCORE
  const views = Number(video.views || 0);
  const likes = Number(video.likes || 0);
  const watchTime = Number(video.watchTime || 0);

  const baseScore =
    views * 0.2 +
    likes * 1.5 +
    watchTime * 0.01;

  // 🚀 BOOST SCORE
  let boostScore = 0;
  if (
    video.boostTokens > 0 &&
    video.boostExpiresAt &&
    new Date(video.boostExpiresAt).getTime() > now
  ) {
    boostScore = Math.log(1 + video.boostTokens) * 5;
  }

  // 🕒 FRESHNESS SCORE (novější = lehký push)
  const ageHours =
    (now - new Date(video.createdAt).getTime()) / 36e5;

  const freshnessScore = Math.max(0, 48 - ageHours); // max 48h

  // ❄️ COOLING (anti-dominance)
  const impressions = Number(video.feedImpressions || 0);
  const coolingPenalty = impressions * 0.05;

  // 🎯 FINAL SCORE
  return Math.max(
    baseScore + boostScore + freshnessScore - coolingPenalty,
    0
  );
}