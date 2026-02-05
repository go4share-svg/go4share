// 🌍 Multi-currency systém Go4Share

export const exchangeRates = {
  CZK: 1,      // 1 X-Token = 1 Kč
  EUR: 0.04,   // cca 1 CZK = 0.04 €
  USD: 0.045,  // cca 1 CZK = 0.045 $
  GBP: 0.035,  // cca 1 CZK = 0.035 £
};

export const formatCurrency = (tokens, currency = "CZK") => {
  const value = (tokens * (exchangeRates[currency] || 0)).toFixed(2);
  const symbols = { CZK: "Kč", EUR: "€", USD: "$", GBP: "£" };
  return `${value} ${symbols[currency] || currency}`;
};
