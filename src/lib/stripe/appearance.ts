import type { Appearance, StripeElementsOptionsMode } from "@stripe/stripe-js";

// Restyles Stripe's PaymentElement to match the storefront's near-monochrome,
// sharp-corner design system — no default blue focus rings, no rounding.
export const stripeAppearance: Appearance = {
  theme: "stripe",
  variables: {
    colorPrimary: "#171717",
    colorBackground: "#ffffff",
    colorText: "#171717",
    colorTextSecondary: "#737373",
    colorTextPlaceholder: "#a3a3a3",
    colorDanger: "#dc2626",
    borderRadius: "0px",
    fontFamily: '"Archivo Narrow", "Helvetica Neue Condensed", Arial, sans-serif',
    fontSizeBase: "14px",
    spacingUnit: "4px",
  },
  rules: {
    ".Input": {
      border: "1px solid #e5e5e5",
      boxShadow: "none",
    },
    ".Input:focus": {
      border: "1px solid #171717",
      boxShadow: "none",
      outline: "none",
    },
    ".Tab": {
      border: "1px solid #e5e5e5",
      boxShadow: "none",
    },
    ".Tab:hover": {
      border: "1px solid #a3a3a3",
    },
    ".Tab--selected": {
      border: "1px solid #171717",
      boxShadow: "none",
    },
    ".Label": {
      fontSize: "12px",
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      color: "#737373",
    },
  },
};

export const stripeFonts: NonNullable<StripeElementsOptionsMode["fonts"]> = [
  {
    cssSrc:
      "https://fonts.googleapis.com/css2?family=Archivo+Narrow:wght@400;500;700&display=swap",
  },
];
