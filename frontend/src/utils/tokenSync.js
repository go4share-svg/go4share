export const updateTokens = (newTotal) => {
  localStorage.setItem("userTokens", String(newTotal));
};

export const getTokens = () => {
  return Number(localStorage.getItem("userTokens")) || 0;
};
