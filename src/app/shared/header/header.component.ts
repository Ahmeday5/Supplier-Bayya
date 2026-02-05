import { SidebarService } from '../../core/services/sidebar.service';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterModule,
} from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { UserData } from '../../core/types/login.type';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {  
  userData$: Observable<UserData | null>;
  constructor(
    private sidebarService: SidebarService,
    private authService: AuthService, // حقن AuthService لتسجيل الخروج
    private router: Router, // حقن Router للتعامل مع التنقل
    private activatedRoute: ActivatedRoute // حقن ActivatedRoute للوصول للروت الحالي
  ) {
    this.userData$ = this.authService.userData$;
  }

  toggleSidebar() {
    this.sidebarService.toggle();
  }

    // دالة تسجيل الخروج
  logout(): void {
    this.authService.logout(); // استدعاء دالة logout من AuthService
    this.router.navigate(['auth/login']); // التنقل إلى صفحة تسجيل الدخول
  }
}
