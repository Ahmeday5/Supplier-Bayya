export interface OrderItem {
  id: number;
  supplierProductId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Shipped'
  | 'Delivered';

export interface Order {
  id: number;
  buyerName: string;
  buyerPhone: string;
  propertyName: string;
  propertyAddress: string;
  propertyLocation: string;
  totalAmount: number;
  deliveryDate: string;
  status: OrderStatus;
  paymentMethod: string;
  walletPaymentAmount: number;
  buyerDeviceToken: string;
  items: OrderItem[];
}

export interface OrdersResponse {
  items: Order[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
