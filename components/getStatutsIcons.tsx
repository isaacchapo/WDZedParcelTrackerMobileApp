import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';


const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <MaterialIcons name="pending-actions" size={20} color="#0096FF" />;
      case 'Processing':
        return <MaterialIcons name="work" size={20} color="#0096FF" />;
      case 'In Transit':
        return <FontAwesome5 name="truck" size={20} color="#0096FF" />;
      case 'Out for Delivery':
        return <MaterialIcons name="delivery-dining" size={20} color="#0096FF" />;
      case 'Delivered':
        return <MaterialIcons name="home" size={20} color="#4CAF50" />;
      case 'Ready for Pickup':
        return <MaterialIcons name="store" size={20} color="#0096FF" />;
      case 'Exception':
      case 'Delayed':
      case 'On Hold':
        return <MaterialIcons name="error-outline" size={20} color="#FF6B6B" />;
      default:
        return <MaterialIcons name="info-outline" size={20} color="#999" />;
    }
  };
  
  export default getStatusIcon;