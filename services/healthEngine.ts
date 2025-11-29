import { UserData, SimulationResult } from '../types';
import { CONST_EX_MALE, CONST_EX_FEMALE, CONST_QX_MALE, CONST_QX_FEMALE, HOURLY_WAGE, ANNUAL_HOURS, RETIREMENT_AGE } from '../constants';

interface Factor {
    label: string;
    hr: number;
}

const simulate = (startAge: number, sex: 'male' | 'female', hr: number) => {
    const qx_data = (sex === 'male') ? CONST_QX_MALE : CONST_QX_FEMALE;
    let lx = 1.0;
    let le = 0.0;
    const curve: number[] = [];

    // Safety check for array bounds
    const safeStartAge = Math.min(startAge, qx_data.length - 1);

    for (let t = safeStartAge; t < 115; t++) {
        let q_base = (t < qx_data.length) ? qx_data[t] : 1.0;
        // Apply Hazard Ratio to the probability of death
        let q_adj = 1 - Math.pow((1 - q_base), hr);
        if (q_adj > 1.0) q_adj = 1.0;

        const lx_next = lx * (1 - q_adj);
        le += (lx + lx_next) / 2.0; // Trapezoidal rule for life expectancy
        curve.push(lx);
        lx = lx_next;
        if (lx < 0.0001) break;
    }
    return { le, curve };
};

// New Economic Model: Calculate Expected Lifetime Earnings based on Survival Probability
const calculateExpectedEarnings = (age: number, curve: number[]) => {
    let totalExpectedEarnings = 0;
    
    // We iterate from current age until retirement age
    const yearsToWork = Math.max(0, RETIREMENT_AGE - age);
    
    for (let i = 0; i < yearsToWork; i++) {
        // Curve[i] is the probability of being alive at age (age + i)
        const probAlive = curve[i] || 0;
        
        // Expected earning for this year = Probability * Annual Wage
        // This naturally decreases as health risk increases, even if LE > 65
        totalExpectedEarnings += probAlive * (HOURLY_WAGE * ANNUAL_HOURS);
    }
    return totalExpectedEarnings;
};

export const runHealthAnalysis = (data: UserData): SimulationResult => {
    const { age, sex, height, weight } = data;
    const ex_table = (sex === 'male') ? CONST_EX_MALE : CONST_EX_FEMALE;
    // Bounds check
    const official_ex = (age < ex_table.length) ? ex_table[age] : 0;

    let factors: Factor[] = [];
    let hr_total = 1.0;

    // --- Hazard Ratio Logic ---
    // BMI
    if (height > 0 && weight > 0) {
        const bmi = weight / Math.pow(height / 100, 2);
        if (bmi < 18.5) factors.push({ label: "低体重", hr: 1.6 });
        else if (bmi >= 30) factors.push({ label: "肥満(重)", hr: 1.3 });
        else if (bmi >= 25) factors.push({ label: "肥満(軽)", hr: 1.1 });
    }

    // Lifestyle
    if (data.alcohol === 'moderate') factors.push({ label: "適度飲酒(Bonus)", hr: 0.9 });
    else if (data.alcohol === 'heavy') factors.push({ label: "多量飲酒", hr: 1.4 });

    if (data.smoking === 'never') factors.push({ label: "非喫煙(Bonus)", hr: 0.85 });
    else if (data.smoking === 'past') factors.push({ label: "過去喫煙", hr: 1.1 });
    else factors.push({ label: "現在喫煙", hr: 1.6 });

    if (data.exercise === 'yes') factors.push({ label: "運動習慣(Bonus)", hr: 0.85 });
    else factors.push({ label: "運動不足", hr: 1.1 });

    if (data.polypharmacy === '1-4') factors.push({ label: "内服薬あり", hr: 1.1 });
    else if (data.polypharmacy === '5+') factors.push({ label: "多剤併用", hr: 1.3 });

    if (data.pylori === 'negative') factors.push({ label: "ピロリ未感染(Bonus)", hr: 0.98 });
    else if (data.pylori === 'current') factors.push({ label: "ピロリ現感染", hr: 1.28 });
    else if (data.pylori === 'eradicated') factors.push({ label: "ピロリ除菌済(Bonus)", hr: 1.05 });

    // History
    if (data.fam_cancer) factors.push({ label: "がん家族歴", hr: 1.1 });
    if (data.parent_long) factors.push({ label: "親が長寿(Bonus)", hr: 0.85 });
    if (data.allergy) factors.push({ label: "アレルギー体質", hr: 1.0 });

    if (data.hist_cancer) factors.push({ label: "がん既往", hr: 1.4 });
    if (data.hist_stroke) factors.push({ label: "脳卒中既往", hr: 2.0 });
    if (data.hist_heart) factors.push({ label: "心疾患既往", hr: 1.8 });
    if (data.dm) factors.push({ label: "糖尿病", hr: 1.3 });
    if (data.htn) factors.push({ label: "高血圧", hr: 1.2 });
    if (data.dl) factors.push({ label: "高脂血症", hr: 1.1 });
    if (data.inf_hep) factors.push({ label: "肝炎ウイルス", hr: 1.2 });
    if (data.inf_hpv) factors.push({ label: "HPV", hr: 1.05 });

    // Calculate Total HR
    factors.forEach(f => hr_total *= f.hr);
    hr_total = Math.max(hr_total, 0.3);

    // --- Simulation ---
    // 1. Base Simulation (Average person of this age/sex)
    const sim_base = simulate(age, sex, 1.0);
    const bias = official_ex - sim_base.le; // Calibration to match official tables

    // 2. User Simulation
    const sim_user = simulate(age, sex, hr_total);
    const final_le = Math.max(0.1, sim_user.le + bias);
    const diff = final_le - official_ex;

    // 3. Median Calculation
    let median_age = age + final_le;
    if (sim_user.curve && sim_user.curve.length > 0) {
        for (let i = 0; i < sim_user.curve.length; i++) {
            if (sim_user.curve[i] <= 0.5) {
                const prev = i > 0 ? sim_user.curve[i - 1] : 1.0;
                const curr = sim_user.curve[i];
                const frac = (prev - 0.5) / (prev - curr);
                median_age = (age + i - 1) + frac;
                break;
            }
        }
    }

    // --- Economic & Ideal Analysis ---
    // Calculate "Ideal" HR (what if they fixed lifestyle?)
    let hr_ideal = 1.0;
    const immutable_factors = ['がん家族歴', '親が長寿(Bonus)', 'がん既往', '脳卒中既往', '心疾患既往', '糖尿病', '高血圧', '高脂血症', 'アレルギー体質'];
    factors.forEach(f => {
        if (immutable_factors.includes(f.label)) hr_ideal *= f.hr;
        else if (f.label.includes("Bonus")) hr_ideal *= f.hr;
    });
    // Apply "Good" habits
    if (data.smoking !== 'never') hr_ideal *= 0.85; 
    if (data.exercise !== 'yes') hr_ideal *= 0.85; 
    if (data.alcohol === 'heavy') hr_ideal *= 0.9;
    
    // Simulate Ideal
    const sim_ideal = simulate(age, sex, hr_ideal);
    
    // Economic Calculation Fix:
    // Instead of using simple Life Expectancy diff (which is 0 if both > 65),
    // we use the Sum of (Probability of Working * Wage).
    // Risk factors reduce Probability of Working (Survival) slightly every year.
    const earningsCurrent = calculateExpectedEarnings(age, sim_user.curve);
    const earningsAvg = calculateExpectedEarnings(age, sim_base.curve);
    const earningsIdeal = calculateExpectedEarnings(age, sim_ideal.curve);

    // If earningsCurrent < earningsAvg, that is a loss.
    // If earningsIdeal > earningsCurrent, that is a potential gain.
    
    // Note: We use Math.floor to keep integers
    const currentLoss = Math.max(0, earningsAvg - earningsCurrent);
    const potentialGain = Math.max(0, earningsIdeal - earningsCurrent);

    // Prepare Curve Data for Chart
    const chartData = sim_user.curve.map((prob, i) => ({
        age: age + i,
        survival: prob,
        avgSurvival: sim_base.curve[i] || 0
    })).filter((_, i) => (age + i) <= 105); // Cap chart at 105 for readability

    // Individual Factor Impact for Breakdown
    const factorImpacts = factors.map(f => {
        // Approximate impact on LE
        const sim_f = simulate(age, sex, f.hr);
        return {
            label: f.label,
            hr: f.hr,
            impact: (sim_f.le + bias) - official_ex
        };
    }).sort((a, b) => b.impact - a.impact);

    return {
        le: parseFloat(final_le.toFixed(2)),
        lifespan: parseFloat((age + final_le).toFixed(1)),
        median: parseFloat(median_age.toFixed(1)),
        diff: parseFloat(diff.toFixed(2)),
        official: parseFloat(official_ex.toFixed(2)),
        curve: chartData,
        economic: {
            currentLoss,
            potentialGain,
            workYearsAvg: 0, // Deprecated in favor of monetary value
            workYearsCurrent: 0 // Deprecated
        },
        factors: factorImpacts
    };
};
