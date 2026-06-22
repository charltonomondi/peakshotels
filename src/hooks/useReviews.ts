import { useState, useEffect } from "react";

export interface Review {
  id: string;
  name: string;
  email: string;
  rating: number;
  message: string;
  submittedAt: string;
}

const STORAGE_KEY = "peaks_guest_reviews";

export function useReviews() {
  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const addReview = (review: Omit<Review, "id" | "submittedAt">) => {
    const newReview: Review = {
      ...review,
      id: crypto.randomUUID(),
      submittedAt: new Date().toISOString(),
    };
    setReviews(prev => {
      const updated = [newReview, ...prev];
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
    return newReview;
  };

  return { reviews, addReview };
}
