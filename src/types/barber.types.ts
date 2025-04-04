export interface BarberProps {
  id: string;
  availability_status: boolean | null;
  experience: number | null;
  rating: number | null;
  shop_name: string | null;
  services_offered: any; // Adjust this type based on your services structure
}
