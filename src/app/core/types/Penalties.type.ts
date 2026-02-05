export interface AllPenalties {
  id: number;
  supplierOrderId: number;
  penaltyAmount: number;
  reason: string;
  buyerName: string;
  deliveryDate: string;
  createdAt: string;
}

export interface PenaltiesResponse {
  items: AllPenalties[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
