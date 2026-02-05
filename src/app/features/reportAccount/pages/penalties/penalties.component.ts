import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../core/services/api.service';
import {
  AllPenalties,
  PenaltiesResponse,
} from '../../../../core/types/Penalties.type';
import { catchError, Observable, of, tap } from 'rxjs';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { PaginationComponent } from '../../../../shared/pagination/pagination.component';

@Component({
  selector: 'app-penalties',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    PaginationComponent,
  ],
  templateUrl: './penalties.component.html',
  styleUrl: './penalties.component.scss',
})
export class PenaltiesComponent implements OnInit {
  penalties: AllPenalties[] = [];
  loading: boolean = false;
  error: string | null = null;
  currentPage: number = 1;
  pageSize: number = 15;
  totalItems: number = 0;
  totalPages: number = 0;

  placeholderArray = Array(6);

  constructor(private supplierService: ApiService) {}

  ngOnInit(): void {
    this.getPenalties().subscribe();
  }

  getPenalties(page: number = this.currentPage): Observable<PenaltiesResponse> {
    this.loading = true;
    this.error = '';

    return this.supplierService.getSupplierPenalties(page, this.pageSize).pipe(
      tap((res) => {
        this.penalties = res.items;
        this.currentPage = res.page;
        this.pageSize = res.pageSize;
        this.totalItems = res.totalItems;
        this.totalPages = res.totalPages;
        this.loading = false;
      }),
      catchError((err) => {
        this.loading = false;
        this.penalties = [];
        this.error = err.message || 'حدث خطأ أثناء تحميل الغرامات';

        return of({
          items: [],
          page: 1,
          pageSize: 10,
          totalItems: 0,
          totalPages: 0,
        });
      }),
    );
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;

    this.currentPage = page;

    this.getPenalties(page).subscribe();
  }

  // دالة لتنسيق التاريخ
  formatDate(date: string): string {
    return date.split('T')[0]; // استخراج YYYY-MM-DD فقط
  }
}
