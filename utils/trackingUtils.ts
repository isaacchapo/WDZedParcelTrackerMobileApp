export interface Parcel {
    id: string;
    user_id: string;
    tracking_number: string;
    status: string;
    current_location: string;
    destination?: string;
    carrier?: string;
    eta: string;
    amount_paid: number;
    created_at: string;
    updated_at?: string;
  }
  
  export interface TrackingUpdate {
    location: string;
    status: string;
    timestamp: string;
    note?: string;
  }
  
  export function generateMockTrackingUpdates(parcel: Parcel): TrackingUpdate[] {
    const updates: TrackingUpdate[] = [];
    const createdDate = new Date(parcel.created_at);
  
    updates.push({
      location: 'System',
      status: 'Pending',
      timestamp: createdDate.toISOString(),
      note: 'Parcel registered in the system',
    });
  
    const processingDate = new Date(createdDate);
    processingDate.setHours(processingDate.getHours() + 2);
    updates.push({
      location: 'Sorting Facility',
      status: 'Processing',
      timestamp: processingDate.toISOString(),
      note: 'Parcel information verified and processing started',
    });
  
    const inTransitDate = new Date(processingDate);
    inTransitDate.setHours(inTransitDate.getHours() + 6);
    if (['In Transit', 'Out for Delivery', 'Delivered', 'Exception', 'Ready for pickup', 'On Hold', 'Delayed'].includes(parcel.status)) {
      updates.push({
        location: parcel.current_location,
        status: 'In Transit',
        timestamp: inTransitDate.toISOString(),
        note: 'Parcel dispatched from facility',
      });
    }
  
    const outForDeliveryDate = new Date(inTransitDate);
    outForDeliveryDate.setHours(outForDeliveryDate.getHours() + 4);
    if (['Out for Delivery', 'Delivered'].includes(parcel.status)) {
      updates.push({
        location: parcel.destination || 'Delivery Area',
        status: 'Out for Delivery',
        timestamp: outForDeliveryDate.toISOString(),
        note: 'Parcel is with the delivery agent',
      });
    }
  
    const readyPickupDate = new Date(outForDeliveryDate);
    readyPickupDate.setHours(readyPickupDate.getHours() + 2);
    if (parcel.status === 'Ready for pickup') {
      updates.push({
        location: parcel.destination || 'Pickup Location',
        status: 'Ready for pickup',
        timestamp: readyPickupDate.toISOString(),
        note: 'Parcel is ready to be picked up',
      });
    }
  
    const onHoldDate = new Date(outForDeliveryDate);
    onHoldDate.setHours(onHoldDate.getHours() + 1);
    if (parcel.status === 'On Hold') {
      updates.push({
        location: parcel.current_location,
        status: 'On Hold',
        timestamp: onHoldDate.toISOString(),
        note: 'Delivery is temporarily paused',
      });
    }
  
    const delayedDate = new Date(outForDeliveryDate);
    delayedDate.setHours(delayedDate.getHours() + 3);
    if (parcel.status === 'Delayed') {
      updates.push({
        location: parcel.current_location,
        status: 'Delayed',
        timestamp: delayedDate.toISOString(),
        note: 'Unexpected delay in delivery',
      });
    }
  
    if (parcel.status === 'Delivered') {
      const deliveredDate = new Date(parcel.updated_at || parcel.eta);
      updates.push({
        location: parcel.destination || 'Destination',
        status: 'Delivered',
        timestamp: deliveredDate.toISOString(),
        note: 'Parcel successfully delivered',
      });
    }
  
    if (parcel.status === 'Exception') {
      updates.push({
        location: parcel.current_location,
        status: 'Exception',
        timestamp: new Date().toISOString(),
        note: 'An unexpected issue occurred during transit',
      });
    }
  
    // Sort by newest first
    updates.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
    return updates;
  }
  