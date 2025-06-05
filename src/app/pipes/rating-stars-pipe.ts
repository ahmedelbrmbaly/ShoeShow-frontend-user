// src/app/pipes/rating-stars.pipe.ts

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ratingStars',
  standalone: false
})
export class RatingStarsPipe implements PipeTransform {

  transform(rating: number): string {
    if (rating == null || rating < 0) return '';

    const fullStars = Math.floor(rating);
    const halfStar = (rating % 1) >= 0.25 && (rating % 1) < 0.75;
    const extraStar = (rating % 1) >= 0.75 ? 1 : 0;

    const filled = '★'.repeat(fullStars + extraStar);
    const half = halfStar ? '½' : '';
    const empty = '☆'.repeat(5 - fullStars - extraStar - (halfStar ? 1 : 0));

    return filled + half + empty;
  }

}
