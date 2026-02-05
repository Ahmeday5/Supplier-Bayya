// core/types/products.type.ts (الكود الكامل)

export interface Product {
  id: number;
  productId: number;
  productName: string;
  supplierId: number;
  supplierName: string;
  priceBefore: number;
  priceNow: number;
  quantity: number;
  status: string; // "Active" or "NotActive"
  isAvailable: boolean;
  maxOrderLimit: number;
  productImageUrl: string | null;
  productDescription: string | null;
}

export interface ProductsResponse {
  message: string;
  data: Product[];
}

export type ProductFilterType =
  | 'offers'
  | 'published'
  | 'unpublished'
  | 'unavailable';

// ──────────── جديد: للـ update body ────────────

export interface UpdateProductBody {
  priceNow: number; // مطلوب، السعر الجديد (0.01+)
  priceBefore: number; // اختياري، السعر القديم (0+)
  quantity: number; // مطلوب، الكمية (0+)
  maxOrderLimit: number; // مطلوب، الحد الأقصى (1+)
  productDescription: string; // اختياري
  status: string; // "Active" or "NotActive"
}

/****************************************************************** */

export interface allProducts {
  id: number;
  name: string;
  category: string;
  company: string;
  imageUrl: string;
}

export interface productData {
  items: allProducts[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface productResponse {
  message: string;
  data: productData;
}

export interface AddProductBody {
  productId: number;
  priceBefore: number;
  priceNow: number;
  quantity: number;
  status: 'Active' | 'NotActive';  // مقيد بـ "Active" or "NotActive"
  maxOrderLimit: number;
  productDescription: string;
}
