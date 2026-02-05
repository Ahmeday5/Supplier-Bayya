import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../core/services/api.service';
import {
  SupplierStatement,
  SupplierStatementsResponse,
} from '../../../../core/types/supplier-statements.type';
import { PaginationComponent } from '../../../../shared/pagination/pagination.component';

@Component({
  selector: 'app-account-statement',
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  templateUrl: './account-statement.component.html',
  styleUrl: './account-statement.component.scss',
})
export class AccountStatementComponent implements OnInit {
  statements: SupplierStatement[] = [];
  loading = true;
  error: string | null = null;

  placeholderArray = Array(6);

  currentPage = 1;
  pageSize = 10;
  totalPages = 0;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadStatements();
  }

  loadStatements(page: number = 1): void {
    this.loading = true;
    this.currentPage = page;

    this.api.getSupplierStatements(page, this.pageSize).subscribe({
      next: (res) => {
        this.statements = res.items;
        this.totalPages = res.totalPages;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'حدث خطأ أثناء تحميل كشف الحساب';
        this.loading = false;
      },
    });
  }

  onPageChange(page: number): void {
    this.loadStatements(page);
  }

  // دالة لتنسيق التاريخ
  formatDate(date: string): string {
    return date.split('T')[0]; // استخراج YYYY-MM-DD فقط
  }

  getAmountClass(amount: number): string {
    return amount < 0 ? 'text-danger' : 'text-success';
  }
}
