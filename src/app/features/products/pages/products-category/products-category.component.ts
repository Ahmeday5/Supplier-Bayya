import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../core/services/api.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
  of,
  Observable,
  tap,
  throwError,
  takeUntil,
  Subject,
} from 'rxjs';
import {
  AddProductBody,
  allProducts,
  productResponse,
} from '../../../../core/types/products.type';
import { PaginationComponent } from '../../../../shared/pagination/pagination.component';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';

@Component({
  selector: 'app-products-category',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    PaginationComponent,
  ],
  templateUrl: './products-category.component.html',
  styleUrl: './products-category.component.scss',
})
export class ProductsCategoryComponent implements OnInit {
  products: allProducts[] = [];
  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  searchControl = new FormControl('');
  searchMessage: string = '';
  category: string = ''; // الفئة من الـ query params
  currentPage: number = 1;
  pageSize: number = 15;
  totalItems: number = 0;
  totalPages: number = 0;

  selectedProductId: number | null = null;
  addForm: FormGroup;
  addLoading: boolean = false;
  private destroy$ = new Subject<void>();
  isSearching: boolean = false;

  placeholderArray = Array(12);

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
  ) {
    this.addForm = this.fb.group({
      priceBefore: [0, [Validators.min(0)]],
      priceNow: [0.01, [Validators.required, Validators.min(0.01)]],
      quantity: [1, [Validators.required, Validators.min(1)]], // لا تسمح بـ 0
      maxOrderLimit: [1, [Validators.required, Validators.min(1)]],
      status: ['Active', [Validators.required]],
      productDescription: [''],
    });
  }

  ngOnInit(): void {
    this.loadProducts().subscribe();
    this.setupSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProducts(
    page: number = this.currentPage,
  ): Observable<productResponse> {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const categoryName = this.route.snapshot.paramMap.get('categoryName') ?? '';

    this.category = decodeURIComponent(categoryName);

    return this.api.getAllProducts(page, this.pageSize, this.category).pipe(
      tap((res) => {
        this.products = res.data.items;
        this.currentPage = res.data.page;
        this.pageSize = res.data.pageSize;
        this.totalItems = res.data.totalItems;
        this.totalPages = res.data.totalPages;
        this.loading = false;
      }),
      catchError((err) => {
        this.loading = false;
        this.products = [];
        this.errorMessage = err.message || 'حدث خطأ أثناء تحميل المنتجات';
        return of({
          message: '',
          data: {
            items: [],
            page: 1,
            pageSize: 10,
            totalItems: 0,
            totalPages: 0,
          },
        });
      }),
    );
  }

  // ──────────── البحث عن المنتجات ────────────
  private searchProducts(searchTerm: string): Observable<productResponse> {
    console.log('Searching products for:', searchTerm);

    this.loading = true;
    this.isSearching = true;

    // ← إصلاح: إضافة parameters للـ pagination في البحث
    return this.api
      .getProductsByName(searchTerm, this.currentPage, this.pageSize)
      .pipe(
        takeUntil(this.destroy$),
        tap((res) => {
          console.log('Search results:', res); // للـ debugging

          this.products = res.data?.items || [];
          this.currentPage = res.data?.page || 1;
          this.pageSize = res.data?.pageSize || 10;
          this.totalItems = res.data?.totalItems || 0;
          this.totalPages = res.data?.totalPages || 0;
          this.loading = false;

          if (this.products.length === 0) {
            this.searchMessage = `لا توجد نتائج لـ "${searchTerm}"`;
          } else {
            this.searchMessage = `تم العثور على ${this.products.length} نتيجة لـ "${searchTerm}"`;
          }
          console.log('Search completed:', this.products.length, 'results');
        }),
        catchError((err) => {
          console.error('Search error:', err);
          this.errorMessage = err.message || 'حدث خطأ أثناء البحث';
          this.loading = false;
          this.isSearching = false;
          this.products = [];
          this.searchMessage = 'فشل في البحث';
          return throwError(() => err);
        }),
      );
  }

  private setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),

        switchMap((searchTerm) => {
          // 1️⃣ البحث فاضي
          if (!searchTerm || searchTerm.trim() === '') {
            this.isSearching = false;
            this.searchMessage = '';
            return this.loadProducts(1);
          }

          // 2️⃣ أقل من حرفين
          if (searchTerm.trim().length < 2) {
            this.searchMessage = 'الحد الأدنى للبحث حرفين';
            return of(null);
          }

          // 3️⃣ بحث فعلي
          this.isSearching = true;
          return this.searchProducts(searchTerm.trim());
        }),

        // ✅ هنا مكان الـ catchError ده
        catchError(() => {
          this.isSearching = false;
          this.searchMessage = '';
          return this.loadProducts(1); // 👈 رجوع طبيعي
        }),
      )
      .subscribe();
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;

    this.currentPage = page;

    if (this.isSearching && this.searchControl.value?.trim()) {
      const searchTerm = this.searchControl.value.trim();
      if (searchTerm.length >= 2) {
        this.searchProducts(searchTerm).subscribe(); // ✅
      }
    } else {
      this.loadProducts(page).subscribe(); // ✅
    }
  }

  // ──────────── مسح البحث ────────────
  clearSearch(): void {
    this.searchControl.setValue('');
    this.isSearching = false;
    this.searchMessage = '';
    this.loadProducts(1); // إعادة تحميل المنتجات الأصلية
  }

  // دالة لفتح المودال (سيتم في الخطوة التالية)
  openAddModal(productId: number): void {
    this.selectedProductId = productId;
    this.addForm.patchValue({
      /* يمكن إضافة defaults إذا لزم */
    });

    const modalElement = document.getElementById('addProductModal');
    if (modalElement) {
      modalElement.classList.add('show');
      modalElement.style.display = 'block';
      modalElement.setAttribute('aria-modal', 'true');
      modalElement.removeAttribute('aria-hidden');

      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop fade show';
      document.body.appendChild(backdrop);
      document.body.classList.add('modal-open');

      backdrop.addEventListener('click', () => this.closeModal());
    }
  }

  // دالة لحفظ الإضافة
  saveAdd(): void {
    if (this.addForm.invalid || !this.selectedProductId) {
      this.addForm.markAllAsTouched();
      return;
    }

    this.addLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const body: AddProductBody = {
      productId: this.selectedProductId,
      ...this.addForm.value,
    };

    this.api.addSupplierProduct(body).subscribe({
      next: () => {
        this.successMessage = 'تم إضافة المنتج بنجاح.';
        setTimeout(() => (this.successMessage = ''), 3000);
        this.closeModal();
      },
      error: (err) => {
        this.errorMessage = err.message || 'فشل في إضافة المنتج';
        setTimeout(() => (this.errorMessage = ''), 5000);
      },
      complete: () => {
        this.addLoading = false;
      },
    });
  }

  // دالة لإغلاق المودال
  closeModal(): void {
    const modalElement = document.getElementById('addProductModal');
    if (modalElement) {
      modalElement.classList.remove('show');
      modalElement.style.display = 'none';
      modalElement.setAttribute('aria-hidden', 'true');
      modalElement.removeAttribute('aria-modal');

      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.remove();
      }
      document.body.classList.remove('modal-open');
    }

    this.selectedProductId = null;
    this.addForm.reset();
  }
}
