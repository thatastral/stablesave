export const SITE = {
  name: "StableSave",
  title: "StableSave: find where your stablecoins earn the most",
  description:
    "Compare USDC and USDT savings rates across DeFi with clear A–D safety grades, in plain English. No wallet, no sign-up, no custody.",
  url: process.env.NEXT_PUBLIC_SITE_URL
    ? process.env.NEXT_PUBLIC_SITE_URL
    : process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3217",
};
