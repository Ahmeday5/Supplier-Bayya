import { allIndebtednes } from '../../core/types/indebtednes.type';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-indebtedness',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './indebtedness.component.html',
  styleUrl: './indebtedness.component.scss',
})
export class IndebtednessComponent implements OnInit {
  Indebtednes: allIndebtednes | null = null;
  loading: boolean = true;
  noIndebtednesMessage: string | null = null;
  IndebtednesMessage: string | null = null;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.fetchAllIndebtednes();
  }

  fetchAllIndebtednes() {
    this.loading = true;
    this.noIndebtednesMessage = null;
    this.apiService.getAllIndebtedness().subscribe({
      next: (response: allIndebtednes) => {
        console.log('API Response Indebtednes :', response); // للتحقق من البيانات
        this.Indebtednes = response;
        console.log('المديونية', this.Indebtednes);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('خطأ في جلب كل المديونية :', error);
        this.noIndebtednesMessage = error.message || 'حدث خطأ في جلب المديونية ';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
