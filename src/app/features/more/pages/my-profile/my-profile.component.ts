import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../core/services/api.service';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MyProfile } from '../../../../core/types/profile.type';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.scss',
})
export class MyProfileComponent implements OnInit {
  Profile: MyProfile | null = null;
  loading: boolean = true;
  nomyProfileMessage: string | null = null;
  myProfileMessage: string | null = null;

  placeholderArray = Array(12);

  constructor(
    private apiService: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.fetchMyProfile();
  }

  fetchMyProfile() {
    this.loading = true;
    this.nomyProfileMessage = null;
    this.apiService.getMyProfile().subscribe({
      next: (response: MyProfile) => {
        console.log('API Response myProfile :', response); // للتحقق من البيانات
        this.Profile = response;
        console.log('حسابي', this.Profile);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('خطأ في جلب كل حسابي :', error);
        this.nomyProfileMessage = error.message || 'حدث خطأ في جلب حسابي ';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  goToRatings() {
    this.router.navigate(['/ratings']);
  }
}
