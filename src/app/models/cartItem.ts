export class CartItem {
  id: number;
  title: string;
  price: number;
  quantity: number;
  image: string;

  constructor(id: number, title: string, price: number, quantity: number, image: string) {
    this.id = id;
    this.title = title;
    this.price = price;
    this.quantity = quantity;
    this.image = image;
  }
}
