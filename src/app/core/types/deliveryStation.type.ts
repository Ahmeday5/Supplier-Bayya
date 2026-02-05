// types/deliveryStation.type.ts

export interface MyDeliveryStation {
  id: number;
  deliveryStationName: string;
  minimumOrderPrice: number;
   isEditing?: boolean;
}

export interface AllDeliveryStation {
  id: number;
  name: string;
  minimumOrderPrice?: number;
}
