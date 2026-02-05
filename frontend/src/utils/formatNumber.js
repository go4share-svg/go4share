export const formatNumber = (num) => {
  if (num < 1000) return num.toString();

  if (num < 1_000_000) {
    return (num / 1000).toFixed(1).replace(".0", "") + "k";
  }

  if (num < 1_000_000_000) {
    return (num / 1_000_000).toFixed(1).replace(".0", "") + "M";
  }

  return (num / 1_000_000_000).toFixed(1).replace(".0", "") + "B";
};