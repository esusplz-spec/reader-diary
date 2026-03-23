export type Review = {
  id: string
  title: string
  createdAt: string
}

const STORAGE_KEY = 'reader-diary-reviews'

export function getReviews(): Review[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []

  try {
    return JSON.parse(raw) as Review[]
  } catch {
    return []
  }
}

export function saveReviews(reviews: Review[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews))
}

export function createReview(): Review {
  const newReview: Review = {
    id: crypto.randomUUID(),
    title: 'Новый отзыв',
    createdAt: new Date().toISOString(),
  }

  const reviews = getReviews()
  reviews.unshift(newReview)
  saveReviews(reviews)

  return newReview
}

export function getReviewById(id: string): Review | undefined {
  return getReviews().find((review) => review.id === id)
}

export function updateReviewTitle(id: string, title: string) {
  const reviews = getReviews().map((review) =>
    review.id === id ? { ...review, title } : review
  )

  saveReviews(reviews)
}

export function deleteReview(id: string) {
  const reviews = getReviews().filter((review) => review.id !== id)
  saveReviews(reviews)
}