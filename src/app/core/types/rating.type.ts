// core/types/rating.type.ts

export interface SupplierRating {
  id: number;
  buyerName: string;
  rate: number;
  comment: string;
  createdAt: string;
}

export interface SupplierRatingsData {
  supplierId: number;
  supplierName: string;
  supplierWarehouseImage: string;
  averageRate: number;
  totalRates: number;
  ratings: SupplierRating[];
}

export interface SupplierRatingsResponse {
  message: string;
  data: SupplierRatingsData;
}
