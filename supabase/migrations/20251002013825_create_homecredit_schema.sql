/*
  # HomeCredit Database Schema

  ## Overview
  Complete database structure for HomeCredit application - a mortgage credit management
  and simulation platform for MiVivienda Fund in Peru.

  ## New Tables

  ### 1. `profiles`
  User profiles linked to auth.users
  - `id` (uuid, FK to auth.users)
  - `email` (text)
  - `full_name` (text)
  - `role` (text) - 'admin', 'advisor', 'client'
  - `company_name` (text, optional)
  - `phone` (text, optional)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `clients`
  Client information for mortgage applications
  - `id` (uuid, PK)
  - `user_id` (uuid, FK to profiles) - advisor who registered the client
  - `document_type` (text) - 'DNI', 'CE', 'Passport'
  - `document_number` (text, unique)
  - `full_name` (text)
  - `email` (text)
  - `phone` (text)
  - `marital_status` (text)
  - `dependents` (integer)
  - `monthly_income` (decimal)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `property_units`
  Real estate units available for financing
  - `id` (uuid, PK)
  - `user_id` (uuid, FK to profiles) - who registered the property
  - `property_name` (text)
  - `unit_number` (text)
  - `address` (text)
  - `district` (text)
  - `province` (text)
  - `department` (text)
  - `property_type` (text) - 'apartment', 'house', 'duplex'
  - `total_area` (decimal) - in square meters
  - `price` (decimal)
  - `currency` (text) - 'PEN', 'USD'
  - `status` (text) - 'available', 'reserved', 'sold'
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. `credit_simulations`
  Credit simulation configurations and results
  - `id` (uuid, PK)
  - `user_id` (uuid, FK to profiles) - advisor who created simulation
  - `client_id` (uuid, FK to clients)
  - `property_id` (uuid, FK to property_units)
  - `property_price` (decimal)
  - `initial_payment` (decimal)
  - `loan_amount` (decimal)
  - `techo_propio_bonus` (decimal) - Bono de Techo Propio amount
  - `currency` (text) - 'PEN', 'USD'
  - `interest_rate_type` (text) - 'nominal', 'effective'
  - `annual_interest_rate` (decimal)
  - `capitalization` (text) - 'monthly', 'bimonthly', 'quarterly', 'semiannual', 'annual'
  - `loan_term_years` (integer)
  - `grace_period_type` (text) - 'none', 'total', 'partial'
  - `grace_period_months` (integer)
  - `insurance_rate` (decimal) - annual insurance rate
  - `van` (decimal) - Net Present Value
  - `tir` (decimal) - Internal Rate of Return
  - `tea` (decimal) - Effective Annual Rate
  - `tcea` (decimal) - Total Effective Annual Cost
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 5. `payment_schedules`
  Detailed payment schedule for each simulation
  - `id` (uuid, PK)
  - `simulation_id` (uuid, FK to credit_simulations)
  - `period_number` (integer)
  - `payment_date` (date)
  - `beginning_balance` (decimal)
  - `principal_payment` (decimal)
  - `interest_payment` (decimal)
  - `insurance_payment` (decimal)
  - `total_payment` (decimal)
  - `ending_balance` (decimal)
  - `grace_period` (boolean)
  - `created_at` (timestamptz)

  ## Security

  - Enable RLS on all tables
  - Policies ensure users can only access their own data or data they created
  - Clients table: advisors can manage their own clients
  - Property units: users can manage their own properties
  - Simulations and schedules: users can only see their own simulations

  ## Notes

  1. All monetary values use numeric/decimal type for precision
  2. Timestamps use timestamptz for proper timezone handling
  3. Foreign keys ensure data integrity
  4. Indexes added for frequently queried columns
  5. Follows MiVivienda Fund and SBS regulations (Ley N° 26702)
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'advisor' CHECK (role IN ('admin', 'advisor', 'client')),
  company_name text,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  document_type text NOT NULL CHECK (document_type IN ('DNI', 'CE', 'Passport')),
  document_number text NOT NULL UNIQUE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  marital_status text NOT NULL CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed')),
  dependents integer NOT NULL DEFAULT 0,
  monthly_income numeric(12, 2) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own clients"
  ON clients FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients"
  ON clients FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create property_units table
CREATE TABLE IF NOT EXISTS property_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_name text NOT NULL,
  unit_number text NOT NULL,
  address text NOT NULL,
  district text NOT NULL,
  province text NOT NULL,
  department text NOT NULL,
  property_type text NOT NULL CHECK (property_type IN ('apartment', 'house', 'duplex')),
  total_area numeric(10, 2) NOT NULL,
  price numeric(12, 2) NOT NULL,
  currency text NOT NULL DEFAULT 'PEN' CHECK (currency IN ('PEN', 'USD')),
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE property_units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own properties"
  ON property_units FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own properties"
  ON property_units FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own properties"
  ON property_units FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own properties"
  ON property_units FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create credit_simulations table
CREATE TABLE IF NOT EXISTS credit_simulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES property_units(id) ON DELETE CASCADE,
  property_price numeric(12, 2) NOT NULL,
  initial_payment numeric(12, 2) NOT NULL,
  loan_amount numeric(12, 2) NOT NULL,
  techo_propio_bonus numeric(12, 2) DEFAULT 0,
  currency text NOT NULL CHECK (currency IN ('PEN', 'USD')),
  interest_rate_type text NOT NULL CHECK (interest_rate_type IN ('nominal', 'effective')),
  annual_interest_rate numeric(6, 4) NOT NULL,
  capitalization text CHECK (capitalization IN ('monthly', 'bimonthly', 'quarterly', 'semiannual', 'annual')),
  loan_term_years integer NOT NULL,
  grace_period_type text NOT NULL DEFAULT 'none' CHECK (grace_period_type IN ('none', 'total', 'partial')),
  grace_period_months integer DEFAULT 0,
  insurance_rate numeric(6, 4) NOT NULL DEFAULT 0.0005,
  van numeric(12, 2),
  tir numeric(6, 4),
  tea numeric(6, 4),
  tcea numeric(6, 4),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE credit_simulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own simulations"
  ON credit_simulations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own simulations"
  ON credit_simulations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own simulations"
  ON credit_simulations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own simulations"
  ON credit_simulations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create payment_schedules table
CREATE TABLE IF NOT EXISTS payment_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_id uuid NOT NULL REFERENCES credit_simulations(id) ON DELETE CASCADE,
  period_number integer NOT NULL,
  payment_date date NOT NULL,
  beginning_balance numeric(12, 2) NOT NULL,
  principal_payment numeric(12, 2) NOT NULL,
  interest_payment numeric(12, 2) NOT NULL,
  insurance_payment numeric(12, 2) NOT NULL,
  total_payment numeric(12, 2) NOT NULL,
  ending_balance numeric(12, 2) NOT NULL,
  grace_period boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(simulation_id, period_number)
);

ALTER TABLE payment_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view schedules for own simulations"
  ON payment_schedules FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM credit_simulations
      WHERE credit_simulations.id = payment_schedules.simulation_id
      AND credit_simulations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert schedules for own simulations"
  ON payment_schedules FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM credit_simulations
      WHERE credit_simulations.id = payment_schedules.simulation_id
      AND credit_simulations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete schedules for own simulations"
  ON payment_schedules FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM credit_simulations
      WHERE credit_simulations.id = payment_schedules.simulation_id
      AND credit_simulations.user_id = auth.uid()
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_document ON clients(document_number);
CREATE INDEX IF NOT EXISTS idx_property_units_user_id ON property_units(user_id);
CREATE INDEX IF NOT EXISTS idx_property_units_status ON property_units(status);
CREATE INDEX IF NOT EXISTS idx_credit_simulations_user_id ON credit_simulations(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_simulations_client_id ON credit_simulations(client_id);
CREATE INDEX IF NOT EXISTS idx_credit_simulations_property_id ON credit_simulations(property_id);
CREATE INDEX IF NOT EXISTS idx_payment_schedules_simulation_id ON payment_schedules(simulation_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_units_updated_at BEFORE UPDATE ON property_units
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_credit_simulations_updated_at BEFORE UPDATE ON credit_simulations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();