// features/dashboard/pages/all-product/all-product.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
  of,
  Observable,
} from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';
import {
  Product,
  ProductsResponse,
  ProductFilterType,
  UpdateProductBody,
} from '../../../../core/types/products.type';

@Component({
  selector: 'app-all-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './all-product.component.html',
  styleUrl: './all-product.component.scss',
})
export class AllProductComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';
  searchControl = new FormControl('');
  searchMessage = '';
  currentFilter: ProductFilterType = 'offers';

  placeholderArray = Array(6);

  /////////////////////loding buttons/////////////////////
  toggleLoadingId: number | null = null;
  deleteLoadingId: number | null = null;
  editLoading = false;

  // ──────────── جديد: للـ edit modal ────────────
  selectedProduct: Product | null = null;
  editForm: FormGroup;
  saving = false; // loading state للـ save

  filterButtons: { label: string; value: ProductFilterType }[] = [
    { label: 'العروض', value: 'offers' },
    { label: 'منشورة', value: 'published' },
    { label: 'غير منشورة', value: 'unpublished' },
    { label: 'غير متوفرة', value: 'unavailable' },
  ];

  constructor(
    private api: ApiService,
    private router: Router,
    private fb: FormBuilder,
  ) {
    // تهيئة الـ edit form (بدون status)
    this.editForm = this.fb.group({
      priceNow: [0, [Validators.required, Validators.min(0.01)]],
      priceBefore: [0, [Validators.min(0)]],
      quantity: [0, [Validators.required, Validators.min(0)]],
      maxOrderLimit: [1, [Validators.required, Validators.min(1)]],
      productDescription: [''],
      status: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.loadProducts();

    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((searchTerm) => {
          if (!searchTerm || searchTerm.trim() === '') {
            this.searchMessage = '';
            return this.loadProducts();
          }
          this.loading = true;
          this.searchMessage = 'جاري البحث...';
          return this.searchProducts(searchTerm.trim());
        }),
        catchError((error) => {
          this.errorMessage = error.message;
          this.loading = false;
          return of(null);
        }),
      )
      .subscribe();
  }

  changeStatus(filter: ProductFilterType) {
    this.currentFilter = filter;
    this.searchControl.setValue('');
    this.loadProducts();
  }

  private loadProducts(): Observable<ProductsResponse> {
    this.loading = true;
    this.errorMessage = '';
    let apiCall: Observable<ProductsResponse>;
    switch (this.currentFilter) {
      case 'offers':
        apiCall = this.api.getSupplierProductsWithOffers();
        break;
      case 'published':
        apiCall = this.api.getActiveSupplierProducts();
        break;
      case 'unpublished':
        apiCall = this.api.getInactiveSupplierProducts();
        break;
      case 'unavailable':
        apiCall = this.api.getUnavailableSupplierProducts();
        break;
    }
    apiCall.subscribe({
      next: (res) => {
        this.products = res.data || [];
        this.loading = false;
        if (this.products.length === 0) {
          this.errorMessage = 'لا توجد منتجات في هذه الحالة.';
        }
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.loading = false;
        this.products = [];
      },
    });
    return apiCall;
  }

  private searchProducts(searchTerm: string): Observable<ProductsResponse> {
    let apiCall: Observable<ProductsResponse>;
    switch (this.currentFilter) {
      case 'offers':
        apiCall = this.api.getSupplierProductsWithOffers(searchTerm);
        break;
      case 'published':
        apiCall = this.api.getActiveSupplierProducts(searchTerm);
        break;
      case 'unpublished':
        apiCall = this.api.getInactiveSupplierProducts(searchTerm);
        break;
      case 'unavailable':
        apiCall = this.api.getUnavailableSupplierProducts(searchTerm);
        break;
    }
    apiCall.subscribe({
      next: (res) => {
        this.products = res.data || [];
        this.loading = false;
        if (this.products.length === 0) {
          this.searchMessage = 'لا توجد نتائج مطابقة للبحث.';
        } else {
          this.searchMessage = `تم العثور على ${this.products.length} نتيجة.`;
        }
      },
      error: (err) => {
        console.log('خطأ في loadProducts بعد الـ action:', err); // ← جديد
        console.log('Status:', err.status);
        console.log('URL:', err.url);
        this.errorMessage = err.message || 'حدث خطأ أثناء التحميل';
        this.loading = false;
        this.products = [];
      },
    });
    return apiCall;
  }

  // ──────────── جديد: للـ Actions ────────────

  /**
   * دالة لفتح الـ modal للتعديل
   */
  openEditModal(product: Product): void {
    this.selectedProduct = product;
    this.editForm.patchValue({
      priceNow: product.priceNow,
      priceBefore: product.priceBefore,
      quantity: product.quantity,
      maxOrderLimit: product.maxOrderLimit,
      productDescription: product.productDescription || '',
      status: product.status,
    });

    // افتح الـ modal بـ document (بدون bootstrap object)
    const modalElement = document.getElementById('editProductModal');
    if (modalElement) {
      modalElement.classList.add('show');
      modalElement.style.display = 'block';
      modalElement.setAttribute('aria-modal', 'true');
      modalElement.removeAttribute('aria-hidden');

      // أضف backdrop يدويًا (مهم للـ UX)
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop fade show';
      document.body.appendChild(backdrop);
      document.body.classList.add('modal-open');

      // عشان نغلق لما نضغط على backdrop
      backdrop.addEventListener('click', () => this.closeModal());
    }
  }

  /**
   * دالة لحفظ التعديلات
   */
  saveChanges(id: number): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched(); // show errors
      return;
    }

    this.editLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const body: UpdateProductBody = this.editForm.value;

    this.api.updateSupplierProduct(id, body).subscribe({
      next: () => {
        console.log('Update نجح');
        console.log('جاري إعادة تحميل المنتجات...');

        this.editLoading = false;
        this.closeModal();
        this.loadProducts();
        this.successMessage = 'تم تعديل المنتج بنجاح.';
        setTimeout(() => {
          this.successMessage = '';
        }, 2000);
      },
      error: (err) => {
        this.editLoading = false;
        this.errorMessage = err.message || 'فشل في حفظ التعديلات';
        setTimeout(() => {
          this.errorMessage = '';
        }, 4000);
      },
    });
  }

  /**
   * دالة لحذف المنتج
   * @param id ID المنتج
   */
  deleteProduct(id: number): void {
    if (!window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      return;
    }

    this.deleteLoadingId = id;
    this.errorMessage = '';
    this.successMessage = '';

    this.api.deleteSupplierProduct(id).subscribe({
      next: () => {
        console.log('Delete نجح');
        console.log('جاري إعادة تحميل المنتجات...');
        this.deleteLoadingId = null;
        this.successMessage = 'تم حذف المنتج بنجاح.';
        setTimeout(() => {
          this.successMessage = '';
        }, 2000);
        this.loadProducts();
      },
      error: (err) => {
        this.deleteLoadingId = null;
        this.errorMessage = err.message || 'فشل في حذف المنتج';
        setTimeout(() => {
          this.errorMessage = '';
        }, 4000);
      },
    });
  }

  /**
   * دالة لتغيير حالة النشر (toggle)
   * @param id ID المنتج
   */
  toggleProductStatus(id: number): void {
    if (!window.confirm('هل أنت متأكد من تغيير حالة النشر؟')) {
      return;
    }

    console.log('===== بداية toggle للمنتج ID:', id, '====='); // ← جديد

    this.toggleLoadingId = id;
    this.errorMessage = '';
    this.successMessage = '';

    this.api.toggleProductStatus(id).subscribe({
      next: (response) => {
        console.log('Toggle نجح، response:', response); // ← جديد
        console.log('جاري إعادة تحميل المنتجات...'); // ← جديد

        this.toggleLoadingId = null;
        this.successMessage = 'تم تغيير الحالة بنجاح.';
        setTimeout(() => {
          this.successMessage = '';
        }, 2000);
        this.loadProducts(); // reload products
        console.log('تم تغيير الحالة بنجاح');
      },
      error: (err) => {
        console.log('Toggle فشل، error:', err); // ← جديد
        this.toggleLoadingId = null;
        this.errorMessage = err.message || 'فشل في تغيير الحالة';
        setTimeout(() => {
          this.errorMessage = '';
        }, 4000);
        this.loadProducts(); // reload products
      },
    });
  }

  /**
   * دالة لإغلاق الـ modal
   */
  closeModal(): void {
    const modalElement = document.getElementById('editProductModal');
    if (modalElement) {
      modalElement.classList.remove('show');
      modalElement.style.display = 'none';
      modalElement.setAttribute('aria-hidden', 'true');
      modalElement.removeAttribute('aria-modal');

      // إزالة backdrop
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.remove();
      }
      document.body.classList.remove('modal-open');
    }

    this.selectedProduct = null;
    this.editForm.reset();
  }

  addProduct(): void {
    this.router.navigate(['/Categoires']);
  }
}
