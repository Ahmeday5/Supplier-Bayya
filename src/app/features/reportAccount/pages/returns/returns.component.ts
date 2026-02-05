import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../../core/services/api.service';
import {
  ReturnOrder,
  ReturnsResponse,
} from '../../../../core/types/returns.type';
import { PaginationComponent } from '../../../../shared/pagination/pagination.component';

@Component({
  selector: 'app-returns',
  standalone: true,
  imports: [CommonModule, RouterModule, PaginationComponent],
  templateUrl: './returns.component.html',
  styleUrl: './returns.component.scss',
})
export class ReturnsComponent implements OnInit {
  returns: ReturnOrder[] = [];
  loading = true;
  error: string | null = null;

  currentPage = 1;
  pageSize = 10;
  totalPages = 0;

  placeholderArray = Array(6);

  constructor(
    private api: ApiService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadReturns();
  }

  loadReturns(page: number = 1): void {
    this.loading = true;
    this.currentPage = page;

    this.api.getReturnOrders(page, this.pageSize).subscribe({
      next: (res) => {
        this.returns = res.items;
        this.totalPages = res.totalPages;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'حدث خطأ أثناء تحميل المرتجعات';
        this.loading = false;
      },
    });
  }

  onPageChange(page: number): void {
    this.loadReturns(page);
  }

  viewDetails(returnOrder: ReturnOrder): void {
    this.router.navigate(
      ['report/return-details', returnOrder.supplierOrderId],
      {
        state: { returnOrder },
      },
    );
  }

  formatDate(date: string): string {
    return date ? date : 'غير محدد';
  }
}
