import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { ApiService } from '../../../../core/services/api.service';
import { PaginationComponent } from '../../../../shared/pagination/pagination.component';
import {
  Order,
  OrdersResponse,
  OrderStatus,
} from '../../../../core/types/orders.type';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    PaginationComponent,
  ],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = false;

  currentStatus: OrderStatus = 'Pending';
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;

  isConfirming = false;
  isCancelling = false;
  isShipping = false;
  isDelivering = false;

  // Alert message
  alertMessage: string = '';
  alertType: 'success' | 'danger' = 'success';
  showAlert: boolean = false;

  placeholderArray: any[] = []; // ← array للكروت الوهمية

  filterButtons: { label: string; value: OrderStatus }[] = [
    { label: 'قيد الإنتظار', value: 'Pending' },
    { label: 'مؤكد', value: 'Confirmed' },
    { label: 'تم الشحن', value: 'Shipped' },
    { label: 'تم التوصيل', value: 'Delivered' },
  ];

  constructor(
    private api: ApiService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  goToOrderDetails(id: number, order: Order, status: OrderStatus) {
    this.router.navigate(['/orders-details', id], {
      state: { order, status },
    });
  }

  loadOrders(page: number = 1): void {
    this.loading = true;
    this.currentPage = page;
    this.placeholderArray = Array(this.pageSize); // ← عدد كروت اللودنج

    this.api
      .getSupplierOrdersByStatus(this.currentStatus, page, this.pageSize)
      .subscribe({
        next: (res) => {
          this.orders = res.items;
          this.totalPages = res.totalPages;
          this.loading = false;
          this.placeholderArray = []; // بعد ما يتحمل امسح placeholders
        },
        error: (err) => {
          console.error('Error loading orders:', err);
          this.loading = false;
          this.placeholderArray = [];
        },
      });
  }

  showAlertMessage(message: string, type: 'success' | 'danger') {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;

    setTimeout(() => {
      this.showAlert = false;
    }, 3000); // يختفي بعد 3 ثواني
  }

  onPageChange(page: number | undefined): void {
    if (typeof page !== 'number' || page < 1) {
      return; // تجاهل القيم غير الصالحة
    }

    this.loadOrders(page);
  }

  truncateAddress(address: string, wordCount: number = 5): string {
    if (!address) return '';
    const words = address.split(' ');
    if (words.length <= wordCount) return address;
    return words.slice(0, wordCount).join(' ') + ' ...';
  }

  confirmAction(question: string): boolean {
    return window.confirm(question);
  }

  // دالة لتنسيق التاريخ
  formatDate(date: string): string {
    return date.split('T')[0]; // استخراج YYYY-MM-DD فقط
  }

  changeStatus(status: OrderStatus) {
    this.currentStatus = status;
    this.currentPage = 1; // مهم: نرجع للصفحة الأولى عند تغيير الـ status
    this.loadOrders(1);
  }

  confirm(id: number) {
    if (!this.confirmAction('هل تريد تأكيد هذا الطلب؟')) return;
    this.isConfirming = true;

    this.api.confirmOrCancelOrder(id, true).subscribe({
      next: () => {
        this.showAlertMessage('تم تأكيد الطلب بنجاح', 'success');
        this.currentPage = 1; // ← رجع للصفحة 1
        this.loadOrders(1); // ← حمل الصفحة الأولى
      },
      error: (err) => {
        console.error(err);
        this.showAlertMessage('فشل تأكيد الطلب', 'danger');
      },
      complete: () => {
        this.isConfirming = false; // أوقف الـ spinner مهما حصل
      },
    });
  }

  cancel(id: number) {
    if (!this.confirmAction('هل تريد إلغاء هذا الطلب؟')) return;

    this.isCancelling = true;

    this.api.confirmOrCancelOrder(id, false).subscribe({
      next: () => {
        this.showAlertMessage('تم إلغاء الطلب بنجاح', 'success');
        this.currentPage = 1; // ← رجع للصفحة 1
        this.loadOrders(1); // ← حمل الصفحة الأولى
      },
      error: (err) => {
        console.error(err);
        this.showAlertMessage('فشل إلغاء الطلب', 'danger');
      },
      complete: () => {
        this.isCancelling = false;
      },
    });
  }

  ship(id: number) {
    if (!this.confirmAction('هل تم شحن هذا الطلب؟')) return;

    this.isShipping = true;

    this.api.markAsShipped(id).subscribe({
      next: () => {
        this.showAlertMessage('تم شحن الطلب بنجاح', 'success');
        this.currentPage = 1; // ← رجع للصفحة 1
        this.loadOrders(1); // ← حمل الصفحة الأولى
      },
      error: (err) => {
        console.error(err);
        this.showAlertMessage('فشل شحن الطلب', 'danger');
      },
      complete: () => {
        this.isShipping = false;
      },
    });
  }

  deliver(id: number) {
    if (!this.confirmAction('هل تم توصيل هذا الطلب؟')) return;

    this.isDelivering = true;

    this.api.markAsDelivered(id).subscribe({
      next: () => {
        this.showAlertMessage('تم توصيل الطلب بنجاح', 'success');
        this.currentPage = 1; // ← رجع للصفحة 1
        this.loadOrders(1); // ← حمل الصفحة الأولى
      },
      error: (err) => {
        console.error(err);
        this.showAlertMessage('فشل توصيل الطلب', 'danger');
      },
      complete: () => {
        this.isDelivering = false;
      },
    });
  }

  getStatusClass(status: OrderStatus) {
    switch (status) {
      case 'Pending':
        return {
          top: 'pending-class',
          badge: 'bg-orange',
          text: 'text-orange',
        };
      case 'Confirmed':
        return {
          top: 'confirmed-class',
          badge: 'bg-success',
          text: 'text-success',
        };
      case 'Shipped':
        return {
          top: 'shipped-class',
          badge: 'bg-primary',
          text: 'text-primary',
        };
      case 'Delivered':
        return {
          top: 'delivered-class',
          badge: 'bg-success',
          text: 'text-success',
        };
      default:
        return { top: '', badge: '', text: '' };
    }
  }
}
