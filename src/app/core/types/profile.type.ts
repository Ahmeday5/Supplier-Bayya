export interface MyProfile {
  id: number;
  email: string;
  name: string;
  phoneNumber: string;
  supplierType: string;
  warehouseLocation: string;
  warehouseAddress: string;
  warehouseImageUrl: string;
  deliveryMethod: string;
  profitPercentage: number;
  minimumOrderPrice: number;
  minimumOrderItems: number;
  deliveryDays: number;
  walletBalance: number;
  totalRatings: number;
  isActive: boolean;
}
