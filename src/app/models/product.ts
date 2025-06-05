export class Product {
  id: number = 0;
  title: string = '';
  description: string = '';
  category: string = '';
  price: number = 0;
  discountPercentage: number = 0;
  rating: number = 0;
  stock: number = 0;
  tags: string[] = [];
  brand: string = '';
  weight: number = 0;


  reviews: {
    rating: number;
    comment: string;
    date: string;
    reviewerName: string;
    reviewerEmail: string;
  }[] = [];

  thumbnail: string = '';
  images: string[] = [];
}
