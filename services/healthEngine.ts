import { UserData, SimulationResult } from '../types';
import { CONST_EX_MALE, CONST_EX_FEMALE, CONST_QX_MALE, CONST_QX_FEMALE, HOURLY_WAGE, ANNUAL_HOURS, RETIREMENT_AGE } from '../constants';
import { calculateStomachRisk } from './stomachCancerEngine';

interface Factor {
    label: string;
    hr: number;
}

const simulate = (startAge: number, sex: 'male' | 'female', hr: number) => {
    const qx_data = (sex === 'male') ? CONST_QX_MALE : CONST_QX_FEMALE;
    let lx = 1.0;
    let le = 0.0;
    const curve: number[] = [];
    const safeStartAge = Math.min(startAge, qx_data.length - 1);

    for (let t = safeStartAge; t < 115; t++) {
        let q_base = (t < qx_data.length) ? qx_data[t] : 1.0;
        let q_adj = 1 - Math.pow((1 - q_base), hr);
        if (q_adj > 1.0) q_adj = 1.0;

        const lx_next = lx * (1 - q_adj);
        le += (lx + lx_next) / 2.0;
        curve.push(lx);
        lx = lx_next;
        if (lx < 0.0001) break;
    }
    return { le, curve };
};

const calculateExpectedEarnings = (age: number, curve: number[]) => {
    let totalExpectedEarnings = 0;
    const yearsToWork = Math.max(0, RETIREMENT_AGE - age);
    
    for (let i = 0; i < yearsToWork; i++) {
        const probAlive = curve[i] || 0;
        totalExpectedEarnings += probAlive * (HOURLY_WAGE * ANNUAL_HOURS);
    }
    return totalExpectedEarnings;
};

export const runHealthAnalysis = (data: UserData): SimulationResult => {
    const { age, sex, height, weight } = data;
    const ex_table = (sex === 'male') ? CONST_EX_MALE : CONST_EX_FEMALE;
    const official_ex = (age < ex_table.length) ? ex_table[age] : 0;

    let factors: Factor[] = [];
    let hr_total = 1.0;

    // BMI Calculation
    if (height > 0 && weight > 0) {
        const bmi = weight / Math.pow(height / 100, 2);
        if (bmi < 18.5) factors.push({ label: "低体重", hr: 1.6 });
        else if (bmi >= 30) factors.push({ label: "肥満(重)", hr: 1.3 });
        else if (bmi >= 25) factors.push({ label: "肥満(軽)", hr: 1.1 });
    }

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

    factors.forEach(f => hr_total *= f.hr);
    hr_total = Math.max(hr_total, 0.3);

    const sim_base = simulate(age, sex, 1.0);
    const bias = official_ex - sim_base.le;

    const sim_user = simulate(age, sex, hr_total);
    const final_le = Math.max(0.1, sim_user.le + bias);
    const diff = final_le - official_ex;

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

    let hr_ideal = 1.0;
    const immutable_factors = ['がん家族歴', '親が長寿(Bonus)', 'がん既往', '脳卒中既往', '心疾患既往', '糖尿病', '高血圧', '高脂血症', 'アレルギー体質'];
    factors.forEach(f => {
        if (immutable_factors.includes(f.label)) hr_ideal *= f.hr;
        else if (f.label.includes("Bonus")) hr_ideal *= f.hr;
    });
    if (data.smoking !== 'never') hr_ideal *= 0.85; 
    if (data.exercise !== 'yes') hr_ideal *= 0.85; 
    if (data.alcohol === 'heavy') hr_ideal *= 0.9;
    
    const sim_ideal = simulate(age, sex, hr_ideal);
    
    const earningsCurrent = calculateExpectedEarnings(age, sim_user.curve);
    const earningsAvg = calculateExpectedEarnings(age, sim_base.curve);
    const earningsIdeal = calculateExpectedEarnings(age, sim_ideal.curve);

    const currentLoss = Math.max(0, earningsAvg - earningsCurrent);
    const potentialGain = Math.max(0, earningsIdeal - earningsCurrent);

    const chartData = sim_user.curve.map((prob, i) => ({
        age: age + i,
        survival: prob,
        avgSurvival: sim_base.curve[i] || 0
    })).filter((_, i) => (age + i) <= 105);

    const factorImpacts = factors.map(f => {
        const sim_f = simulate(age, sex, f.hr);
        return {
            label: f.label,
            hr: f.hr,
            impact: (sim_f.le + bias) - official_ex
        };
    }).sort((a, b) => b.impact - a.impact);

    const stomachRisk = calculateStomachRisk(data);

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
            workYearsAvg: 0,
            workYearsCurrent: 0
        },
        factors: factorImpacts,
        stomachRisk
    };
};