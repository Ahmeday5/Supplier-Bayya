export interface SupplierStatement {
  id: number;
  supplierOrderId: number;
  amount: number;
  title: string;
  buyerName: string;
  propertyName: string;
  deliveryDate: string;
  createdAt: string;
}

export interface SupplierStatementsResponse {
  items: SupplierStatement[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
