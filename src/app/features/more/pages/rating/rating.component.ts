import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../core/services/api.service';
import {
  SupplierRatingsData,
} from '../../../../core/types/rating.type';

@Component({
  selector: 'app-rating',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rating.component.html',
  styleUrl: './rating.component.scss',
})
export class RatingComponent implements OnInit {
  loading = true;
  ratingsData!: SupplierRatingsData;

  placeholderArray = Array(6);

  supplierId = 1; // حاليًا ثابت – بعدين ممكن ييجي من route

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadRatings();
  }

  loadRatings() {
    this.loading = true;

    this.apiService.getSupplierRatings(this.supplierId).subscribe({
      next: (res) => {
        this.ratingsData = res.data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  starsArray(rate: number): number[] {
    return Array(rate).fill(0);
  }
}
