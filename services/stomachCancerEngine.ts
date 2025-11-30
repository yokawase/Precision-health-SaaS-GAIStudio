import { UserData, StomachCancerResult } from '../types';

// PDFに基づくロジスティック回帰モデルの係数
const COEFFICIENTS = {
    intercept: -7.5,
    birth_year_cat: { 1990: 0, 1980: 0.2, 1970: 0.5, 1960: 0.9, 1950: 1.4, 1940: 2.0 },
    sex_M: 0.6,
    pylori_infected: 2.5,
    pylori_eradicated: 0.8,
    atrophy_yes: 1.5,
    family_history_yes: 0.5,
    diabetes_yes: 0.2,
    smoking_current: 0.8,
    smoking_past: 0.3,
    drinking_heavy: 0.6,
    drinking_moderate: 0.2,
};

const THRESHOLDS = { medium: 0.565, high: 0.660 };

export const calculateStomachRisk = (data: UserData): StomachCancerResult => {
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - data.age;
    
    // 生まれた年代の判定
    let birthDecadeKey: keyof typeof COEFFICIENTS.birth_year_cat = 1990;
    if (birthYear >= 1990) birthDecadeKey = 1990;
    else if (birthYear >= 1980) birthDecadeKey = 1980;
    else if (birthYear >= 1970) birthDecadeKey = 1970;
    else if (birthYear >= 1960) birthDecadeKey = 1960;
    else if (birthYear >= 1950) birthDecadeKey = 1950;
    else birthDecadeKey = 1940;

    // 必須データのチェック
    if (data.pylori === 'unknown' || data.atrophic_gastritis === 'unknown') {
        return {
            score: 0,
            level: 'unknown',
            advice: '正確なリスクを判定するには、ピロリ菌検査と萎縮性胃炎(胃カメラ等)の情報が重要です。まずはかかりつけ医にご相談ください。',
            contributions: []
        };
    }

    // SHAP風の寄与度計算
    let logit = COEFFICIENTS.intercept;
    const contributions = [];

    const birthVal = COEFFICIENTS.birth_year_cat[birthDecadeKey];
    logit += birthVal;
    contributions.push({ label: '年代', value: birthVal });

    const sexVal = data.sex === 'male' ? COEFFICIENTS.sex_M : 0;
    logit += sexVal;
    contributions.push({ label: '性別', value: sexVal });

    let pyloriVal = 0;
    if (data.pylori === 'current') pyloriVal = COEFFICIENTS.pylori_infected;
    else if (data.pylori === 'eradicated') pyloriVal = COEFFICIENTS.pylori_eradicated;
    logit += pyloriVal;
    contributions.push({ label: 'ピロリ菌', value: pyloriVal });

    const atrophyVal = data.atrophic_gastritis === 'yes' ? COEFFICIENTS.atrophy_yes : 0;
    logit += atrophyVal;
    contributions.push({ label: '萎縮性胃炎', value: atrophyVal });

    const famVal = data.fam_cancer ? COEFFICIENTS.family_history_yes : 0;
    logit += famVal;
    contributions.push({ label: '家族歴', value: famVal });

    const dmVal = data.dm ? COEFFICIENTS.diabetes_yes : 0;
    logit += dmVal;
    contributions.push({ label: '糖尿病', value: dmVal });

    let smokeVal = 0;
    if (data.smoking === 'current') smokeVal = COEFFICIENTS.smoking_current;
    else if (data.smoking === 'past') smokeVal = COEFFICIENTS.smoking_past;
    logit += smokeVal;
    contributions.push({ label: '喫煙', value: smokeVal });

    let drinkVal = 0;
    if (data.alcohol === 'heavy') drinkVal = COEFFICIENTS.drinking_heavy;
    else if (data.alcohol === 'moderate') drinkVal = COEFFICIENTS.drinking_moderate;
    logit += drinkVal;
    contributions.push({ label: '飲酒', value: drinkVal });

    // 確率計算とスコア化
    const rawProb = 1 / (1 + Math.exp(-logit));
    const normalizedScore = Math.round(rawProb * 98) + 1;

    let level: StomachCancerResult['level'] = 'low';
    let advice = '';

    if (rawProb < THRESHOLDS.medium) {
        level = 'low';
        advice = '現在のところリスクは低いと考えられます。健康的な生活習慣を維持し、お住まいの自治体が推奨する胃がん検診（50歳以上が対象）を定期的に受診しましょう。';
    } else if (rawProb < THRESHOLDS.high) {
        level = 'medium';
        advice = 'いくつかのがんリスクが認められます。定期的な胃の検査（胃カメラなど）について、かかりつけ医にご相談ください。生活習慣の見直しも推奨されます。';
    } else {
        level = 'high';
        advice = '胃がんのリスクが比較的高い状態と考えられます。症状がなくても、毎年の内視鏡検査による経過観察が推奨されます。速やかに消化器内科の専門医を受診し、今後の検査計画について詳しく相談してください。';
    }

    const sortedContributions = contributions
        .filter(c => c.value !== 0)
        .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
        .map(c => ({
            label: c.label,
            value: c.value,
            isPositive: c.value > 0
        }));

    return {
        score: normalizedScore,
        level,
        advice,
        contributions: sortedContributions
    };
};