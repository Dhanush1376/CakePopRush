export interface Review {
  id: string
  productId: string
  customerName: string
  rating: number
  date: string
  text: string
  isVerified: boolean
  photoUrl?: string
}
