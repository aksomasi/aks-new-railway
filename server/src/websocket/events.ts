let socketInstance: any = null;

export const setSocketInstance = (socket: any) => {
  socketInstance = socket;
  console.log('✅ WebSocket instance set');
};

export const emitNewOrder = (order: any) => {
  console.log('📡 Emitting new order:', order.id);
  if (socketInstance) {
    socketInstance.emitNewOrder(order);
  } else {
    console.log('❌ No socket instance available');
  }
};

export const emitOrderUpdate = (order: any) => {
  console.log('📡 Emitting order update:', order.id, order.status);
  if (socketInstance) {
    socketInstance.emitOrderUpdate(order);
  } else {
    console.log('❌ No socket instance available');
  }
};