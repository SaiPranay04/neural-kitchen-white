import React from "react";
import { Star } from "lucide-react";
import { C } from "@/lib/constants";

export const TagBadge = ({ text, color }: { text?: string; color?: string }) => {
  if (!text) return null;
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    "Chef's Pick": { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
    "Best Seller": { bg: "#FFF7ED", text: "#E87722", border: "#FDE68A" },
    "New": { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
    "Healthy": { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
    "Fan Fave": { bg: "#FDF4FF", text: "#7E22CE", border: "#E9D5FF" },
    "Seasonal": { bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0" },
    "Vegetarian": { bg: "#F0FDF4", text: "#166534", border: "#BBF7D0" },
    "Spicy": { bg: "#FFF1F2", text: "#BE123C", border: "#FECDD3" },
    "Signature": { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
  };
  const style = colors[text] || { bg: "#F1F5F9", text: "#475569", border: "#E2E8F0" };
  return (
    <span style={{ background: style.bg, color: style.text, border: `1px solid ${style.border}`, fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, letterSpacing: "0.03em", textTransform: "uppercase" }}>
      {text}
    </span>
  );
};

export const StarRating = ({ rating }: { rating: number }) => (
  <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, fontWeight: 600, color: C.amber }}>
    <Star size={11} fill={C.amber} />
    {rating}
  </span>
);
