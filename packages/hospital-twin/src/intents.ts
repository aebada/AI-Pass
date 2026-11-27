import type { BoardSpec, CommandCenterSnapshot, IntentAnswer, KpiValue, RoleId } from './types.js';
import { refuseIfNeeded } from './roles.js';

export const GOLDEN_QUESTIONS: { id: string; intentId: string; en: string }[] = [
  { id: 'q1', intentId: 'overview', en: 'Give me the hospital status right now.' },
  { id: 'q2', intentId: 'occupancy', en: 'What is the overall bed occupancy?' },
  { id: 'q3', intentId: 'bed_availability', en: 'How many beds are available in ICU?' },
  { id: 'q4', intentId: 'crowded_ward', en: 'Which ward has the highest occupancy?' },
  { id: 'q5', intentId: 'occupancy_trend', en: 'Show me occupancy for the last 7 days.' },
  { id: 'q6', intentId: 'blocked_beds', en: 'How many beds are blocked or out of service and why?' },
  { id: 'q7', intentId: 'pending_discharges', en: 'How many discharges are pending and which units?' },
  { id: 'q8', intentId: 'turnaround', en: 'How long does it take to turn over a bed on average?' },
  { id: 'q9', intentId: 'ed_status', en: 'How many patients are in the ER now?' },
  { id: 'q10', intentId: 'ed_waiting', en: 'How many are waiting and for how long?' },
  { id: 'q11', intentId: 'wait_time', en: 'What is the door-to-doctor time today versus yesterday?' },
  { id: 'q12', intentId: 'boarding', en: 'How many patients are boarding in the ER?' },
  { id: 'q13', intentId: 'lwbs', en: 'How many left without being seen today?' },
  { id: 'q14', intentId: 'forecast_arrivals', en: 'What is the expected arrival volume tonight?' },
  { id: 'q15', intentId: 'forecast_occupancy', en: 'What will occupancy be tomorrow morning?' },
  { id: 'q16', intentId: 'forecast_discharges', en: 'How many discharges do we expect before 2 pm?' },
  { id: 'q17', intentId: 'explain', en: 'Why did ER waiting go up this afternoon?' },
  { id: 'q18', intentId: 'what_went_wrong', en: 'What went wrong today?' },
  { id: 'q19', intentId: 'tomorrow_risks', en: 'What are tomorrow\'s biggest risks?' },
  { id: 'q20', intentId: 'stockout', en: 'Which critical items will run out this week?' },
  { id: 'q21', intentId: 'oxygen', en: 'How many days of oxygen do we have?' },
  { id: 'q22', intentId: 'late_pos', en: 'Which purchase orders are late?' },
  { id: 'q23', intentId: 'equipment_down', en: 'Is any critical equipment down?' },
  { id: 'q24', intentId: 'maintenance', en: 'What is the maintenance backlog?' },
  { id: 'q25', intentId: 'staffing', en: 'Are we short on nurses tonight?' },
  { id: 'q26', intentId: 'overtime', en: 'Where are we using the most overtime?' },
  { id: 'q27', intentId: 'or_util', en: 'How is OR utilization this week?' },
  { id: 'q28', intentId: 'ct_tat', en: 'What is the CT turnaround time today?' },
  { id: 'q29', intentId: 'compare', en: 'Compare this week with last week.' },
  { id: 'q30', intentId: 'provenance', en: 'Show me where that number came from.' },
];

function pick(kpis: KpiValue[], id: string): KpiValue | undefined {
  return kpis.find((k) => k.id === id);
}

function fmt(k?: KpiValue): string {
  if (!k) return 'n/a';
  return `${k.value}${k.unit === '%' || k.unit === 'h' || k.unit === 'min' || k.unit === 'days' ? k.unit === '%' ? '%' : ` ${k.unit}` : ''}`;
}

export function resolveIntent(
  question: string,
  snap: CommandCenterSnapshot,
  role: RoleId = 'coo',
): IntentAnswer {
  const q = question.toLowerCase();
  let intentId = 'overview';

  const matchers: Array<[string, RegExp]> = [
    ['overview', /hospital status|overview|وضع المستشفى/i],
    ['bed_availability', /beds? (free|available).*icu|icu.*beds?|كام سرير/i],
    ['occupancy', /overall bed occupancy|occupancy\?/i],
    ['occupancy_trend', /occupancy for the last|last 7 days|إشغال/i],
    ['crowded_ward', /highest occupancy|most crowded|ward/i],
    ['blocked_beds', /blocked|out of service/i],
    ['pending_discharges', /pending discharge/i],
    ['turnaround', /turn over a bed|turnaround/i],
    ['ed_status', /patients are in the er|emergency room|ed census|الطوارئ/i],
    ['ed_waiting', /how many are waiting|waiting and for how long/i],
    ['wait_time', /door[- ]to[- ](doctor|provider)|door to doctor/i],
    ['boarding', /boarding/i],
    ['lwbs', /left without being seen|lwbs/i],
    ['staffing', /short on nurses|staffing|تمريض|nurses tonight/i],
    ['overtime', /overtime/i],
    ['forecast_arrivals', /arrival volume|arrivals? (tonight|expected)/i],
    ['forecast_occupancy', /occupancy be tomorrow|forecast.*occup/i],
    ['forecast_discharges', /discharges do we expect|before 2/i],
    ['explain', /why did er waiting|why.*waiting/i],
    ['what_went_wrong', /what went wrong|إيه اللي حصل/i],
    ['tomorrow_risks', /tomorrow.*risk/i],
    ['stockout', /run out|stock[- ]?out|أصناف/i],
    ['oxygen', /oxygen/i],
    ['late_pos', /purchase orders? are late|late po/i],
    ['equipment_down', /equipment down|critical equipment|أجهزة/i],
    ['maintenance', /maintenance backlog/i],
    ['or_util', /or utilization/i],
    ['ct_tat', /ct turnaround/i],
    ['compare', /compare this week/i],
    ['provenance', /where that number came from|lineage|provenance/i],
    ['alerts', /critical alerts|التنبيهات/i],
    ['handover', /handover|تسليم/i],
    ['drill', /break it down|by ward/i],
  ];

  for (const [id, re] of matchers) {
    if (re.test(q) || re.test(question)) {
      intentId = id;
      break;
    }
  }

  const refusal = refuseIfNeeded(role, intentId);
  if (refusal) {
    return {
      intentId,
      question,
      spokenSummary: refusal,
      kpis: [],
      refused: true,
      refusalReason: refusal,
      provenance: [],
    };
  }

  const k = snap.kpis;
  const board = (id: string): BoardSpec | undefined => snap.boards.find((b) => b.id === id);
  let spoken = '';
  let boardId: string | undefined;
  let selected: KpiValue[] = [];

  switch (intentId) {
    case 'overview':
      boardId = 'executive';
      selected = [pick(k, 'CAP-01'), pick(k, 'CAP-02'), pick(k, 'ED-03'), pick(k, 'ED-08'), pick(k, 'EQ-02'), pick(k, 'SUP-02'), pick(k, 'ALR-01')].filter(Boolean) as KpiValue[];
      spoken = `Demo General Hospital: occupancy ${fmt(pick(k, 'CAP-01'))}, ${fmt(pick(k, 'CAP-02'))} beds free, ED waiting ${fmt(pick(k, 'ED-03'))}, boarding ${fmt(pick(k, 'ED-08'))}, ${fmt(pick(k, 'ALR-01'))} open alerts.`;
      break;
    case 'occupancy':
      selected = [pick(k, 'CAP-01')!];
      spoken = `Overall bed occupancy is ${fmt(pick(k, 'CAP-01'))}.`;
      break;
    case 'bed_availability': {
      const icu = snap.bedGrid.filter((g) => g.unitCode.includes('ICU') || g.unitCode.includes('CICU'));
      const free = icu.reduce((s, g) => s + g.available, 0);
      selected = [pick(k, 'CAP-02')!];
      spoken = `ICU/CICU available beds now: ${free}.`;
      break;
    }
    case 'crowded_ward': {
      const top = [...snap.bedGrid].sort((a, b) => b.occupied / Math.max(1, b.staffed) - a.occupied / Math.max(1, a.staffed))[0];
      spoken = top
        ? `${top.unitCode} is most crowded at ${Math.round((top.occupied / Math.max(1, top.staffed)) * 100)}% (${top.occupied}/${top.staffed}).`
        : 'No ward data.';
      boardId = 'capacity';
      break;
    }
    case 'occupancy_trend':
      spoken = `Occupancy trend (synthetic 7d): currently ${fmt(pick(k, 'CAP-01'))}. Forecast band available on the executive board.`;
      selected = [pick(k, 'CAP-01')!];
      boardId = 'executive';
      break;
    case 'blocked_beds':
      selected = [pick(k, 'CAP-05')!];
      spoken = `${fmt(pick(k, 'CAP-05'))} beds blocked or out of service (maintenance/blocked statuses).`;
      break;
    case 'pending_discharges':
      selected = [pick(k, 'ADM-05')!];
      spoken = `${fmt(pick(k, 'ADM-05'))} discharges pending (discharge-ordered).`;
      break;
    case 'turnaround':
      selected = [pick(k, 'CAP-04')!];
      spoken = `Median bed turnaround is ${fmt(pick(k, 'CAP-04'))}.`;
      break;
    case 'ed_status':
      boardId = 'ed';
      selected = [pick(k, 'ED-02')!];
      spoken = `ED census is ${fmt(pick(k, 'ED-02'))} patients.`;
      break;
    case 'ed_waiting':
      selected = [pick(k, 'ED-03'), pick(k, 'ED-04')].filter(Boolean) as KpiValue[];
      spoken = `${fmt(pick(k, 'ED-03'))} waiting; door-to-triage median ${fmt(pick(k, 'ED-04'))}.`;
      boardId = 'ed';
      break;
    case 'wait_time':
      selected = [pick(k, 'ED-05')!];
      spoken = `Door-to-provider median today is ${fmt(pick(k, 'ED-05'))} (yesterday baseline ~${Math.max(20, (pick(k, 'ED-05')?.value ?? 40) - 8)} min in demo).`;
      break;
    case 'boarding':
      selected = [pick(k, 'ED-08'), pick(k, 'ED-09')].filter(Boolean) as KpiValue[];
      spoken = `${fmt(pick(k, 'ED-08'))} boarding; median boarding time ${fmt(pick(k, 'ED-09'))}.`;
      break;
    case 'lwbs':
      selected = [pick(k, 'ED-07')!];
      spoken = `LWBS rate ${fmt(pick(k, 'ED-07'))}.`;
      break;
    case 'forecast_arrivals':
      spoken = `Tonight ED arrivals forecast: ${snap.forecasts.find((f) => f.id === 'ed_arrivals')?.points.slice(-6).reduce((s, p) => s + p.value, 0) ?? 28} expected visits (next 6h band).`;
      break;
    case 'forecast_occupancy':
      spoken = `Tomorrow morning occupancy forecast ≈ ${snap.forecasts.find((f) => f.id === 'occupancy')?.points[0]?.value ?? pick(k, 'CAP-01')?.value}% (± band on executive board).`;
      selected = [pick(k, 'CAP-01')!];
      break;
    case 'forecast_discharges':
      spoken = `Expected discharges before 14:00: ~${Math.max(4, Math.round((pick(k, 'ADM-02')?.value ?? 10) * 0.35))} based on LOS and discharge orders.`;
      break;
    case 'explain':
      spoken = snap.activeScenario
        ? `ER waiting rose because scenario "${snap.activeScenario}" is active — see timeline: ${snap.scenarioTimeline.slice(-2).map((t) => t.event).join('; ')}.`
        : `ER waiting is ${fmt(pick(k, 'ED-03'))}. Main drivers in baseline: afternoon arrival peak and cleaning delays (${fmt(pick(k, 'CAP-03'))} beds cleaning).`;
      selected = [pick(k, 'ED-03')!];
      break;
    case 'what_went_wrong':
      boardId = 'digest';
      spoken =
        snap.alerts.slice(0, 3).map((a) => a.title).join('; ') ||
        'No critical anomalies in the current window — operations within warn thresholds.';
      break;
    case 'tomorrow_risks':
      spoken = `Top risks: occupancy ${fmt(pick(k, 'CAP-01'))}, stock-out risk ${fmt(pick(k, 'SUP-02'))}, staffing coverage ${fmt(pick(k, 'STF-01'))}.`;
      break;
    case 'stockout':
      boardId = 'supply';
      selected = [pick(k, 'SUP-01'), pick(k, 'SUP-02')].filter(Boolean) as KpiValue[];
      spoken = `Critical stock: min ${fmt(pick(k, 'SUP-01'))} remaining; ${fmt(pick(k, 'SUP-02'))} items under reorder point.`;
      break;
    case 'oxygen':
      selected = [pick(k, 'SUP-04')!];
      spoken = `Oxygen reserve ${fmt(pick(k, 'SUP-04'))} (~${((pick(k, 'SUP-04')?.value ?? 0) / 24).toFixed(1)} days).`;
      break;
    case 'late_pos':
      selected = [pick(k, 'SUP-03')!];
      spoken = `${fmt(pick(k, 'SUP-03'))} late purchase orders.`;
      break;
    case 'equipment_down':
      boardId = 'equipment';
      selected = [pick(k, 'EQ-02')!];
      spoken = pick(k, 'EQ-02')?.value
        ? `${fmt(pick(k, 'EQ-02'))} critical equipment down — see equipment board.`
        : 'No critical equipment currently down.';
      break;
    case 'maintenance':
      selected = [pick(k, 'EQ-03'), pick(k, 'EQ-04')].filter(Boolean) as KpiValue[];
      spoken = `Maintenance backlog ${fmt(pick(k, 'EQ-03'))}; MTTR ${fmt(pick(k, 'EQ-04'))}.`;
      break;
    case 'staffing':
      boardId = 'staffing';
      selected = [pick(k, 'STF-01')!];
      spoken =
        (pick(k, 'STF-01')?.value ?? 100) < 90
          ? `Yes — staffing coverage ${fmt(pick(k, 'STF-01'))}, below warn threshold.`
          : `Coverage ${fmt(pick(k, 'STF-01'))}; no critical nurse shortfall in the current roster.`;
      break;
    case 'overtime':
      selected = [pick(k, 'STF-02')!];
      spoken = `Estimated overtime ${fmt(pick(k, 'STF-02'))}, concentrated where coverage gaps exist.`;
      break;
    case 'or_util':
      selected = [pick(k, 'OR-01'), pick(k, 'OR-02')].filter(Boolean) as KpiValue[];
      spoken = `OR utilization ${fmt(pick(k, 'OR-01'))}; first-case on-time ${fmt(pick(k, 'OR-02'))}.`;
      break;
    case 'ct_tat':
      selected = [pick(k, 'DX-02')!];
      spoken = `Imaging turnaround (incl. CT) median ${fmt(pick(k, 'DX-02'))}.`;
      break;
    case 'compare':
      spoken = `This week occupancy ${fmt(pick(k, 'CAP-01'))} vs last week demo baseline ~${Math.max(60, (pick(k, 'CAP-01')?.value ?? 80) - 4)}% (synthetic compare).`;
      selected = [pick(k, 'CAP-01')!];
      break;
    case 'provenance': {
      const target = pick(k, 'CAP-01') ?? k[0];
      selected = target ? [target] : [];
      spoken = target
        ? `${target.id} from ${target.provenance.sourceSystem} as of ${target.provenance.asOf}; definition: ${target.provenance.definition}; metric ${target.provenance.metricVersion}.`
        : 'No KPI selected.';
      break;
    }
    case 'alerts':
      spoken = snap.alerts.filter((a) => a.severity === 'critical').map((a) => a.title).join('; ') || 'No critical alerts.';
      break;
    case 'handover':
      boardId = 'handover';
      spoken = `Shift handover: occupancy ${fmt(pick(k, 'CAP-01'))}, ED waiting ${fmt(pick(k, 'ED-03'))}, open alerts ${fmt(pick(k, 'ALR-01'))}.`;
      break;
    case 'drill':
      boardId = 'capacity';
      spoken = snap.bedGrid
        .slice(0, 5)
        .map((g) => `${g.unitCode} ${Math.round((g.occupied / Math.max(1, g.staffed)) * 100)}%`)
        .join(', ');
      break;
    default:
      spoken = board('executive')?.notes[0] ?? 'Opening executive overview.';
      boardId = 'executive';
  }

  const provenance = selected.map((s) => s.provenance);
  return {
    intentId,
    question,
    spokenSummary: spoken,
    boardId,
    kpis: selected,
    alerts: intentId === 'what_went_wrong' || intentId === 'alerts' ? snap.alerts : undefined,
    provenance,
  };
}
