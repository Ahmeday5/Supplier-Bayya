import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { LoginCredentials, LoginResponse } from '../types/login.type';
import { OrdersResponse, OrderStatus } from '../types/orders.type';
import {
  AddProductBody,
  productResponse,
  ProductsResponse,
  UpdateProductBody,
} from '../types/products.type';
import { categoryData } from '../types/category.type';
import { allIndebtednes } from '../types/indebtednes.type';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { MyProfile } from '../types/profile.type';
import { SupplierRatingsResponse } from '../types/rating.type';
import {
  AllDeliveryStation,
  MyDeliveryStation,
} from '../types/deliveryStation.type';
import { SupplierStatementsResponse } from '../types/supplier-statements.type';
import { ReturnsResponse } from '../types/returns.type';
import { PenaltiesResponse } from '../types/Penalties.type';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly baseUrl = 'http://78.89.159.126:9393/TheOneAPIBayyaa';

  constructor(private http: HttpClient) {}

  /***********************************login********************************************/

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    const loginUrl = `${this.baseUrl}/api/Supplier/login`;

    return this.http.post<LoginResponse>(loginUrl, credentials).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'حدث خطأ غير معروف';
        if (error.status === 0) {
          errorMessage = 'فشل الاتصال بالخادم. تحقق من الشبكة.';
        } else if (error.status === 400) {
          errorMessage = error.error?.message || 'بيانات الإدخال غير صحيحة.';
        } else if (error.status === 401) {
          errorMessage = 'رقم الهاتف غير صحيح';
        } else if (error.status === 503) {
          errorMessage = 'الخادم غير متاح حاليًا. حاول لاحقًا.';
        }
        console.error('خطأ في تسجيل الدخول:', error);
        return throwError(() => ({
          status: error.status,
          message: errorMessage,
        }));
      }),
    );
  }

  /********************************************orders*************************************************/
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  // دالة جلب الطلبات
  getSupplierOrdersByStatus(
    status: OrderStatus,
    page: number,
    pageSize: number,
  ): Observable<OrdersResponse> {
    const endpointMap: Record<OrderStatus, string> = {
      Pending: 'getPendingSupplierOrders',
      Confirmed: 'getConfirmedOrders',
      Shipped: 'getShippedOrders',
      Delivered: 'getDeliveredOrders',
    };

    const endpoint = endpointMap[status];
    if (!endpoint) {
      return throwError(() => new Error(`حالة الطلب غير مدعومة: ${status}`));
    }

    const url = `${this.baseUrl}/api/Supplier/${endpoint}?page=${page}&pageSize=${pageSize}`;

    return this.http
      .get<OrdersResponse>(url, { headers: this.getAuthHeaders() })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('خطأ في جلب الطلبات:', error);
          let errorMessage = 'فشل جلب الطلبات';
          if (error.status === 0) {
            errorMessage = 'فشل الاتصال بالخادم. تأكد من الإنترنت.';
          } else if (error.status === 401 || error.status === 403) {
            errorMessage = 'غير مصرح. يرجى تسجيل الدخول مرة أخرى.';
            // ممكن هنا تضيف logout أو توجيه لصفحة الlogin لو عندك AuthService
          } else if (error.status === 404) {
            errorMessage = 'لم يتم العثور على الطلبات المطلوبة.';
          } else if (error.status >= 500) {
            errorMessage = 'حدث خطأ في الخادم. يرجى المحاولة لاحقاً.';
          }
          return throwError(() => new Error(errorMessage));
        }),
      );
  }

  // دالة مساعدة صغيرة (حطها في نفس الـ service)
  private handleActionError = (error: HttpErrorResponse): Observable<never> => {
    console.error('Supplier action error:', error);

    let msg = 'حدث خطأ أثناء تنفيذ العملية';

    if (error.status === 0) {
      msg = 'مشكلة في الاتصال بالسيرفر';
    } else if (error.status === 401 || error.status === 403) {
      msg = 'الجلسة انتهت، برجاء تسجيل الدخول مجدداً';
    } else if (error.status === 404) {
      msg = 'الطلب غير موجود';
    } else if (error.status >= 500) {
      msg = 'مشكلة في السيرفر، حاول بعد شوية';
    }
    return throwError(() => new Error(msg));
  };

  // ──────────────────────────────────────────────

  confirmOrCancelOrder(orderId: number, isConfirmed: boolean) {
    const url = `${this.baseUrl}/api/Supplier/confirmOrCancelSupplierOrder/${orderId}?isConfirmed=${isConfirmed}`;
    return this.http
      .post(url, null, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleActionError));
  }

  markAsShipped(orderId: number) {
    const url = `${this.baseUrl}/api/Supplier/markAsShipped/${orderId}`;
    return this.http
      .post(url, null, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleActionError));
  }

  markAsDelivered(orderId: number) {
    const url = `${this.baseUrl}/api/Supplier/markAsDelivered/${orderId}`;
    return this.http
      .post(url, null, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleActionError));
  }

  returnOrder(body: { supplierOrderItemId: number; quantity: number }[]) {
    const url = `${this.baseUrl}/api/Supplier/returnOrder`;
    return this.http
      .post(url, body, { headers: this.getAuthHeaders(), responseType: 'text' })
      .pipe(catchError(this.handleActionError));
  }

  /***********************************************products***********************************************************/

  private getProducts(
    endpoint: string,
    searchTerm?: string,
  ): Observable<ProductsResponse> {
    let url = `${this.baseUrl}/api/Supplier/${endpoint}`;
    if (searchTerm && searchTerm.trim()) {
      url += `?productName=${encodeURIComponent(searchTerm.trim())}`;
    }
    return this.http
      .get<ProductsResponse>(url, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleActionError));
  }

  getSupplierProductsWithOffers(
    searchTerm?: string,
  ): Observable<ProductsResponse> {
    return this.getProducts(
      'getSupplierProductsWithOffersWithSearch',
      searchTerm,
    );
  }

  getActiveSupplierProducts(searchTerm?: string): Observable<ProductsResponse> {
    return this.getProducts('getActiveSupplierProductsWithSearch', searchTerm);
  }

  getInactiveSupplierProducts(
    searchTerm?: string,
  ): Observable<ProductsResponse> {
    return this.getProducts(
      'getNotActiveSupplierProductsWithSearch',
      searchTerm,
    ); // افترضت الاسم ده بناءً على السياق
  }

  getUnavailableSupplierProducts(
    searchTerm?: string,
  ): Observable<ProductsResponse> {
    return this.getProducts(
      'getUnavailableSupplierProductsWithSearch',
      searchTerm,
    );
  }

  // ──────────── جديد: للـ product actions ────────────

  toggleProductStatus(id: number): Observable<any> {
    const url = `${this.baseUrl}/api/Supplier/toggleStatus/${id}`;
    return this.http
      .put<any>(url, null, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(this.handleActionError), // استخدم نفس error handler للتوحيد
      );
  }

  deleteSupplierProduct(id: number): Observable<any> {
    const url = `${this.baseUrl}/api/Supplier/deleteSupplierProduct/${id}`;
    return this.http.delete<any>(url, { headers: this.getAuthHeaders() }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('خطأ في جلب الطلبات:', error);
        let errorMessage = 'فشل جلب الطلبات';
        if (error.status === 0) {
          errorMessage = 'فشل الاتصال بالخادم. تأكد من الإنترنت.';
        } else if (error.status === 401 || error.status === 403) {
          errorMessage = 'غير مصرح. يرجى تسجيل الدخول مرة أخرى.';
          // ممكن هنا تضيف logout أو توجيه لصفحة الlogin لو عندك AuthService
        } else if (error.status === 404) {
          errorMessage = 'لم يتم العثور على الطلبات المطلوبة.';
        } else if (error.status >= 500) {
          errorMessage = 'حدث خطأ في الخادم. يرجى المحاولة لاحقاً.';
        } else if (error.status === 400) {
          errorMessage = 'لا يمكن حذف هذا المنتج لانه بالفعل مستخدم في طلبات اخري'
        }
        return throwError(() => new Error(errorMessage));
      }),
    );
  }

  updateSupplierProduct(id: number, body: UpdateProductBody): Observable<any> {
    const url = `${this.baseUrl}/api/Supplier/updateSupplierProduct/${id}`;
    return this.http
      .put<any>(url, body, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleActionError));
  }

  /**************************************categoies-product*************************************/

  getAllCategories(): Observable<categoryData> {
    // بناء URL ديناميكي
    let url = `${this.baseUrl}/api/Supplier/categories`;

    return this.http
      .get<categoryData>(url, { headers: this.getAuthHeaders() })
      .pipe(
        map(
          (response) =>
            response || {
              message: 'Categories retrieved successfully',
              data: [],
            },
        ),
        catchError(this.handleActionError),
      );
  }

  getAllProducts(
    page?: number,
    pageSize?: number,
    category?: string,
  ): Observable<productResponse> {
    // بناء URL ديناميكي
    let url = `${this.baseUrl}/api/Supplier/products`;

    let params: string[] = [];

    if (page !== undefined) {
      params.push(`page=${page}`);
    }
    if (pageSize !== undefined) {
      params.push(`pageSize=${pageSize}`);
    }
    if (category !== undefined && category.trim() !== '') {
      params.push(`category=${encodeURIComponent(category)}`);
    }

    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    return this.http
      .get<productResponse>(url, { headers: this.getAuthHeaders() })
      .pipe(
        map((response) => {
          if (!response?.data) {
            return {
              message: 'Products retrieved successfully',
              data: {
                items: [],
                page: 1,
                pageSize: 10,
                totalItems: 0,
                totalPages: 0,
              },
            };
          }
          return response;
        }),
        catchError(this.handleActionError),
      );
  }

  // Method جديد للبحث عن منتجات باسم
  getProductsByName(
    productName: string,
    page: number = 1,
    pageSize: number = 10,
  ): Observable<productResponse> {
    // ← إصلاح: بناء URL ديناميكي مع pagination parameters
    let url = `${this.baseUrl}/api/Supplier/getProductsByName`;
    let params: string[] = [`productName=${encodeURIComponent(productName)}`];

    if (page !== undefined && page > 0) {
      params.push(`page=${page}`);
    }
    if (pageSize !== undefined && pageSize > 0) {
      params.push(`pageSize=${pageSize}`);
    }

    url += `?${params.join('&')}`;
    console.log('Search URL:', url); // للـ debugging

    return this.http
      .get<productResponse>(url, { headers: this.getAuthHeaders() })
      .pipe(
        map((response) => {
          console.log('Raw search response:', response); // للـ debugging
          if (!response?.data) {
            return {
              message: 'Search completed successfully',
              data: {
                items: [],
                page: page,
                pageSize: pageSize,
                totalItems: 0,
                totalPages: 0,
              },
            };
          }
          return response;
        }),
        catchError(this.handleActionError),
      );
  }

  // Method جديد لإضافة منتج
  addSupplierProduct(body: AddProductBody): Observable<any> {
    const url = `${this.baseUrl}/api/Supplier/addSupplierProduct`;

    return this.http
      .post<any>(url, body, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleActionError));
  }

  /**************************************Indebtedness*************************************/

  getAllIndebtedness(): Observable<allIndebtednes> {
    // بناء URL ديناميكي
    let url = `${this.baseUrl}/api/Supplier/GetMyWallet`;
    return this.http
      .get<allIndebtednes>(url, { headers: this.getAuthHeaders() })
      .pipe(
        map(
          (response) =>
            response || {
              data: [],
            },
        ),
        catchError(this.handleActionError),
      );
  }

  /***********************************delete account*******************************************/

  deleteMyAccount(): Observable<any> {
    const url = `${this.baseUrl}/api/Supplier/DeleteMyAccount`;
    return this.http
      .post<any>(url, null, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleActionError));
  }

  /************************************myprofile**********************************/

  getMyProfile(): Observable<MyProfile> {
    // بناء URL ديناميكي
    let url = `${this.baseUrl}/api/Supplier/GetMyProfile`;

    return this.http
      .get<MyProfile>(url, { headers: this.getAuthHeaders() })
      .pipe(
        map(
          (response) =>
            response || {
              data: [],
            },
        ),
        catchError(this.handleActionError),
      );
  }

  /*********************************** Supplier Ratings **********************************/

  getSupplierRatings(supplierId: number): Observable<SupplierRatingsResponse> {
    const url = `${this.baseUrl}/api/Supplier/getSupplierRatings/${supplierId}`;

    return this.http
      .get<SupplierRatingsResponse>(url, {
        headers: this.getAuthHeaders(),
      })
      .pipe(catchError(this.handleActionError));
  }

  /*********************************************DeliveryStation***********************************************/

  getMyDeliveryStations(): Observable<MyDeliveryStation[]> {
    return this.http
      .get<
        MyDeliveryStation[]
      >(`${this.baseUrl}/api/Supplier/getMyDeliveryStations`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleActionError));
  }

  getAllDeliveryStations(): Observable<AllDeliveryStation[]> {
    return this.http
      .get<
        AllDeliveryStation[]
      >(`${this.baseUrl}/api/Supplier/getAllDeliveryStation`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleActionError));
  }

  addDeliveryStations(
    body: { deliveryStationId: number; minimumOrderPrice: number }[],
  ): Observable<any> {
    return this.http
      .post(`${this.baseUrl}/api/Supplier/addDeliveryStations`, body, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('خطأ في اضافة المحطات :', error);
          let errorMessage = 'فشل اضافة المحطات';
          if (error.status === 0) {
            errorMessage = 'فشل الاتصال بالخادم. تأكد من الإنترنت.';
          } else if (error.status === 401 || error.status === 403) {
            errorMessage = 'غير مصرح. يرجى تسجيل الدخول مرة أخرى.';
            // ممكن هنا تضيف logout أو توجيه لصفحة الlogin لو عندك AuthService
          } else if (error.status === 400) {
            errorMessage = 'محطة التوصيل مضافة بالفعل لهذا المورد';
          } else if (error.status >= 500) {
            errorMessage = 'حدث خطأ في الخادم. يرجى المحاولة لاحقاً.';
          }
          return throwError(() => new Error(errorMessage));
        }),
      );
  }

  updateDeliveryStation(body: {
    deliveryStationId: number;
    minimumOrderPrice: number;
  }): Observable<any> {
    return this.http
      .put(`${this.baseUrl}/api/Supplier/updateDeliveryStation`, body, {
        headers: this.getAuthHeaders(),
      })
      .pipe(catchError(this.handleActionError));
  }

  deleteSupplierDeliveryStation(stationId: number): Observable<any> {
    return this.http
      .delete(
        `${this.baseUrl}/api/Supplier/deleteSupplierDeliveryStation/${stationId}`,
        {
          headers: this.getAuthHeaders(),
        },
      )
      .pipe(catchError(this.handleActionError));
  }

  /************************************report***********************************/
  getSupplierPenalties(
    page?: number,
    pageSize?: number,
  ): Observable<PenaltiesResponse> {
    let url = `${this.baseUrl}/api/Supplier/getSupplierPenalties`;
    let params: string[] = [];

    if (page !== undefined) params.push(`page=${page}`);
    if (pageSize !== undefined) params.push(`pageSize=${pageSize}`);

    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    return this.http
      .get<PenaltiesResponse>(url, { headers: this.getAuthHeaders() })
      .pipe(
        map((response) => {
          if (!response?.items) {
            return {
              items: [],
              page: 1,
              pageSize: 10,
              totalItems: 0,
              totalPages: 0,
            };
          }
          return response;
        }),
        catchError(this.handleActionError),
      );
  }

  getSupplierStatements(
    page: number = 1,
    pageSize: number = 10,
  ): Observable<SupplierStatementsResponse> {
    const url = `${this.baseUrl}/api/Supplier/getSupplierStatements?page=${page}&pageSize=${pageSize}`;
    return this.http
      .get<SupplierStatementsResponse>(url, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleActionError));
  }

  getReturnOrders(
    page: number = 1,
    pageSize: number = 10,
  ): Observable<ReturnsResponse> {
    const url = `${this.baseUrl}/api/Supplier/getReturnOrders?page=${page}&pageSize=${pageSize}`;
    return this.http
      .get<ReturnsResponse>(url, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleActionError));
  }
}
