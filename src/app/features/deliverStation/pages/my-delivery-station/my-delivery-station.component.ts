import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AllDeliveryStation,
  MyDeliveryStation,
} from '../../../../core/types/deliveryStation.type';
import { ApiService } from '../../../../core/services/api.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-my-delivery-station',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './my-delivery-station.component.html',
  styleUrls: ['./my-delivery-station.component.scss'],
})
export class MyDeliveryStationComponent implements OnInit {
  stations: MyDeliveryStation[] = [];
  loadingUpdateIds: number[] = [];
  loadingDeleteIds: number[] = [];
  loadingTable = false;
  alert: { type: 'success' | 'danger'; msg: string } | null = null;

  placeholderArray = Array(16);

  constructor(
    private api: ApiService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadStations();
  }

  loadStations() {
    this.loadingTable = true;
    this.api.getMyDeliveryStations().subscribe({
      next: (res) => {
        // نضيف isEditing لكل محطة
        this.stations = res.map((station) => ({
          ...station,
          isEditing: false, // القيمة الافتراضية false
        }));
        this.loadingTable = false;
      },
      error: (err) => {
        this.showAlert('danger', err.message);
        this.loadingTable = false;
      },
    });
  }

  toggleEdit(station: MyDeliveryStation) {
    station.isEditing = !station.isEditing;
  }

  // trackBy function
  trackById(index: number, station: MyDeliveryStation) {
    return station.id;
  }

  updateStation(station: MyDeliveryStation) {
    if (station.minimumOrderPrice! < 0) {
      this.showAlert('danger', 'الحد الأدنى لا يمكن أن يكون أقل من صفر');
      return;
    }

    this.loadingUpdateIds.push(station.id);

    const body = {
      deliveryStationId: station.id,
      minimumOrderPrice: station.minimumOrderPrice!,
    };

    this.api.updateDeliveryStation(body).subscribe({
      next: () => {
        this.showAlert('success', 'تم تحديث المحطة بنجاح');
        this.loadingUpdateIds = this.loadingUpdateIds.filter(
          (id) => id !== station.id,
        );
        station.isEditing = false; // close edit after success
      },
      error: (err) => {
        this.showAlert('danger', err.message);
        this.loadingUpdateIds = this.loadingUpdateIds.filter(
          (id) => id !== station.id,
        );
      },
    });
  }

  deleteStation(station: MyDeliveryStation) {
    if (!confirm('هل تريد حذف هذه المحطة؟')) return;
    this.loadingDeleteIds.push(station.id);
    this.api.deleteSupplierDeliveryStation(station.id).subscribe({
      next: () => {
        this.showAlert('success', 'تم حذف المحطة بنجاح');
        this.stations = this.stations.filter((s) => s.id !== station.id);
        this.loadingDeleteIds = this.loadingDeleteIds.filter(
          (id) => id !== station.id,
        );
      },
      error: (err) => {
        this.showAlert('danger', err.message);
        this.loadingDeleteIds = this.loadingDeleteIds.filter(
          (id) => id !== station.id,
        );
      },
    });
  }

  showAlert(type: 'success' | 'danger', msg: string) {
    this.alert = { type, msg };
    setTimeout(() => (this.alert = null), 3000);
  }

  isLoadingUpdate(id: number) {
    return this.loadingUpdateIds.includes(id);
  }

  isLoadingDelete(id: number) {
    return this.loadingDeleteIds.includes(id);
  }
}
