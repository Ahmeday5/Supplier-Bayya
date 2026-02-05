import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { ApiService } from '../../../../core/services/api.service';
import { firstValueFrom } from 'rxjs';
import { LoginResponse } from '../../../../core/types/login.type';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  phoneNumber: string = '';
  rememberMe: boolean = false;
  isLoading: boolean = false;
  errorMessage: string | null = null; // لتخزين رسائل الخطأ

  constructor(
    private router: Router,
    private authService: AuthService,
    private apiService: ApiService,
  ) {}

  async onSubmit(form: NgForm): Promise<void> {
    this.errorMessage = null;
    if (form.valid) {
      this.isLoading = true;

      try {
        const credentials = {
          phoneNumber: this.phoneNumber,
          rememberMe: this.rememberMe,
        };

        const response = (await firstValueFrom(
          this.apiService.login(credentials),
        )) as LoginResponse;
        this.authService.login(response);
        this.errorMessage = null;
        await this.router.navigate(['orders']);
      } catch (error: any) {
        this.errorMessage = error.message || 'حدث خطأ غير معروف.';
      } finally {
        this.isLoading = false;
      }
    } else {
      this.errorMessage = 'يرجى تعبئة جميع الحقول بشكل صحيح.';
    }
  }
}
