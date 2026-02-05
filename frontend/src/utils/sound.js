export const playSound = (src, volume = 1) => {
  try {
    const audio = new Audio(src);
    audio.volume = volume;
    audio.play().catch(() => {});
  } catch (e) {
    console.warn("Sound blocked:", e);
  }
};