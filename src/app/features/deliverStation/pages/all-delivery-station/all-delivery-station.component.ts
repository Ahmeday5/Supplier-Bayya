import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';
import { AllDeliveryStation } from '../../../../core/types/deliveryStation.type';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-all-delivery-station',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './all-delivery-station.component.html',
  styleUrls: ['./all-delivery-station.component.scss'],
})
export class AllDeliveryStationComponent implements OnInit {
  stations: AllDeliveryStation[] = [];
  selected: { [key: number]: number } = {};
  loadingIds: number[] = [];
  isAdding = false;
  loadingTable = false;
  alert: { type: 'success' | 'danger'; msg: string } | null = null;

  placeholderArray = Array(30);

  constructor(
    private api: ApiService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadStations();
  }

  loadStations() {
    this.loadingTable = true;
    this.api.getAllDeliveryStations().subscribe({
      next: (res) => {
        // نضيف isEditing لكل محطة
        this.stations = res;
        this.loadingTable = false;
      },
      error: (err) => {
        this.showAlert('danger', err.message);
        this.loadingTable = false;
      },
    });
  }

  toggleSelection(station: AllDeliveryStation, checked: boolean) {
    if (checked) {
      this.selected[station.id] = 1;
    } else {
      delete this.selected[station.id];
    }
  }

  addSelected() {
    if (Object.keys(this.selected).length === 0) {
      this.showAlert('danger', 'يجب تحديد محطة توصيل واحدة على الأقل');
      return;
    }

    const invalid = Object.values(this.selected).some((price) => price < 1);
    if (invalid) {
      this.showAlert('danger', 'الحد الأدنى للطلب يجب أن يكون 1 على الأقل');
      return;
    }

    this.isAdding = true;

    // حفظ الـ ids اللي هنحاول نضيفها (عشان ننظفها بعدين)
    const selectedIds = Object.keys(this.selected).map((id) => +id);

    // شغّل الـ loading على العناصر المحددة
    this.loadingIds = [...selectedIds];

    const payload = selectedIds.map((id) => ({
      deliveryStationId: id,
      minimumOrderPrice: this.selected[id],
    }));

    this.api.addDeliveryStations(payload).subscribe({
      next: () => {
        this.showAlert('success', 'تم إضافة المحطات بنجاح');
        this.selected = {};
        this.loadingIds = []; // ← نظف هنا
        this.isAdding = false;
      },
      error: (err) => {
        this.showAlert('danger', err.message || 'فشل إضافة المحطات');
        this.loadingIds = []; // ← ونظف هنا أيضاً
        this.isAdding = false;
      },
    });
  }

  showAlert(type: 'success' | 'danger', msg: string) {
    this.alert = { type, msg };
    setTimeout(() => (this.alert = null), 3000);
  }

  isLoading(id: number) {
    return this.loadingIds.includes(id);
  }
}
