import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ReturnOrder } from '../../../../core/types/returns.type';

@Component({
  selector: 'app-return-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './return-details.component.html',
  styleUrl: './return-details.component.scss'
})
export class ReturnDetailsComponent implements OnInit {
  returnOrder: ReturnOrder | null = null;
  loading = false;
  errorMessage = '';

  placeholderArray = Array(6);

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state || history.state;

    if (state?.returnOrder) {
      this.returnOrder = state.returnOrder;
    } else {
      // fallback لو مفيش state (ممكن تضيف API call لو حابب)
      this.router.navigate(['/returns']);
    }
  }

  formatDate(date: string): string {
    return date ? date : 'غير محدد';
  }

  goBack(): void {
    this.router.navigate(['/report/returns']);
  }
}
