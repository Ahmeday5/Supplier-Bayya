export interface ReturnItem {
  id: number;
  supplierOrderItemId: number;
  supplierOrderId: number;
  returnedQuantity: number;
  returnDate: string;
  productName: string;
  unitPrice: number;
}

export interface ReturnOrder {
  supplierOrderId: number;
  orderDate: string;
  buyerName: string;
  totalReturnedQuantity: number;
  totalRefundAmount: number;
  items: ReturnItem[];
}

export interface ReturnsResponse {
  items: ReturnOrder[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
