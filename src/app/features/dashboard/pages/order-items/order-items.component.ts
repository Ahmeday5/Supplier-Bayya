import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../../core/services/api.service'; // عدّل المسار حسب مشروعك
import {
  Order,
  OrderStatus,
  OrdersResponse,
} from '../../../../core/types/orders.type'; // عدّل المسار
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './order-items.component.html',
  styleUrl: './order-items.component.scss',
})
export class OrderItemsComponent implements OnInit {
  order: Order | null = null;
  loading = false;
  errorMessage = '';

  placeholderArray = Array(6);

  //return order
  selectedItem: any = null;
  returnQuantity: number | null = null;
  returnError = '';
  alertMessage: string = '';
  alertType: 'success' | 'danger' = 'success';
  showAlert: boolean = false;
  isSubmitting = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
  ) {}

  ngOnInit(): void {
    const orderIdStr = this.route.snapshot.paramMap.get('id');
    const orderId = Number(orderIdStr);

    if (isNaN(orderId)) {
      this.errorMessage = 'معرف الطلب غير صالح';
      return;
    }

    // محاولة جلب الداتا من الـ navigation state أولاً (أسرع وأفضل UX)
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state || history.state;

    const passedStatus = state?.status as OrderStatus | undefined;

    // لو مفيش داتا في الـ state → نجيبها من الـ API بناءً على الـ status
    if (passedStatus && this.isValidStatus(passedStatus)) {
      this.loadOrderByStatusAndId(passedStatus, orderId);
    } else {
      // لو مفيش status في الـ state → خطأ أو fallback (ممكن تجرب status معين)
      this.errorMessage = 'تعذر تحميل تفاصيل الطلب - حالة الطلب غير معروفة';
    }
  }

  openReturnModal(item: any): void {
    this.selectedItem = item;
    this.returnQuantity = 1;
    this.returnError = '';
  }

  closeReturnModal(): void {
    this.selectedItem = null;
    this.returnQuantity = null;
    this.returnError = '';
  }

  showAlertMessage(message: string, type: 'success' | 'danger') {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;

    setTimeout(() => {
      this.showAlert = false;
    }, 3000); // يختفي بعد 3 ثواني
  }

  reloadOrder(): void {
    if (!this.order) return;

    this.loadOrderByStatusAndId(this.order.status, this.order.id);
  }

  confirmReturn(): void {
    if (!this.selectedItem || this.isSubmitting) return;

    const maxQty = this.selectedItem.quantity;

    if (!this.returnQuantity || this.returnQuantity < 1) {
      this.returnError = 'أقل كمية مسموح بها هي 1';
      return;
    }

    if (this.returnQuantity > maxQty) {
      this.returnError = `أقصى كمية مسموح بها هي ${maxQty}`;
      return;
    }

    const item = this.selectedItem;
    const qty = this.returnQuantity!;

    const body = [
      {
        supplierOrderItemId: item.id,
        quantity: qty,
      },
    ];

    this.isSubmitting = true; // 🔥 بدأ اللودينج
    this.returnError = '';

    this.api.returnOrder(body).subscribe({
      next: () => {
        // optimistic update
        item.quantity -= qty;

        this.showAlertMessage('تم تأكيد المرتجع بنجاح', 'success');
        this.isSubmitting = false;

        setTimeout(() => {
          this.closeReturnModal();
          this.reloadOrder();
        }, 3000);
      },

      error: (err) => {
        this.showAlertMessage(err.message || 'فشل تأكيد المرتجع', 'danger');

        setTimeout(() => {
          this.isSubmitting = false;
          this.closeReturnModal(); // 👈 يقفل بعد 3 ثواني حتى لو فشل
        }, 3000);
      },
    });
  }

  private isValidStatus(status: string): status is OrderStatus {
    return ['Pending', 'Confirmed', 'Shipped', 'Delivered'].includes(status);
  }

  private loadOrderByStatusAndId(status: OrderStatus, orderId: number): void {
    this.loading = true;
    this.errorMessage = '';

    // نجيب صفحة كبيرة نسبيًا عشان نزيد فرصة إن الطلب يكون موجود
    this.api.getSupplierOrdersByStatus(status, 1, 100).subscribe({
      next: (res: OrdersResponse) => {
        const found = res.items.find((o) => o.id === orderId);
        if (found) {
          this.order = found;
        } else {
          this.errorMessage = `الطلب رقم ${orderId} غير موجود في حالة ${status}`;
        }
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('خطأ في جلب تفاصيل الطلب:', err);
        this.errorMessage = err.message || 'حدث خطأ أثناء جلب تفاصيل الطلب';
        this.loading = false;
      },
    });
  }

  // دالة للرجوع للخلف
  goBack(): void {
    this.router.navigate(['/orders']);
  }

  // تنسيق التاريخ
  formatDate(date: string): string {
    if (!date) return 'غير محدد';
    return date.split('T')[0];
  }

  // عرض الحالة بالعربي
  getStatusLabel(status: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      Pending: 'قيد الإنتظار',
      Confirmed: 'مؤكد',
      Shipped: 'تم الشحن',
      Delivered: 'تم التوصيل',
    };
    return map[status] || status;
  }

  // لون البادج حسب الحالة
  getStatusClass(status: OrderStatus): string {
    switch (status) {
      case 'Pending':
        return 'bg-warning';
      case 'Confirmed':
      case 'Delivered':
        return 'bg-success';
      case 'Shipped':
        return 'bg-primary';
      default:
        return 'bg-secondary';
    }
  }
}
