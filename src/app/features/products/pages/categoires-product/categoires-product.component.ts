import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../core/services/api.service';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  allCategories,
  categoryData,
} from '../../../../core/types/category.type';

@Component({
  selector: 'app-categoires-product',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './categoires-product.component.html',
  styleUrl: './categoires-product.component.scss',
})
export class CategoiresProductComponent implements OnInit {
  Categories: allCategories[] = [];
  loading: boolean = true;
  noCategoryMessage: string | null = null;
  CategoryMessage: string | null = null;

  placeholderArray = Array(24);

  constructor(
    private apiService: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.fetchAllCategories();
  }

  fetchAllCategories() {
    this.loading = true;
    this.noCategoryMessage = null;
    this.apiService.getAllCategories().subscribe({
      next: (response: categoryData) => {
        console.log('API Response Categories :', response); // للتحقق من البيانات
        this.Categories = response.data || [];
        console.log('الكاتجوري', this.Categories);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('خطأ في جلب كل الفئات :', error);
        this.Categories = [];
        this.noCategoryMessage = error.message || 'حدث خطأ في جلب الفئات ';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  navigateToCategoryProducts(categoryName: string): void {
    console.log('Navigating to category:', categoryName);

    if (!categoryName || categoryName.trim() === '') {
      console.warn('Category name is empty');
      return;
    }

    // ← تأكيد: استخدام route parameter صحيح
    const encodedCategory = encodeURIComponent(categoryName);
    console.log('Encoded category for URL:', encodedCategory);

    this.router.navigate(['/products-category', encodedCategory]);
  }

  goToProducts(categoryName: string): void {
    this.router.navigate(['/products-category', categoryName]);
  }
}
