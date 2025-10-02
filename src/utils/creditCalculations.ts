export interface PaymentScheduleItem {
  period_number: number;
  payment_date: string;
  beginning_balance: number;
  principal_payment: number;
  interest_payment: number;
  insurance_payment: number;
  total_payment: number;
  ending_balance: number;
  grace_period: boolean;
}

export interface CreditCalculationParams {
  loan_amount: number;
  annual_interest_rate: number;
  interest_rate_type: 'nominal' | 'effective';
  capitalization?: 'monthly' | 'bimonthly' | 'quarterly' | 'semiannual' | 'annual';
  loan_term_years: number;
  grace_period_type: 'none' | 'total' | 'partial';
  grace_period_months: number;
  insurance_rate: number;
  start_date?: Date;
}

export interface CreditCalculationResult {
  payment_schedule: PaymentScheduleItem[];
  tea: number;
  tcea: number;
  van: number;
  tir: number;
}

function getCapitalizationPeriodsPerYear(capitalization: string): number {
  const periods: Record<string, number> = {
    monthly: 12,
    bimonthly: 6,
    quarterly: 4,
    semiannual: 2,
    annual: 1,
  };
  return periods[capitalization] || 12;
}

function nominalToEffectiveRate(nominalRate: number, capitalization: string): number {
  const m = getCapitalizationPeriodsPerYear(capitalization);
  return Math.pow(1 + nominalRate / m, m) - 1;
}

function calculateMonthlyRate(annualRate: number, rateType: string, capitalization?: string): number {
  let effectiveAnnualRate = annualRate;

  if (rateType === 'nominal' && capitalization) {
    effectiveAnnualRate = nominalToEffectiveRate(annualRate, capitalization);
  }

  return Math.pow(1 + effectiveAnnualRate, 1 / 12) - 1;
}

export function calculateCreditSchedule(params: CreditCalculationParams): CreditCalculationResult {
  const {
    loan_amount,
    annual_interest_rate,
    interest_rate_type,
    capitalization,
    loan_term_years,
    grace_period_type,
    grace_period_months,
    insurance_rate,
    start_date = new Date(),
  } = params;

  const monthly_rate = calculateMonthlyRate(annual_interest_rate, interest_rate_type, capitalization);
  const monthly_insurance = insurance_rate / 12;
  const total_periods = loan_term_years * 12;
  const payment_periods = total_periods - grace_period_months;

  const schedule: PaymentScheduleItem[] = [];
  let balance = loan_amount;
  let current_date = new Date(start_date);

  const fixed_payment =
    grace_period_type !== 'none' && payment_periods > 0
      ? (balance * monthly_rate * Math.pow(1 + monthly_rate, payment_periods)) /
        (Math.pow(1 + monthly_rate, payment_periods) - 1)
      : 0;

  for (let period = 1; period <= total_periods; period++) {
    const is_grace_period = period <= grace_period_months;
    const interest_payment = balance * monthly_rate;
    const insurance_payment = balance * monthly_insurance;

    let principal_payment = 0;
    let total_payment = 0;

    if (is_grace_period) {
      if (grace_period_type === 'total') {
        principal_payment = 0;
        total_payment = insurance_payment;
      } else if (grace_period_type === 'partial') {
        principal_payment = 0;
        total_payment = interest_payment + insurance_payment;
      }
    } else {
      principal_payment = fixed_payment - interest_payment;
      total_payment = fixed_payment + insurance_payment;
    }

    const ending_balance = balance - principal_payment;

    schedule.push({
      period_number: period,
      payment_date: new Date(current_date).toISOString().split('T')[0],
      beginning_balance: balance,
      principal_payment,
      interest_payment,
      insurance_payment,
      total_payment,
      ending_balance: ending_balance > 0.01 ? ending_balance : 0,
      grace_period: is_grace_period,
    });

    balance = ending_balance > 0.01 ? ending_balance : 0;
    current_date.setMonth(current_date.getMonth() + 1);
  }

  let tea = annual_interest_rate;
  if (interest_rate_type === 'nominal' && capitalization) {
    tea = nominalToEffectiveRate(annual_interest_rate, capitalization);
  }

  const cash_flows = [-loan_amount, ...schedule.map((s) => -s.total_payment)];
  const tir = calculateIRR(cash_flows);

  const discount_rate = tea;
  let van = -loan_amount;
  for (let i = 0; i < schedule.length; i++) {
    van += schedule[i].total_payment / Math.pow(1 + discount_rate, (i + 1) / 12);
  }

  const total_paid = schedule.reduce((sum, s) => sum + s.total_payment, 0);
  const tcea = Math.pow(total_paid / loan_amount, 12 / total_periods) - 1;

  return {
    payment_schedule: schedule,
    tea,
    tcea,
    van,
    tir,
  };
}

function calculateIRR(cashFlows: number[], guess: number = 0.1): number {
  const maxIterations = 100;
  const tolerance = 0.00001;

  let rate = guess;

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let dnpv = 0;

    for (let t = 0; t < cashFlows.length; t++) {
      npv += cashFlows[t] / Math.pow(1 + rate, t);
      dnpv += (-t * cashFlows[t]) / Math.pow(1 + rate, t + 1);
    }

    const newRate = rate - npv / dnpv;

    if (Math.abs(newRate - rate) < tolerance) {
      return newRate;
    }

    rate = newRate;
  }

  return rate;
}
