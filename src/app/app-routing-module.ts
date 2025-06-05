import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ProductsComponent} from './components/products/products.component';
import {ProductDetailsComponent} from './components/product-details/product-details.component';
import {CartComponent} from './components/cart/cart.component';
import {AboutComponent} from './components/about/about.component';

const routes: Routes = [
  {path: '', component:ProductsComponent},
  {path:'products', component:ProductsComponent},
  {path:'products/:id', component:ProductDetailsComponent},
  {path:'cart', component:CartComponent},
  {path:'about', component:AboutComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
