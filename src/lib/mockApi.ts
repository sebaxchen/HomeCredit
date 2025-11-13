import {
  Client,
  CreditSimulation,
  PaymentSchedule,
  Profile,
  PropertyUnit,
} from '../types/database';

type NewClientInput = Omit<Client, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
type NewPropertyInput = Omit<PropertyUnit, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
type NewSimulationInput = Omit<CreditSimulation, 'id' | 'created_at' | 'updated_at'>;
type NewPaymentScheduleInput = Omit<
  PaymentSchedule,
  'id' | 'simulation_id' | 'created_at'
>;
type NewProfileInput = Omit<Profile, 'created_at' | 'updated_at'> & { id?: string };

const DEMO_USER_ID = 'demo-user';

const now = () => new Date().toISOString();

const generateId = (prefix: string) =>
  `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

const demoProfileTimestamp = '2024-01-15T10:00:00.000Z';

const profiles: Profile[] = [
  {
    id: DEMO_USER_ID,
    email: 'asesor@homecredit.pe',
    full_name: 'Asesor Demo',
    role: 'advisor',
    company_name: 'HomeCredit Demo',
    phone: '+51 999 123 456',
    created_at: demoProfileTimestamp,
    updated_at: demoProfileTimestamp,
  },
];

const clients: Client[] = [
  {
    id: 'client_01',
    user_id: DEMO_USER_ID,
    document_type: 'DNI',
    document_number: '70451236',
    full_name: 'Juan Pérez García',
    email: 'juan.perez@example.com',
    phone: '+51 999 111 222',
    marital_status: 'married',
    dependents: 1,
    monthly_income: 4800,
    created_at: '2024-02-10T09:15:00.000Z',
    updated_at: '2024-08-05T14:00:00.000Z',
  },
  {
    id: 'client_02',
    user_id: DEMO_USER_ID,
    document_type: 'CE',
    document_number: 'E1234567',
    full_name: 'María López Sánchez',
    email: 'maria.lopez@example.com',
    phone: '+51 988 333 444',
    marital_status: 'single',
    dependents: 0,
    monthly_income: 6200,
    created_at: '2024-03-22T12:40:00.000Z',
    updated_at: '2024-08-18T08:20:00.000Z',
  },
  {
    id: 'client_03',
    user_id: DEMO_USER_ID,
    document_type: 'DNI',
    document_number: '78965412',
    full_name: 'Luis Ramírez Flores',
    email: 'luis.ramirez@example.com',
    phone: '+51 977 555 666',
    marital_status: 'married',
    dependents: 2,
    monthly_income: 5500,
    created_at: '2024-04-15T16:05:00.000Z',
    updated_at: '2024-09-02T11:10:00.000Z',
  },
];

const properties: PropertyUnit[] = [
  {
    id: 'property_01',
    user_id: DEMO_USER_ID,
    property_name: 'Residencial Los Pinos',
    unit_number: 'Torre A - Dpto 301',
    address: 'Av. Primavera 123',
    district: 'Santiago de Surco',
    province: 'Lima',
    department: 'Lima',
    property_type: 'apartment',
    total_area: 85,
    price: 380000,
    currency: 'PEN',
    status: 'available',
    created_at: '2024-02-20T10:00:00.000Z',
    updated_at: '2024-07-12T09:30:00.000Z',
  },
  {
    id: 'property_02',
    user_id: DEMO_USER_ID,
    property_name: 'Condominio Costa Azul',
    unit_number: 'Torre B - Dpto 1202',
    address: 'Malecón Grau 456',
    district: 'Barranco',
    province: 'Lima',
    department: 'Lima',
    property_type: 'apartment',
    total_area: 105,
    price: 520000,
    currency: 'PEN',
    status: 'reserved',
    created_at: '2024-03-05T11:20:00.000Z',
    updated_at: '2024-08-22T16:45:00.000Z',
  },
  {
    id: 'property_03',
    user_id: DEMO_USER_ID,
    property_name: 'Villa Campestre',
    unit_number: 'Casa 08',
    address: 'Av. Alameda Central 789',
    district: 'La Molina',
    province: 'Lima',
    department: 'Lima',
    property_type: 'house',
    total_area: 160,
    price: 780000,
    currency: 'PEN',
    status: 'available',
    created_at: '2024-04-01T09:45:00.000Z',
    updated_at: '2024-09-10T18:15:00.000Z',
  },
];

const creditSimulations: CreditSimulation[] = [
  {
    id: 'simulation_01',
    user_id: DEMO_USER_ID,
    client_id: 'client_01',
    property_id: 'property_01',
    property_price: 380000,
    initial_payment: 76000,
    loan_amount: 304000,
    techo_propio_bonus: 0,
    currency: 'PEN',
    interest_rate_type: 'effective',
    annual_interest_rate: 0.0825,
    capitalization: null,
    loan_term_years: 20,
    grace_period_type: 'none',
    grace_period_months: 0,
    insurance_rate: 0.00045,
    van: 24500,
    tir: 0.115,
    tea: 0.0825,
    tcea: 0.089,
    created_at: '2024-07-18T15:30:00.000Z',
    updated_at: '2024-07-18T15:30:00.000Z',
  },
];

const paymentSchedules: PaymentSchedule[] = [
  {
    id: 'schedule_01',
    simulation_id: 'simulation_01',
    period_number: 1,
    payment_date: '2024-08-01',
    beginning_balance: 304000,
    principal_payment: 850.45,
    interest_payment: 2096.67,
    insurance_payment: 136.8,
    total_payment: 3083.92,
    ending_balance: 303149.55,
    grace_period: false,
    created_at: '2024-07-18T15:35:00.000Z',
  },
  {
    id: 'schedule_02',
    simulation_id: 'simulation_01',
    period_number: 2,
    payment_date: '2024-09-01',
    beginning_balance: 303149.55,
    principal_payment: 856.32,
    interest_payment: 2090.80,
    insurance_payment: 136.42,
    total_payment: 3083.54,
    ending_balance: 302293.23,
    grace_period: false,
    created_at: '2024-07-18T15:35:00.000Z',
  },
  {
    id: 'schedule_03',
    simulation_id: 'simulation_01',
    period_number: 3,
    payment_date: '2024-10-01',
    beginning_balance: 302293.23,
    principal_payment: 862.23,
    interest_payment: 2084.89,
    insurance_payment: 136.03,
    total_payment: 3083.15,
    ending_balance: 301430.99,
    grace_period: false,
    created_at: '2024-07-18T15:35:00.000Z',
  },
];

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

export const mockApi = {
  demoUserId: DEMO_USER_ID,

  async getProfileByUserId(userId: string | undefined) {
    if (!userId) return null;
    const profile = profiles.find((p) => p.id === userId);
    return profile ? clone(profile) : null;
  },

  async getProfileByEmail(email: string) {
    const profile = profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
    return profile ? clone(profile) : null;
  },

  async upsertProfile(input: NewProfileInput) {
    const timestamp = now();
    if (input.id) {
      const index = profiles.findIndex((p) => p.id === input.id);
      if (index !== -1) {
        profiles[index] = {
          ...profiles[index],
          ...input,
          updated_at: timestamp,
        };
        return clone(profiles[index]);
      }
    }

    const id = input.id ?? generateId('user');
    const newProfile: Profile = {
      id,
      email: input.email,
      full_name: input.full_name,
      role: input.role,
      company_name: input.company_name,
      phone: input.phone,
      created_at: timestamp,
      updated_at: timestamp,
    };

    profiles.push(newProfile);
    return clone(newProfile);
  },

  async getClients(userId: string | undefined) {
    if (!userId) return [];
    return clone(
      clients
        .filter((client) => client.user_id === userId)
        .sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        ),
    );
  },

  async createClient(userId: string, input: NewClientInput) {
    const timestamp = now();
    const newClient: Client = {
      id: generateId('client'),
      user_id: userId,
      created_at: timestamp,
      updated_at: timestamp,
      ...input,
    };

    clients.unshift(newClient);
    return clone(newClient);
  },

  async getClientById(clientId: string) {
    const client = clients.find((item) => item.id === clientId);
    return client ? clone(client) : null;
  },

  async getProperties(userId: string | undefined) {
    if (!userId) return [];
    return clone(
      properties
        .filter((property) => property.user_id === userId)
        .sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        ),
    );
  },

  async createProperty(userId: string, input: NewPropertyInput) {
    const timestamp = now();
    const newProperty: PropertyUnit = {
      id: generateId('property'),
      user_id: userId,
      created_at: timestamp,
      updated_at: timestamp,
      ...input,
    };

    properties.unshift(newProperty);
    return clone(newProperty);
  },

  async getPropertyById(propertyId: string) {
    const property = properties.find((item) => item.id === propertyId);
    return property ? clone(property) : null;
  },

  async getSimulationsWithRelations(
    userId: string | undefined,
  ): Promise<
    (CreditSimulation & { clients: Client | null; property_units: PropertyUnit | null })[]
  > {
    if (!userId) return [];

    return clone(
      creditSimulations
        .filter((simulation) => simulation.user_id === userId)
        .sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .map((simulation) => {
          const client = clients.find((c) => c.id === simulation.client_id);
          const property = properties.find((p) => p.id === simulation.property_id);
          return {
            ...simulation,
            clients: client ? clone(client) : null,
            property_units: property ? clone(property) : null,
          };
        }),
    );
  },

  async getSimulationById(simulationId: string) {
    const simulation = creditSimulations.find((sim) => sim.id === simulationId);
    return simulation ? clone(simulation) : null;
  },

  async createSimulation(input: NewSimulationInput) {
    const timestamp = now();
    const newSimulation: CreditSimulation = {
      id: generateId('simulation'),
      created_at: timestamp,
      updated_at: timestamp,
      ...input,
    };

    creditSimulations.unshift(newSimulation);
    return clone(newSimulation);
  },

  async getPaymentSchedule(simulationId: string) {
    return clone(
      paymentSchedules
        .filter((item) => item.simulation_id === simulationId)
        .sort((a, b) => a.period_number - b.period_number),
    );
  },

  async createPaymentSchedules(simulationId: string, items: NewPaymentScheduleInput[]) {
    const timestamp = now();
    const created = items.map((item) => {
      const scheduleItem: PaymentSchedule = {
        id: generateId('schedule'),
        simulation_id: simulationId,
        created_at: timestamp,
        ...item,
      };
      paymentSchedules.push(scheduleItem);
      return scheduleItem;
    });

    return clone(created);
  },

  async getStats(userId: string | undefined) {
    if (!userId) {
      return {
        clients: 0,
        properties: 0,
        simulations: 0,
        availableProperties: 0,
      };
    }

    const userClients = clients.filter((client) => client.user_id === userId);
    const userProperties = properties.filter((property) => property.user_id === userId);
    const userSimulations = creditSimulations.filter(
      (simulation) => simulation.user_id === userId,
    );

    return {
      clients: userClients.length,
      properties: userProperties.length,
      simulations: userSimulations.length,
      availableProperties: userProperties.filter(
        (property) => property.status === 'available',
      ).length,
    };
  },

  async clearAuthSession() {
    // Placeholder for future persistence logic
  },
};

export type MockApi = typeof mockApi;

