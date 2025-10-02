export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'advisor' | 'client';
  company_name?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  document_type: 'DNI' | 'CE' | 'Passport';
  document_number: string;
  full_name: string;
  email: string;
  phone: string;
  marital_status: 'single' | 'married' | 'divorced' | 'widowed';
  dependents: number;
  monthly_income: number;
  created_at: string;
  updated_at: string;
}

export interface PropertyUnit {
  id: string;
  user_id: string;
  property_name: string;
  unit_number: string;
  address: string;
  district: string;
  province: string;
  department: string;
  property_type: 'apartment' | 'house' | 'duplex';
  total_area: number;
  price: number;
  currency: 'PEN' | 'USD';
  status: 'available' | 'reserved' | 'sold';
  created_at: string;
  updated_at: string;
}

export interface CreditSimulation {
  id: string;
  user_id: string;
  client_id: string;
  property_id: string;
  property_price: number;
  initial_payment: number;
  loan_amount: number;
  techo_propio_bonus: number;
  currency: 'PEN' | 'USD';
  interest_rate_type: 'nominal' | 'effective';
  annual_interest_rate: number;
  capitalization?: 'monthly' | 'bimonthly' | 'quarterly' | 'semiannual' | 'annual';
  loan_term_years: number;
  grace_period_type: 'none' | 'total' | 'partial';
  grace_period_months: number;
  insurance_rate: number;
  van?: number;
  tir?: number;
  tea?: number;
  tcea?: number;
  created_at: string;
  updated_at: string;
}

export interface PaymentSchedule {
  id: string;
  simulation_id: string;
  period_number: number;
  payment_date: string;
  beginning_balance: number;
  principal_payment: number;
  interest_payment: number;
  insurance_payment: number;
  total_payment: number;
  ending_balance: number;
  grace_period: boolean;
  created_at: string;
}
