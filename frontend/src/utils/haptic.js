export const haptic = (pattern = 30) => {
  if ("vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
};