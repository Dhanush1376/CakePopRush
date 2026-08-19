import { Review } from '@/types/review'

export const mockReviews: Review[] = [
  {
    id: 'rev_1',
    productId: 'prod_1', // Chocolate Chip Cookies
    customerName: 'Anjali Sharma',
    rating: 5,
    date: '2023-08-15',
    text: 'These cake pops are absolutely divine! The chocolate flavour is so rich, and the packaging was beautiful. Ordered them for my daughter\'s birthday and everyone loved them.',
    isVerified: true,
    photoUrl: '/images/reviews/review1.png'
  },
  {
    id: 'rev_2',
    productId: 'prod_1',
    customerName: 'Rahul Desai',
    rating: 4,
    date: '2023-08-10',
    text: 'Really good taste and arrived perfectly chilled. The only reason for 4 stars is that I wish there were more strawberry ones in the assorted box.',
    isVerified: true,
  },
  {
    id: 'rev_3',
    productId: 'prod_1',
    customerName: 'Priya Patel',
    rating: 5,
    date: '2023-08-05',
    text: 'Melt in the mouth goodness! The custom message on the box was a very sweet touch. Highly recommend CakePopRush.',
    isVerified: true,
    photoUrl: '/images/reviews/review2.png'
  },
  {
    id: 'rev_4',
    productId: 'prod_1',
    customerName: 'Vikram Singh',
    rating: 5,
    date: '2023-07-28',
    text: 'Best dessert I\'ve ordered online. The outer chocolate shell has a great snap, and the inside is incredibly moist.',
    isVerified: true,
  },
  {
    id: 'rev_5',
    productId: 'prod_1',
    customerName: 'Neha Gupta',
    rating: 4,
    date: '2023-07-20',
    text: 'Very cute and tasty. They are a bit sweet, but perfect with a cup of coffee.',
    isVerified: false,
  }
]
