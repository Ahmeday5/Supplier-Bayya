import { CanActivateFn, Router, Routes } from '@angular/router';
import { inject } from '@angular/core';
import { map } from 'rxjs';
import { AuthService } from './core/services/auth.service';
import { AuthLayoutComponent } from './core/layouts/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './core/layouts/main-layout/main-layout.component';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isLoggedIn$.pipe(
    map((isLogged) =>
      isLogged ? true : router.createUrlTree(['/auth/login']),
    ),
  );
};

export const loginGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isLoggedIn$.pipe(
    map((isLogged) => (isLogged ? router.createUrlTree(['/orders']) : true)),
  );
};

export const routes: Routes = [
  // 🔹 Auth Routes (قبل اللوجين)
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login',
        canActivate: [loginGuard],
        loadComponent: () =>
          import('./features/auth/pages/login/login.component').then(
            (m) => m.LoginComponent,
          ),
        title: 'تسجيل الدخول',
      },
    ],
  },

  // 🔹 Main App (بعد اللوجين)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard], // 👈 هنا الصح
    children: [
      {
        path: '',
        redirectTo: 'orders',
        pathMatch: 'full',
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./features/dashboard/pages/orders/orders.component').then(
            (m) => m.OrdersComponent,
          ),
        title: 'الطلبيات',
      },
      {
        path: 'orders-details/:id',
        loadComponent: () =>
          import('./features/dashboard/pages/order-items/order-items.component').then(
            (m) => m.OrderItemsComponent,
          ),
        title: 'تفاصيل الطبية',
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/products/pages/all-product/all-product.component').then(
            (m) => m.AllProductComponent,
          ),
        title: 'المنتجات',
      },
      {
        path: 'Categoires',
        loadComponent: () =>
          import('./features/products/pages/categoires-product/categoires-product.component').then(
            (m) => m.CategoiresProductComponent,
          ),
        title: 'الفئات',
      },
      {
        path: 'products-category/:categoryName',
        loadComponent: () =>
          import('./features/products/pages/products-category/products-category.component').then(
            (m) => m.ProductsCategoryComponent,
          ),
        title: 'منتجات الفئة',
      },
      {
        path: 'Indebtedness',
        loadComponent: () =>
          import('./features/indebtedness/indebtedness.component').then(
            (m) => m.IndebtednessComponent,
          ),
        title: 'المديونية',
      },
      {
        path: 'PayToBayya',
        loadComponent: () =>
          import('./features/more/pages/pay-to-bayya/pay-to-bayya.component').then(
            (m) => m.PayToBayyaComponent,
          ),
        title: 'ادفع',
      },
      {
        path: 'MyProfile',
        loadComponent: () =>
          import('./features/more/pages/my-profile/my-profile.component').then(
            (m) => m.MyProfileComponent,
          ),
        title: 'حسابي',
      },
      {
        path: 'ratings',
        loadComponent: () =>
          import('./features/more/pages/rating/rating.component').then(
            (m) => m.RatingComponent,
          ),
        title: 'جميع التقييمات',
      },
      {
        path: 'Penalties',
        loadComponent: () =>
          import('./features/reportAccount/pages/penalties/penalties.component').then(
            (m) => m.PenaltiesComponent,
          ),
        title: ' الغرامات',
      },
      {
        path: 'MyDeliveryStation',
        loadComponent: () =>
          import('./features/deliverStation/pages/my-delivery-station/my-delivery-station.component').then(
            (m) => m.MyDeliveryStationComponent,
          ),
        title: 'محطات توصيلي',
      },
      {
        path: 'AllDeliveryStation',
        loadComponent: () =>
          import('./features/deliverStation/pages/all-delivery-station/all-delivery-station.component').then(
            (m) => m.AllDeliveryStationComponent,
          ),
        title: 'جميع محطات التوصيل',
      },
      {
        path: 'report',
        loadComponent: () =>
          import('./features/reportAccount/pages/main-report/main-report.component').then(
            (m) => m.MainReportComponent,
          ),
        title: 'تقارير الحساب',
        children: [
          {
            path: '',
            redirectTo: 'penalties',
            pathMatch: 'full',
          },
          {
            path: 'penalties',
            loadComponent: () =>
              import('./features/reportAccount/pages/penalties/penalties.component').then(
                (m) => m.PenaltiesComponent,
              ),
            title: 'الغرامات',
          },
          {
            path: 'account-statement',
            loadComponent: () =>
              import('./features/reportAccount/pages/account-statement/account-statement.component').then(
                (m) => m.AccountStatementComponent,
              ),
            title: 'كشف الحساب',
          },
          {
            path: 'returns',
            loadComponent: () =>
              import('./features/reportAccount/pages/returns/returns.component').then(
                (m) => m.ReturnsComponent,
              ),
            title: 'المرتجعات',
          },
          {
            path: 'return-details/:id',
            loadComponent: () =>
              import('./features/reportAccount/pages/return-details/return-details.component').then(
                (m) => m.ReturnDetailsComponent,
              ),
            title: 'تفاصيل المرتجع',
          },
        ],
      },
    ],
  },

  // 🔹 Fallback
  { path: '**', redirectTo: '/auth/login' },
];
