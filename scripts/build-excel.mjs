// Build the "Stakeholdr Map" Excel workbook (.xlsx)
// ExcelJS for workbook/cells/formulas/validation/conditional-formatting,
// fflate for zip surgery to inject the native scatter chart.
// Data is a verbatim snapshot of the app's src/data.js (project/data.js).
// Lessons honored: no leading "=" in <formula1>; relationship colored both
// directly (seeded rows) AND via per-zone CF rules; chart injected via fflate
// (never JSZip); XML-level verification before claiming done.

import ExcelJS from "exceljs";
import { unzipSync, zipSync, strToU8, strFromU8 } from "fflate";
import { writeFileSync } from "node:fs";

// ─────────────────────────────────────────────────────────────────────────
// DATA SNAPSHOT (verbatim from project/data.js - data.js wins)
// ─────────────────────────────────────────────────────────────────────────
const CATEGORIES = {
  "Communities": ["Charity Organization","Church","Community Alliance","Higher Education","K-12 Educator","Local Business","Media","Military Branch","Neighbor","NGO","Tribes","Veterans","Youth Program","Activist Organization","Activist Member","General Public"],
  "Government": ["Agency (Inspector)","Agency (Permit Writer)","City Council Member","City Government","County Government","County Supervisor","Governor's Office","Judicial","Mayor","Regulator (Federal)","Regulator (State)","Regulator (Local)","State Representative","State Senate","US Congress","US Senate"],
  "Our People": ["Community Outreach Lead","Diversity & Inclusion Lead","Executive","General Employee","Former Employee","Contractor","Operations Manager","Marketing Manager","Sales Manager","Retiree"],
  "Industry": ["Competition","Supply Chain","Trade Association","Channel Partners","Industry Analysts","Business Coalition","Economic Development","Labor Union"],
  "Consumers": ["Industry Consumers","Current Customers","Future Customers","Lost Customers"],
  "Investors": ["Board Member","Shareholder","Activist Shareholder","General Public Investor"]
};

const GRID = [
  ["Proactively Defend","Defend","Valuable Relationship","Strategic Partner"],
  ["Defend","Protect","Collaborate","High Value Relationship"],
  ["Protect","Respond","Cooperate","Collaborate"],
  ["Protect","Respond","Cooperate","Collaborate"],
  ["Identify","Identify","Commit","Commit"],
  ["Monitor","Monitor","Maintain","Connect"]
];

const STATUSES = {
  "Proactively Defend":     { tone:"negative", color:"#D26A6A", text:"#FFFFFF", border:"#7a2424", strategy:"Address Key Influencer", action:"Launch plan to neutralize a major threat to the industry or company's license to operate; leverage reputation, resources, subject-matter experts, and other allied stakeholders to win. Measure and report on activity often." },
  "Defend":                 { tone:"negative", color:"#E29A9A", text:"#7a2424", strategy:"Neutralize Threat", action:"Defend license to operate. Defend reputation against regular attacks from stakeholders with high influence who are unlikely to move toward positive support; discredit message or position. Measure and report on activity often." },
  "Protect":                { tone:"negative", color:"#EFBEBE", text:"#7a2424", strategy:"Mobilize Defense", action:"Take action with internal resources and strategy. Defend reputation against regular attacks; manage expectations for changing stakeholder dynamic or group's influence in the community. Measure and report on activity regularly." },
  "Respond":                { tone:"negative", color:"#F4D6D6", text:"#7a2424", strategy:"Challenge Stakeholder", action:"Implement plan to challenge misinformation; reduce stakeholder's ability to destabilize the business or challenge brand identity and reputation." },
  "Identify":               { tone:"negative", color:"#F8E4E4", text:"#7a2424", strategy:"React To Issues Or Conflict", action:"Work to neutralize threat; educate stakeholder; resolve or minimize the stakeholder's ability or willingness to maintain conflict. Assign internal staff, team, or working group to execute response." },
  "Monitor":                { tone:"neutral-low", color:"#F4DBB0", text:"#7a4a14", strategy:"Plan Ahead, Listen", action:"Map stakeholder and plan to respond in the event of change; assign internal staff, team, or working group to execute plan if necessary." },
  "Maintain":               { tone:"neutral-low", color:"#F9E4BD", text:"#7a4a14", strategy:"Take Steps To Introduce Our Vision And Values", action:"Take simple steps to engage; educate and create awareness about the business; look for ways to increase alignment and the stakeholder's influence over time." },
  "Connect":                { tone:"neutral-low", color:"#FCEFD1", text:"#7a4a14", strategy:"Prioritize Resources Elsewhere", action:"Take no action. Prioritize time and resources elsewhere but monitor for any negative changes in alignment or improved influence in the community over time." },
  "Commit":                 { tone:"neutral-low", color:"#FAEACA", text:"#7a4a14", strategy:"Understand Needs, Work Towards Common Purpose", action:"Build greater understanding between our company and stakeholder groups; look for opportunities to continue education and alignment that could lead to improved collaboration or affinity toward the business." },
  "Cooperate":              { tone:"positive", color:"#DDE7C2", text:"#2f5a26", strategy:"Existing Alignment Produces Some Favorable Outcomes", action:"Some value already exists and should continue with moderate level of commitment; maintain existing level of relationship." },
  "Collaborate":            { tone:"positive", color:"#C2D9A4", text:"#2f5a26", strategy:"Investing In Relationship Will Improve Our Business Or Reputation", action:"Commitment important to our business; establish opportunities to work together and reap mutual benefits; leverage stakeholder's influence to increase our reputation." },
  "Valuable Relationship":  { tone:"positive", color:"#B1CF92", text:"#2f5a26", strategy:"Stakeholder Important To Our Business Success", action:"Stakeholder is an important surrogate, ally, or business partner. Investing in and growing this relationship proactively supports and defends the business and increases our reputation. Prioritize collaboration and deploying engagement strategies." },
  "High Value Relationship":{ tone:"positive", color:"#97C57A", text:"#2f5a26", strategy:"Shared Value Introduced", action:"Moderate shared value introduced; investing and growing this relationship produces value for our business and increases our reputation. Prioritize collaboration and engaging the stakeholder often to meet business and advocacy goals." },
  "Strategic Partner":      { tone:"positive", color:"#74B556", text:"#FFFFFF", border:"#1f3f17", strategy:"Shared Value Created", action:"Shared value created. Formalize a working relationship or partnership with the stakeholder to produce and measure shared value; relationship grows the business, increases our reputation, and produces solutions." }
};

const STATUS_ORDER = ["Proactively Defend","Defend","Protect","Respond","Identify","Monitor","Maintain","Connect","Commit","Cooperate","Collaborate","Valuable Relationship","High Value Relationship","Strategic Partner"];

const MARKETS = { "Americas":["United States","Canada","Mexico"], "LATAM":["Brazil","Other Countries"], "EMEA":["Europe","Middle East","Africa"], "APJ":["Emerging APAC","Japan"] };
const GEOGRAPHIES = ["National (all)","Federal","State","Local"];
const PRIORITIES = ["High","Medium","Low"];
const WS_STATUSES = ["Active","Watch","Dormant","Inactive"];

// teammate order drives Scoring columns
const TEAM = [
  { id:"tm-alex",   name:"Alex Rivera",  weight:1.5 },
  { id:"tm-jordan", name:"Jordan Kim",   weight:1.2 },
  { id:"tm-sam",    name:"Sam Okafor",   weight:1.0 },
  { id:"tm-priya",  name:"Priya Patel",  weight:0.8 },
  { id:"tm-devon",  name:"Devon Wright", weight:0.7 }
];

// Stakeholder identity (x/y computed live from scores)
const STAKEHOLDERS = [
  { name:"Mayor Maria Chen", org:"City of Cedarville", category:"Government", type:"Mayor", market:"Americas", region:"United States", geography:"Local", state:"California", site:"Palo Alto, CA", priority:"High", status:"Active", notes:"Generally supportive; cares about local jobs and waterfront access." },
  { name:"Cedarville Chamber", org:"Cedarville Chamber", category:"Communities", type:"Local Business", market:"Americas", region:"United States", geography:"Local", state:"", site:"", priority:"Medium", status:"Active", notes:"Strong partner on workforce initiatives." },
  { name:"Riverside Tribune", org:"Riverside Tribune", category:"Communities", type:"Media", market:"Americas", region:"United States", geography:"Local", state:"", site:"", priority:"High", status:"Active", notes:"Beat reporter looking for new angles on emissions story." },
  { name:"Local 412 Steelworkers", org:"Local 412 Steelworkers", category:"Industry", type:"Labor Union", market:"Americas", region:"United States", geography:"Local", state:"Oregon", site:"Corvallis, OR", priority:"High", status:"Active", notes:"Contract negotiations open in Q3." },
  { name:"Rep. James Park", org:"US House of Representatives", category:"Government", type:"US Congress", market:"Americas", region:"United States", geography:"Federal", state:"", site:"", priority:"High", status:"Active", notes:"Supportive on permitting reform." },
  { name:"Save Our River Coalition", org:"Save Our River Coalition", category:"Communities", type:"Activist Organization", market:"Americas", region:"United States", geography:"Local", state:"", site:"", priority:"High", status:"Watch", notes:"Filed FOIA on discharge permits in March." },
  { name:"State EPA", org:"State EPA", category:"Government", type:"Regulator (State)", market:"Americas", region:"United States", geography:"State", state:"", site:"", priority:"High", status:"Active", notes:"Air-permit renewal in review." },
  { name:"Pinewood Schools", org:"Pinewood Schools", category:"Communities", type:"K-12 Educator", market:"Americas", region:"United States", geography:"Local", state:"Washington", site:"Vancouver, WA", priority:"Medium", status:"Active", notes:"STEM partnership renewing this fall." },
  { name:"First Methodist", org:"First Methodist", category:"Communities", type:"Church", market:"Americas", region:"United States", geography:"Local", state:"", site:"", priority:"Low", status:"Dormant", notes:"Pastor open to facility tours." },
  { name:"VFW Post 117", org:"VFW Post 117", category:"Communities", type:"Veterans", market:"Americas", region:"United States", geography:"Local", state:"Oregon", site:"", priority:"Medium", status:"Active", notes:"Hosted community day in April." },
  { name:"Riverbend Hospital Board", org:"Riverbend Hospital Board", category:"Investors", type:"Board Member", market:"Americas", region:"United States", geography:"Local", state:"", site:"", priority:"High", status:"Active", notes:"Quarterly briefing scheduled." },
  { name:"Helios Capital", org:"Helios Capital", category:"Investors", type:"Activist Shareholder", market:"Americas", region:"United States", geography:"National (all)", state:"", site:"", priority:"High", status:"Watch", notes:"Submitted proxy proposal on board composition." },
  { name:"Bayside Distribution", org:"Bayside Distribution", category:"Industry", type:"Channel Partners", market:"Americas", region:"United States", geography:"National (all)", state:"", site:"", priority:"Medium", status:"Active", notes:"Renewing distribution contract." },
  { name:"Sarah Voss", org:"Internal Operations", category:"Our People", type:"Executive", market:"Americas", region:"United States", geography:"National (all)", state:"", site:"", priority:"High", status:"Active", notes:"VP Ops; champion for plant modernization." },
  { name:"Cedar Valley Tribes Council", org:"Cedar Valley Tribes Council", category:"Communities", type:"Tribes", market:"Americas", region:"United States", geography:"Federal", state:"", site:"", priority:"High", status:"Active", notes:"Consultation on watershed plan ongoing." },
  { name:"County Supervisor Elena Reyes", org:"Cedarville County", category:"Government", type:"County Supervisor", market:"Americas", region:"United States", geography:"Local", state:"Texas", site:"Houston, TX", priority:"Medium", status:"Active", notes:"Up for re-election in November." },
  { name:"European Commission DG ENV", org:"European Commission DG ENV", category:"Government", type:"Regulator (Federal)", market:"EMEA", region:"Europe", geography:"National (all)", state:"", site:"", priority:"High", status:"Active", notes:"Sustainability disclosure rules in consultation." },
  { name:"BUND Germany", org:"BUND Germany", category:"Communities", type:"NGO", market:"EMEA", region:"Europe", geography:"National (all)", state:"", site:"", priority:"Medium", status:"Active", notes:"Coalition partner on packaging directive." },
  { name:"DigitalEurope", org:"DigitalEurope", category:"Industry", type:"Trade Association", market:"EMEA", region:"Europe", geography:"National (all)", state:"", site:"", priority:"High", status:"Active", notes:"Working group lead on AI Act compliance." },
  { name:"Brazilian E-Waste Coalition", org:"Brazilian E-Waste Coalition", category:"Communities", type:"NGO", market:"LATAM", region:"Brazil", geography:"National (all)", state:"", site:"", priority:"Medium", status:"Active", notes:"Supplies take-back program partner." }
];

const SEED_SCORES = {
  0:{ "tm-alex":[3,8],  "tm-jordan":[4,9], "tm-sam":[2,8], "tm-priya":[3,8], "tm-devon":[2,7] },
  1:{ "tm-alex":[7,4],  "tm-jordan":[8,5], "tm-sam":[7,4], "tm-priya":[6,4], "tm-devon":[6,3] },
  2:{ "tm-alex":[-2,7], "tm-jordan":[-1,8],"tm-sam":[-3,7],"tm-priya":[-2,8],"tm-devon":[-2,7] },
  3:{ "tm-alex":[1,6],  "tm-jordan":[2,7], "tm-sam":[1,6], "tm-priya":[0,6], "tm-devon":[-1,6] },
  4:{ "tm-alex":[7,9],  "tm-jordan":[8,9], "tm-sam":[6,8], "tm-priya":[7,9], "tm-devon":[7,9] },
  5:{ "tm-alex":[-8,6], "tm-jordan":[-9,7],"tm-sam":[-7,6],"tm-priya":[-8,7],"tm-devon":[-9,8] },
  6:{ "tm-alex":[-1,9], "tm-jordan":[1,9], "tm-sam":[0,9], "tm-priya":[-1,9],"tm-devon":[0,10] },
  7:{ "tm-alex":[6,2],  "tm-jordan":[7,3], "tm-sam":[8,2], "tm-priya":[6,2], "tm-devon":[6,1] },
  8:{ "tm-alex":[3,-3], "tm-jordan":[4,-2],"tm-sam":[5,-3],"tm-priya":[3,-3],"tm-devon":[3,-4] },
  9:{ "tm-alex":[6,1],  "tm-jordan":[7,2], "tm-sam":[8,1], "tm-priya":[6,1], "tm-devon":[6,0] },
  10:{ "tm-alex":[9,7], "tm-jordan":[8,6], "tm-sam":[7,5], "tm-priya":[8,6], "tm-devon":[9,7] },
  11:{ "tm-alex":[-7,5],"tm-jordan":[-6,6],"tm-sam":[-5,4],"tm-priya":[-7,5],"tm-devon":[-8,6] },
  12:{ "tm-alex":[8,0], "tm-jordan":[7,1], "tm-sam":[8,-1],"tm-priya":[8,0], "tm-devon":[7,0] },
  13:{ "tm-alex":[10,8],"tm-jordan":[9,7], "tm-sam":[9,7], "tm-priya":[10,8],"tm-devon":[10,9] },
  14:{ "tm-alex":[2,9], "tm-jordan":[3,10],"tm-sam":[4,9], "tm-priya":[2,9], "tm-devon":[1,9] },
  15:{ "tm-alex":[4,5], "tm-jordan":[5,6], "tm-sam":[3,5], "tm-priya":[4,5], "tm-devon":[4,4] },
  16:{ "tm-alex":[-2,9],"tm-jordan":[-1,10],"tm-sam":[-3,9],"tm-priya":[-2,10],"tm-devon":[-3,9] },
  17:{ "tm-alex":[-5,4],"tm-jordan":[-4,5],"tm-sam":[-4,4],"tm-priya":[-5,5],"tm-devon":[-6,4] },
  18:{ "tm-alex":[7,6], "tm-jordan":[8,7], "tm-sam":[6,6], "tm-priya":[8,7], "tm-devon":[7,6] },
  19:{ "tm-alex":[3,3], "tm-jordan":[4,4], "tm-sam":[5,3], "tm-priya":[3,3], "tm-devon":[3,2] }
};

const N_STK = STAKEHOLDERS.length;     // 20 filled
const N_ROWS = 30;                     // seed 30 rows so the table extends
const FIRST = 2;                       // first data row on Workspace/Reference-relative

// ─── helpers ────────────────────────────────────────────────────────────
const ARGB = (hex) => "FF" + hex.replace("#", "").toUpperCase();
function weightedCoord(idx) {
  const s = SEED_SCORES[idx]; if (!s) return null;
  let tw=0, sx=0, sy=0;
  for (const m of TEAM) { const sc=s[m.id]; if(!sc) continue; const w=m.weight; if(w<=0)continue; sx+=sc[0]*w; sy+=sc[1]*w; tw+=w; }
  if (tw===0) return {x:0,y:0};
  return { x: sx/tw, y: sy/tw };
}
function statusFor(x,y){
  x=Math.max(-10,Math.min(10,x)); y=Math.max(-10,Math.min(10,y));
  let row,col;
  if(y>5)row=0; else if(y>2.5)row=1; else if(y>0)row=2; else if(y>-2.5)row=3; else if(y>-5)row=4; else row=5;
  if(x<-5)col=0; else if(x<0)col=1; else if(x<5)col=2; else col=3;
  return GRID[row][col];
}
const sanitize = (s) => s.replace(/[^A-Za-z0-9]/g, "_");
const colL = (n) => ExcelJS.utils ? null : null; // unused

// ─── theme tokens (match the app) ─────────────────────────────────────────
const T = {
  white:"#FFFFFF", appbg:"#FCFBF9", lightgrey:"#F8F7F3", darkgrey:"#F0EEE6",
  lightborder:"#E8E6DE", darkborder:"#DFDDD6", mute:"#ABA9A4", ink:"#666361", strong:"#3D3B39",
  accent:"#3B6EA5"
};
const FONT = { name:"Inter", size:11, color:{argb:ARGB(T.ink)} };
function headerFill(){ return { type:"pattern", pattern:"solid", fgColor:{argb:ARGB(T.darkgrey)} }; }
function thinBorder(){ const c={style:"thin",color:{argb:ARGB(T.lightborder)}}; return {top:c,left:c,bottom:c,right:c}; }

// ═══════════════════════════════════════════════════════════════════════════
const wb = new ExcelJS.Workbook();
wb.creator = "Stakeholdr"; wb.created = new Date();

// keep sheet order: Intro · Scoring · Workspace · Map · Reference(hidden)
const wsIntro = wb.addWorksheet("Intro",   { properties:{ defaultRowHeight:16 } });
const wsScore = wb.addWorksheet("Scoring");
const wsWork  = wb.addWorksheet("Workspace");
const wsMap   = wb.addWorksheet("Map");
const wsRef   = wb.addWorksheet("Reference", { state:"hidden" });

// ─────────────────────────────────────────────────────────────────────────
// 5) REFERENCE (hidden) - build first so names exist for validations
// ─────────────────────────────────────────────────────────────────────────
const catNames = Object.keys(CATEGORIES);
// A: CategoryList
catNames.forEach((c,i)=>{ wsRef.getCell(i+1,1).value=c; });
wb.definedNames.add(`Reference!$A$1:$A$${catNames.length}`, "CategoryList");

// C..H: per-category type lists (each its own named range, sanitized)
catNames.forEach((c,ci)=>{
  const col = 3+ci; // C=3
  const list = CATEGORIES[c];
  list.forEach((t,ri)=>{ wsRef.getCell(ri+1,col).value=t; });
  const L = wsRef.getColumn(col).letter;
  wb.definedNames.add(`Reference!$${L}$1:$${L}$${list.length}`, sanitize(c));
});

// J Markets, K Regions, L Geographies, M Priorities, N Statuses
function fillNamed(col, list, name){
  list.forEach((v,i)=>{ wsRef.getCell(i+1,col).value=v; });
  const L = wsRef.getColumn(col).letter;
  wb.definedNames.add(`Reference!$${L}$1:$${L}$${list.length}`, name);
}
const marketNames = Object.keys(MARKETS);
const regionNames = [...new Set(Object.values(MARKETS).flat())];
fillNamed(10, marketNames, "Markets");      // J
fillNamed(11, regionNames, "Regions");      // K
fillNamed(12, GEOGRAPHIES, "Geographies");  // L
fillNamed(13, PRIORITIES, "Priorities");    // M
fillNamed(14, WS_STATUSES, "Statuses");     // N

// P..S rows 1..6: ZoneGrid (4 cols × 6 rows)
for(let r=0;r<6;r++) for(let c=0;c<4;c++){ wsRef.getCell(r+1, 16+c).value = GRID[r][c]; }
wb.definedNames.add("Reference!$P$1:$S$6", "ZoneGrid");

// U..V rows 1..14: RecTable (zone → "strategy - action")
STATUS_ORDER.forEach((z,i)=>{
  wsRef.getCell(i+1,21).value = z;                                  // U
  wsRef.getCell(i+1,22).value = `${STATUSES[z].strategy}: ${STATUSES[z].action}`; // V
});
wb.definedNames.add("Reference!$U$1:$V$14", "RecTable");

// ─────────────────────────────────────────────────────────────────────────
// 2) SCORING - editable weight tool
// ─────────────────────────────────────────────────────────────────────────
// columns: A=#, B=name, then per teammate x/y pairs C/D, E/F, G/H, I/J, K/L, M=WeightedX, N=WeightedY
const tmCols = TEAM.map((_,i)=>3+i*2); // C,E,G,I,K  (x col of each teammate; y = +1)
const WX = 13, WY = 14;                 // M, N

// Row 1 headers
wsScore.getCell(1,1).value = "#";
wsScore.getCell(1,2).value = "Stakeholder (from Workspace)";
TEAM.forEach((tm,i)=>{
  const c = tmCols[i];
  wsScore.getCell(1,c).value = tm.name;
  wsScore.mergeCells(1,c,1,c+1);
});
wsScore.getCell(1,WX).value = "Weighted X";
wsScore.getCell(1,WY).value = "Weighted Y";

// Row 2 - editable weights (merged per teammate over their 2 cols) + Sum w
TEAM.forEach((tm,i)=>{
  const c = tmCols[i];
  const cell = wsScore.getCell(2,c);
  cell.value = tm.weight;
  wsScore.mergeCells(2,c,2,c+1);
  cell.fill = { type:"pattern", pattern:"solid", fgColor:{argb:ARGB("#FFFFFF")} };
  cell.font = { ...FONT, bold:true, color:{argb:ARGB(T.accent)} };
  cell.alignment = { horizontal:"center" };
  const med = { style:"medium", color:{argb:ARGB(T.accent)} };
  cell.border = { top:med,left:med,bottom:med,right:med };
});
wsScore.getCell(2,2).value = "Weights →";
wsScore.getCell(2,2).font = { ...FONT, italic:true, color:{argb:ARGB(T.mute)} };
wsScore.getCell(2,WX).value = "Sum w";
wsScore.getCell(2,WX).font = { ...FONT, italic:true, color:{argb:ARGB(T.mute)} };
const sumW = tmCols.map(c=>`${wsScore.getColumn(c).letter}2`).join("+");
wsScore.getCell(2,WY).value = { formula:`=${sumW}` };

// Row 3 - x/y subheaders
TEAM.forEach((tm,i)=>{
  const c = tmCols[i];
  wsScore.getCell(3,c).value = "x";
  wsScore.getCell(3,c+1).value = "y";
});
wsScore.getCell(3,1).value = "#";
wsScore.getCell(3,2).value = "Stakeholder";

// Rows 4.. - name mirrors Workspace; scores; weighted formulas referencing weight cells
const sumWNoEq = sumW; // C2+E2+...
for(let i=0;i<N_ROWS;i++){
  const sr = 4+i;            // scoring row
  const wr = FIRST+i;        // matching workspace row
  wsScore.getCell(sr,1).value = i+1;
  wsScore.getCell(sr,2).value = { formula:`=IF(Workspace!B${wr}="","",Workspace!B${wr})` };
  // seeded scores
  if(i < N_STK){
    TEAM.forEach((tm,ti)=>{
      const c = tmCols[ti];
      const sc = SEED_SCORES[i][tm.id];
      wsScore.getCell(sr,c).value   = sc[0];
      wsScore.getCell(sr,c+1).value = sc[1];
    });
  }
  // Weighted X / Y - reference the editable weight cells (C$2 etc.), not numbers
  const wxNum = TEAM.map((tm,ti)=>{ const xc=wsScore.getColumn(tmCols[ti]).letter; const wc=wsScore.getColumn(tmCols[ti]).letter; return `${xc}${sr}*${wc}$2`; }).join("+");
  const wyNum = TEAM.map((tm,ti)=>{ const yc=wsScore.getColumn(tmCols[ti]+1).letter; const wc=wsScore.getColumn(tmCols[ti]).letter; return `${yc}${sr}*${wc}$2`; }).join("+");
  wsScore.getCell(sr,WX).value = { formula:`=IF(Workspace!B${wr}="","",(${wxNum})/(${sumWNoEq}))` };
  wsScore.getCell(sr,WY).value = { formula:`=IF(Workspace!B${wr}="","",(${wyNum})/(${sumWNoEq}))` };
}

// style Scoring
wsScore.views = [{ state:"frozen", xSplit:2, ySplit:3, topLeftCell:"C4" }];
[1,3].forEach(r=>{ wsScore.getRow(r).eachCell({includeEmpty:false},cell=>{ cell.font={...FONT,bold:true,color:{argb:ARGB(T.strong)}}; cell.fill=headerFill(); cell.alignment={horizontal:"center",vertical:"middle"}; cell.border=thinBorder(); }); });
wsScore.getColumn(2).width = 28;
TEAM.forEach((_,i)=>{ wsScore.getColumn(tmCols[i]).width=6; wsScore.getColumn(tmCols[i]+1).width=6; });
wsScore.getColumn(WX).width=12; wsScore.getColumn(WY).width=12; wsScore.getColumn(1).width=4;

// ─────────────────────────────────────────────────────────────────────────
// 3) WORKSPACE - main universal table
// ─────────────────────────────────────────────────────────────────────────
const WCOLS = ["#","Stakeholder","Organization","Category","Type","Market","Region","Geography","State","Site","Priority","x","y","Relationship","Status","Notes"];
// A..P (1..16), Q=17 xBand(hidden), R=18 yBand(hidden)
WCOLS.forEach((h,i)=>{ const cell=wsWork.getCell(1,i+1); cell.value=h; cell.font={...FONT,bold:true,color:{argb:ARGB(T.strong)}}; cell.fill=headerFill(); cell.border=thinBorder(); cell.alignment={vertical:"middle"}; });
wsWork.getCell(1,17).value="xBand"; wsWork.getCell(1,18).value="yBand";

for(let i=0;i<N_ROWS;i++){
  const r = FIRST+i;
  const sr = 4+i; // scoring row
  wsWork.getCell(r,1).value = i+1; // #
  if(i<N_STK){
    const s = STAKEHOLDERS[i];
    wsWork.getCell(r,2).value = s.name;
    wsWork.getCell(r,3).value = s.org;
    wsWork.getCell(r,4).value = s.category;
    wsWork.getCell(r,5).value = s.type;
    wsWork.getCell(r,6).value = s.market;
    wsWork.getCell(r,7).value = s.region;
    wsWork.getCell(r,8).value = s.geography;
    wsWork.getCell(r,9).value = s.state;
    wsWork.getCell(r,10).value = s.site;
    wsWork.getCell(r,11).value = s.priority;
    wsWork.getCell(r,15).value = s.status;
    wsWork.getCell(r,16).value = s.notes;
  }
  // x / y pull weighted coordinate from Scoring
  wsWork.getCell(r,12).value = { formula:`=IF(B${r}="","",Scoring!M${sr})` };
  wsWork.getCell(r,13).value = { formula:`=IF(B${r}="","",Scoring!N${sr})` };
  // hidden xBand (Q) / yBand (R)
  wsWork.getCell(r,17).value = { formula:`=IF(B${r}="","",IF(L${r}<-5,1,IF(L${r}<0,2,IF(L${r}<5,3,4))))` };
  wsWork.getCell(r,18).value = { formula:`=IF(B${r}="","",IF(M${r}>5,1,IF(M${r}>2.5,2,IF(M${r}>0,3,IF(M${r}>-2.5,4,IF(M${r}>-5,5,6))))))` };
  // Relationship via INDEX(ZoneGrid, yBand, xBand)
  wsWork.getCell(r,14).value = { formula:`=IF(B${r}="","",INDEX(ZoneGrid,R${r},Q${r}))` };
}

// validations (NO leading "=")
for(let i=0;i<N_ROWS;i++){
  const r = FIRST+i;
  wsWork.getCell(r,4).dataValidation  = { type:"list", allowBlank:true, formulae:["CategoryList"] };
  wsWork.getCell(r,5).dataValidation  = { type:"list", allowBlank:true, formulae:[`INDIRECT(SUBSTITUTE($D${r}," ","_"))`] };
  wsWork.getCell(r,6).dataValidation  = { type:"list", allowBlank:true, formulae:["Markets"] };
  wsWork.getCell(r,7).dataValidation  = { type:"list", allowBlank:true, formulae:["Regions"] };
  wsWork.getCell(r,8).dataValidation  = { type:"list", allowBlank:true, formulae:["Geographies"] };
  wsWork.getCell(r,11).dataValidation = { type:"list", allowBlank:true, formulae:["Priorities"] };
  wsWork.getCell(r,15).dataValidation = { type:"list", allowBlank:true, formulae:["Statuses"] };
}

// Relationship coloring - (a) direct on seeded rows
for(let i=0;i<N_STK;i++){
  const r = FIRST+i;
  const wc = weightedCoord(i);
  const zone = statusFor(wc.x, wc.y);
  const meta = STATUSES[zone];
  const cell = wsWork.getCell(r,14);
  cell.fill = { type:"pattern", pattern:"solid", fgColor:{argb:ARGB(meta.color)} };
  cell.font = { ...FONT, bold:true, color:{argb:ARGB(meta.text)} };
}
// (b) CF rules - one per zone over the whole Relationship column (exact match)
const relRange = `N${FIRST}:N${FIRST+N_ROWS-1}`;
const relRules = STATUS_ORDER.map((z,i)=>{
  const meta = STATUSES[z];
  return {
    type:"expression",
    formulae:[`$N${FIRST}="${z}"`],
    priority:i+1,
    style:{ fill:{ type:"pattern", pattern:"solid", bgColor:{argb:ARGB(meta.color)} }, font:{ color:{argb:ARGB(meta.text)}, bold:true } }
  };
});
wsWork.addConditionalFormatting({ ref:relRange, rules:relRules });

// style Workspace
wsWork.views = [{ state:"frozen", xSplit:3, ySplit:1, topLeftCell:"D2" }];
const wWidths = [4,26,24,14,18,12,16,14,14,16,9,7,7,20,10,40];
wWidths.forEach((w,i)=>{ wsWork.getColumn(i+1).width=w; });
wsWork.getColumn(17).hidden=true; wsWork.getColumn(18).hidden=true;
wsWork.getColumn(12).numFmt="0.0"; wsWork.getColumn(13).numFmt="0.0";

// ─────────────────────────────────────────────────────────────────────────
// 4) MAP - heat grid + scatter (injected) + labels bar + scorecard
// ─────────────────────────────────────────────────────────────────────────
wsMap.getCell(1,1).value = "STAKEHOLDR MAP";
wsMap.getCell(1,1).font = { name:"Newsreader", size:18, bold:true, color:{argb:ARGB(T.strong)} };

// (A) Heat-map zone grid.  A=vertical influence title, B=band labels, C..F=4 impact bands
const GRID_TOP = 4;          // band-header row
const GRID_R0  = 5;          // first influence row
// top axis title
wsMap.mergeCells(GRID_TOP-1, 3, GRID_TOP-1, 6);
wsMap.getCell(GRID_TOP-1,3).value = "IMPACT ON THE BUSINESS ▶";
wsMap.getCell(GRID_TOP-1,3).font = { ...FONT, bold:true, color:{argb:ARGB(T.strong)} };
wsMap.getCell(GRID_TOP-1,3).alignment = { horizontal:"center" };
// impact band headers
["x < -5","-5 to 0","0 to 5","x > 5"].forEach((t,c)=>{
  const cell = wsMap.getCell(GRID_TOP, 3+c);
  cell.value=t; cell.font={...FONT,bold:true,color:{argb:ARGB(T.mute)}}; cell.alignment={horizontal:"center"}; cell.fill=headerFill(); cell.border=thinBorder();
});
// left vertical title
wsMap.mergeCells(GRID_R0, 1, GRID_R0+5, 1);
wsMap.getCell(GRID_R0,1).value = "INFLUENCE IN THE COMMUNITY ▲";
wsMap.getCell(GRID_R0,1).alignment = { textRotation:90, horizontal:"center", vertical:"middle" };
wsMap.getCell(GRID_R0,1).font = { ...FONT, bold:true, color:{argb:ARGB(T.strong)} };
// influence band labels (top→bottom)
const yLabels = ["y > 5","2.5 to 5","0 to 2.5","-2.5 to 0","-5 to -2.5","y < -5"];
yLabels.forEach((t,r)=>{
  const cell = wsMap.getCell(GRID_R0+r, 2);
  cell.value=t; cell.font={...FONT,bold:true,color:{argb:ARGB(T.mute)}}; cell.alignment={horizontal:"center",vertical:"middle"}; cell.fill=headerFill(); cell.border=thinBorder();
});
// zone blocks with LIVE member lists
for(let r=0;r<6;r++){
  for(let c=0;c<4;c++){
    const ri=r+1, ci=c+1; // 1-based bands (R=yBand, Q=xBand)
    const zone = GRID[r][c];
    const meta = STATUSES[zone];
    const tj = `TEXTJOIN(CHAR(10),TRUE,IF((Workspace!$Q$2:$Q$31=${ci})*(Workspace!$R$2:$R$31=${ri}),Workspace!$B$2:$B$31,""))`;
    const cell = wsMap.getCell(GRID_R0+r, 3+c);
    cell.value = { formula:`="${zone}"&IF(${tj}="","",CHAR(10)&${tj})` };
    cell.fill = { type:"pattern", pattern:"solid", fgColor:{argb:ARGB(meta.color)} };
    cell.font = { ...FONT, bold:true, color:{argb:ARGB(meta.text)} };
    cell.alignment = { horizontal:"left", vertical:"top", wrapText:true };
    cell.border = thinBorder();
  }
}
// row heights PROPORTIONAL to the real coordinate bands (y splits at 5,2.5,0,-2.5,-5):
// top band (y 5..10) and bottom band (y -10..-5) span 5 units; the middle four span 2.5 each.
const bandHeights = [64, 32, 32, 32, 32, 64]; // ratio 2:1:1:1:1:2
for(let r=0;r<6;r++) wsMap.getRow(GRID_R0+r).height = bandHeights[r];
wsMap.getColumn(1).width=4; wsMap.getColumn(2).width=11;
[3,4,5,6].forEach(c=>wsMap.getColumn(c).width=22);

// (C) labels bar BELOW the map
const BAR = GRID_R0+6+1; // row 12
wsMap.getCell(BAR,3).value = "← Works against you";
wsMap.mergeCells(BAR,4,BAR,5);
wsMap.getCell(BAR,4).value = "↑ Greater community influence  ·  ↓ Less community influence";
wsMap.getCell(BAR,4).alignment = { horizontal:"center" };
wsMap.getCell(BAR,6).value = "Works with you →";
wsMap.getCell(BAR,6).alignment = { horizontal:"right" };
[3,4,6].forEach(c=>{ wsMap.getCell(BAR,c).font={...FONT,italic:true,color:{argb:ARGB(T.mute)}}; });

// (D) scorecard - right of the grid, columns H..L
const SC = 8; // H
const scHdr = ["Stakeholder","x","y","Relationship","Recommendation"];
scHdr.forEach((h,i)=>{ const cell=wsMap.getCell(GRID_TOP,SC+i); cell.value=h; cell.font={...FONT,bold:true,color:{argb:ARGB(T.strong)}}; cell.fill=headerFill(); cell.border=thinBorder(); });
for(let i=0;i<N_ROWS;i++){
  const r = GRID_TOP+1+i;   // scorecard row
  const wr = FIRST+i;       // workspace row
  wsMap.getCell(r,SC).value   = { formula:`=IF(Workspace!B${wr}="","",Workspace!B${wr})` };
  wsMap.getCell(r,SC+1).value = { formula:`=IF(Workspace!B${wr}="","",Workspace!L${wr})` };
  wsMap.getCell(r,SC+2).value = { formula:`=IF(Workspace!B${wr}="","",Workspace!M${wr})` };
  wsMap.getCell(r,SC+3).value = { formula:`=IF(Workspace!B${wr}="","",Workspace!N${wr})` };
  wsMap.getCell(r,SC+4).value = { formula:`=IF(Workspace!B${wr}="","",VLOOKUP(Workspace!N${wr},RecTable,2,FALSE))` };
  wsMap.getCell(r,SC+1).numFmt="0.0"; wsMap.getCell(r,SC+2).numFmt="0.0";
}
// scorecard Relationship coloring via CF (exact match), column K = SC+3 = 11
const scRelCol = wsMap.getColumn(SC+3).letter; // K
const scTop = GRID_TOP+1, scBot = GRID_TOP+N_ROWS;
wsMap.addConditionalFormatting({
  ref:`${scRelCol}${scTop}:${scRelCol}${scBot}`,
  rules: STATUS_ORDER.map((z,i)=>{ const meta=STATUSES[z]; return { type:"expression", formulae:[`$${scRelCol}${scTop}="${z}"`], priority:i+1, style:{ fill:{type:"pattern",pattern:"solid",bgColor:{argb:ARGB(meta.color)}}, font:{color:{argb:ARGB(meta.text)},bold:true} } }; })
});
wsMap.getColumn(SC).width=26; wsMap.getColumn(SC+1).width=6; wsMap.getColumn(SC+2).width=6;
wsMap.getColumn(SC+3).width=20; wsMap.getColumn(SC+4).width=60;

// Focus picker (Excel has no hover; pick one stakeholder to isolate its recommendation)
wsMap.mergeCells(1, SC, 1, SC+4);
wsMap.getCell(1,SC).value = "Focus a stakeholder (Excel can't hover the map, so pick one here to isolate its zone and recommendation):";
wsMap.getCell(1,SC).font = { ...FONT, italic:true, color:{argb:ARGB(T.mute)} };
wsMap.getCell(1,SC).alignment = { wrapText:true, vertical:"middle" };
const focusCell = wsMap.getCell(2,SC);
focusCell.value = STAKEHOLDERS[0].name;
wsMap.mergeCells(2,SC,2,SC+1);
focusCell.dataValidation = { type:"list", allowBlank:true, formulae:[`Workspace!$B$2:$B$${FIRST+N_ROWS-1}`] };
focusCell.font = { ...FONT, bold:true, color:{argb:ARGB(T.accent)} };
const med = { style:"medium", color:{argb:ARGB(T.accent)} };
focusCell.border = { top:med,left:med,bottom:med,right:med };
const mRow = `MATCH($${wsMap.getColumn(SC).letter}$2,Workspace!$B$2:$B$${FIRST+N_ROWS-1},0)`;
const xV = `INDEX(Workspace!$L$2:$L$${FIRST+N_ROWS-1},${mRow})`;
const yV = `INDEX(Workspace!$M$2:$M$${FIRST+N_ROWS-1},${mRow})`;
const relV = `INDEX(Workspace!$N$2:$N$${FIRST+N_ROWS-1},${mRow})`;
wsMap.mergeCells(2,SC+2,2,SC+3);
wsMap.getCell(2,SC+2).value = { formula:`=IFERROR("x "&TEXT(${xV},"0.0")&"     y "&TEXT(${yV},"0.0"),"")` };
wsMap.getCell(2,SC+2).font = { ...FONT, color:{argb:ARGB(T.ink)} };
const focusRelCell = wsMap.getCell(2,SC+4);
focusRelCell.value = { formula:`=IFERROR(${relV},"")` };
focusRelCell.font = { ...FONT, bold:true };
focusRelCell.alignment = { horizontal:"center" };
// color the focus relationship cell by zone (relationship thing -> zone colors)
const frL = wsMap.getColumn(SC+4).letter;
wsMap.addConditionalFormatting({
  ref:`${frL}2`,
  rules: STATUS_ORDER.map((z,i)=>{ const meta=STATUSES[z]; return { type:"expression", formulae:[`$${frL}$2="${z}"`], priority:i+1, style:{ fill:{type:"pattern",pattern:"solid",bgColor:{argb:ARGB(meta.color)}}, font:{color:{argb:ARGB(meta.text)},bold:true} } }; })
});
wsMap.mergeCells(3,SC,3,SC+4);
wsMap.getCell(3,SC).value = { formula:`=IFERROR("Recommendation:  "&VLOOKUP(${relV},RecTable,2,FALSE),"")` };
wsMap.getCell(3,SC).font = { ...FONT, color:{argb:ARGB(T.ink)} };
wsMap.getCell(3,SC).alignment = { wrapText:true, vertical:"top" };
wsMap.getRow(1).height = 30; wsMap.getRow(3).height = 44;

// ─────────────────────────────────────────────────────────────────────────
// INTRO - all eight Help blocks (a-h)
// ─────────────────────────────────────────────────────────────────────────
// Styled to echo the app's Help page: restrained, generous whitespace, the
// app's own type roles (Newsreader titles / Inter body). Tone accents
// (neg/neu/pos) and the amber funnel are the Help page's own colors; ZONE
// colors appear ONLY on relationship things (spectrum, zones grid, strategy
// reference). No invented palettes, no em dashes.
const TONE = { negative:"#B33C3C", "neutral-low":"#B07E1F", positive:"#3E7A2E" };
const toneLabel = { negative:"Negative", "neutral-low":"Winnable", positive:"Positive" };
let R = 1;
// layout: A = gutter, B..H = seven content columns
wsIntro.getColumn(1).width = 3;
for(let c=2;c<=8;c++) wsIntro.getColumn(c).width = 21;
wsIntro.views = [{ showGridLines:false }];
const sectionTitle = (t)=>{ const cell=wsIntro.getCell(R,2); cell.value=t; cell.font={name:"Newsreader",size:16,color:{argb:ARGB(T.strong)}}; wsIntro.mergeCells(R,2,R,8); R+=2; };
const bodyP = (t,h=null)=>{ const cell=wsIntro.getCell(R,2); cell.value=t; cell.font={...FONT,color:{argb:ARGB(T.ink)}}; cell.alignment={wrapText:true,vertical:"top"}; wsIntro.mergeCells(R,2,R,8); if(h)wsIntro.getRow(R).height=h; R+=1; };

// Title
const tCell = wsIntro.getCell(R,2); tCell.value="STAKEHOLDR";
tCell.font={name:"Newsreader",size:28,bold:true,color:{argb:ARGB(T.strong)}};
wsIntro.mergeCells(R,2,R,8); wsIntro.getRow(R).height=38; R+=2;

// Prelude quote
const q = wsIntro.getCell(R,2);
q.value = "Stakeholders exist in a public square where ideas are exchanged, your credibility is won or lost, and value is created, shared, or squandered.";
q.font = { name:"Newsreader", size:14, italic:true, color:{argb:ARGB(T.ink)} };
wsIntro.mergeCells(R,2,R,8); q.alignment={wrapText:true,vertical:"middle"}; wsIntro.getRow(R).height=40; R+=2;

// How to plan for and engage stakeholders -> the Purpose/Plan/Execute funnel
sectionTitle("How to plan for and engage stakeholders");
const funnel = [
  { phase:"Purpose", color:"#E2A85F", items:["1. Set goals for your organization","2. Issue identification","3. Stakeholder identification","4. Stakeholder prioritization"] },
  { phase:"Plan",    color:"#F0C988", items:["5. Landscape analysis","6. Cross-functional teams alignment","7. Research and listening sessions","8. Early stakeholder analysis and modeling"] },
  { phase:"Execute", color:"#F8E2B0", items:["9. Launch campaign","10. Ongoing stakeholder analysis","11. Collaborate with stakeholders","12. Realize shared value where possible"] }
];
funnel.forEach((f,fi)=>{
  const col = 2 + fi*2;
  const hc = wsIntro.getCell(R, col);
  hc.value=f.phase.toUpperCase();
  hc.font={ name:"Inter", size:11, bold:true, color:{argb:ARGB("#7a4a14")} };
  hc.fill={ type:"pattern", pattern:"solid", fgColor:{argb:ARGB(f.color)} };
  hc.alignment={horizontal:"center",vertical:"middle"};
  wsIntro.mergeCells(R,col,R,col+1); wsIntro.getRow(R).height=22;
  f.items.forEach((it,ii)=>{ const cell=wsIntro.getCell(R+1+ii,col); cell.value=it; cell.font={...FONT,color:{argb:ARGB(T.ink)}}; wsIntro.mergeCells(R+1+ii,col,R+1+ii,col+1); cell.alignment={wrapText:true,vertical:"top"}; });
});
R += 1 + 4 + 1;

// How to read the stakeholder map + the two axes
sectionTitle("How to read the stakeholder map");
const ax1 = wsIntro.getCell(R,2); ax1.value="X  Impact on the business:    Negative impact ◀ ▶ Positive impact";
ax1.font={...FONT,bold:true,color:{argb:ARGB(T.strong)}}; wsIntro.mergeCells(R,2,R,8); R+=1;
const ax2 = wsIntro.getCell(R,2); ax2.value="Y  Influence in the community:    Less influence ▼ ▲ Greater influence";
ax2.font={...FONT,bold:true,color:{argb:ARGB(T.strong)}}; wsIntro.mergeCells(R,2,R,8); R+=2;

// Spectrum strip (most negative -> most positive). Relationship thing -> zone colors.
const spec1 = R;
STATUS_ORDER.forEach((z,i)=>{
  const meta=STATUSES[z];
  const row = spec1 + Math.floor(i/7);
  const col = 2 + (i%7);
  const cell = wsIntro.getCell(row,col);
  cell.value=z; cell.fill={type:"pattern",pattern:"solid",fgColor:{argb:ARGB(meta.color)}};
  cell.font={ name:"Inter", size:9, bold:true, color:{argb:ARGB(meta.text)} };
  cell.alignment={horizontal:"center",vertical:"middle",wrapText:true};
});
wsIntro.getRow(spec1).height=26; wsIntro.getRow(spec1+1).height=26;
R = spec1 + 2 + 1;

// Three impact cards (Help page styling: paper card, tone title + tone tick, no zone fills)
const cards = [
  { title:"Negative impact on organization", tone:"negative", align:"left",   bullets:["Defend license to operate","Challenge misinformation","Plan for their influence in community","Identify their reputation with audiences","“Influencer”"] },
  { title:"The winnable middle",             tone:"neutral-low", align:"center", bullets:["Dispel myths and misperceptions","Appeal to their priorities","Identify shared value to move them our way","Invest in relationship where possible","Identify our reputation with them"] },
  { title:"Positive impact on organization", tone:"positive", align:"right",  bullets:["Maximize shared value","Maintain relationship","Champion their cause","Recruit as public surrogates","Communicate often","“Influencer”"] }
];
const cardHdr = R;
const cardRows = Math.max(...cards.map(c=>c.bullets.length));
cards.forEach((cd,ci)=>{
  const col = 2 + ci*2;
  const toneC = TONE[cd.tone];
  const hc = wsIntro.getCell(cardHdr,col);
  hc.value=cd.title.toUpperCase();
  hc.font={ name:"Inter", size:10, bold:true, color:{argb:ARGB(toneC)} };
  hc.fill={type:"pattern",pattern:"solid",fgColor:{argb:ARGB(T.paper||"#F8F7F3")}};
  hc.alignment={wrapText:true,horizontal:cd.align,vertical:"middle"};
  wsIntro.mergeCells(cardHdr,col,cardHdr,col+1); wsIntro.getRow(cardHdr).height=26;
  for(let bi=0; bi<cardRows; bi++){
    const cell=wsIntro.getCell(cardHdr+1+bi,col);
    cell.value = cd.bullets[bi]!=null ? cd.bullets[bi] : "";
    cell.font={...FONT,color:{argb:ARGB(T.ink)}};
    cell.fill={type:"pattern",pattern:"solid",fgColor:{argb:ARGB("#F8F7F3")}};
    cell.alignment={wrapText:true,horizontal:cd.align,vertical:"top"};
    // tone tick on the leading edge of each card column
    cell.border = { left:{ style:"medium", color:{argb:ARGB(toneC)} } };
  }
  // tone tick on header too
  hc.border = { left:{ style:"medium", color:{argb:ARGB(toneC)} }, top:{style:"thin",color:{argb:ARGB(toneC)}} };
});
R = cardHdr + 1 + cardRows + 1;

// The 14 zones at a glance (the GRID figure) -> zone colors
sectionTitle("The 14 zones at a glance");
bodyP("Stakeholders are plotted on a two-axis grid: x measures impact on the business (do they work with you or against you?), y measures their influence in the community. The combination determines the relationship strategy.", 30);
const gfTop = R;
for(let r=0;r<6;r++){
  for(let c=0;c<4;c++){
    const meta=STATUSES[GRID[r][c]];
    const cell=wsIntro.getCell(gfTop+r, 2+c);
    cell.value=GRID[r][c];
    cell.fill={type:"pattern",pattern:"solid",fgColor:{argb:ARGB(meta.color)}};
    cell.font={ name:"Inter", size:10, bold:true, color:{argb:ARGB(meta.text)} };
    cell.alignment={horizontal:"center",vertical:"middle",wrapText:true};
  }
  wsIntro.getRow(gfTop+r).height=26;
}
// axis legend strip under the figure
const legRow = gfTop+6;
const lL = wsIntro.getCell(legRow,2); lL.value="← Works against you"; lL.font={...FONT,italic:true,color:{argb:ARGB(T.mute)}};
wsIntro.mergeCells(legRow,3,legRow,4);
const lC = wsIntro.getCell(legRow,3); lC.value="↑ Greater community influence   ·   ↓ Less community influence"; lC.font={...FONT,italic:true,color:{argb:ARGB(T.mute)}}; lC.alignment={horizontal:"center"};
const lR = wsIntro.getCell(legRow,5); lR.value="Works with you →"; lR.font={...FONT,italic:true,color:{argb:ARGB(T.mute)}}; lR.alignment={horizontal:"right"};
R = legRow + 2;

// Strategy reference -> 14 rows. Zone color appears ONLY on the zone swatch cell.
sectionTitle("Strategy reference");
bodyP("For every zone, a stakeholder's position on the map returns a recommended posture and suggested immediate actions your team can take.", 28);
const zHdr = R;
const zHeads = [["Zone",2,2],["Tone",3,3],["Strategy and recommended action",4,8]];
zHeads.forEach(([h,a,b])=>{ const cell=wsIntro.getCell(zHdr,a); cell.value=h; cell.font={...FONT,bold:true,color:{argb:ARGB(T.strong)}}; cell.fill=headerFill(); cell.border=thinBorder(); wsIntro.mergeCells(zHdr,a,zHdr,b); });
STATUS_ORDER.forEach((z,i)=>{
  const r = zHdr+1+i; const meta=STATUSES[z];
  const zc = wsIntro.getCell(r,2); zc.value=z; zc.fill={type:"pattern",pattern:"solid",fgColor:{argb:ARGB(meta.color)}}; zc.font={...FONT,bold:true,color:{argb:ARGB(meta.text)}}; zc.alignment={vertical:"middle",wrapText:true}; zc.border=thinBorder();
  const tc = wsIntro.getCell(r,3); tc.value=toneLabel[meta.tone]; tc.font={...FONT,color:{argb:ARGB(TONE[meta.tone])},bold:true}; tc.alignment={vertical:"middle"}; tc.border=thinBorder();
  const ac = wsIntro.getCell(r,4); ac.value=`${meta.strategy}. ${meta.action}`; ac.font={...FONT,color:{argb:ARGB(T.ink)}}; ac.alignment={wrapText:true,vertical:"top"}; wsIntro.mergeCells(r,4,r,8); ac.border=thinBorder();
  wsIntro.getRow(r).height=34;
});
R = zHdr + 1 + STATUS_ORDER.length + 2;

// Categories and audience types (restrained grey headers, no invented colors)
sectionTitle("Categories and audience types");
const catHeaderRow = R;
catNames.forEach((c,ci)=>{
  const cell = wsIntro.getCell(catHeaderRow, 2+ci);
  cell.value = c;
  cell.fill = headerFill();
  cell.font = { ...FONT, bold:true, color:{argb:ARGB(T.strong)} };
  cell.alignment = { horizontal:"center" };
  cell.border = thinBorder();
});
const maxTypes = Math.max(...catNames.map(c=>CATEGORIES[c].length));
for(let t=0;t<maxTypes;t++){
  catNames.forEach((c,ci)=>{
    const v = CATEGORIES[c][t];
    if(v!=null){ const cell=wsIntro.getCell(catHeaderRow+1+t, 2+ci); cell.value=v; cell.font={...FONT,color:{argb:ARGB(T.ink)}}; cell.border={ bottom:{style:"thin",color:{argb:ARGB(T.lightborder)}} }; }
  });
}
R = catHeaderRow + 1 + maxTypes + 2;

// How scores become coordinates
sectionTitle("How scores become coordinates");
bodyP("On the Scoring tab, every teammate rates each stakeholder on x and y from minus 10 to 10. Each teammate also has a weight. The final coordinate is the weighted average of their scores. A teammate with weight 1.5 counts 1.5 times more than one with weight 1.0.", 44);
R+=1;
const formula = wsIntro.getCell(R,2);
formula.value = "final.x = sum(member.x × member.weight) / sum(member.weight)      final.y = sum(member.y × member.weight) / sum(member.weight)      zone = lookup(final.x, final.y)";
formula.font={ name:"Inter", size:11, color:{argb:ARGB(T.ink)} };
wsIntro.mergeCells(R,2,R,8); formula.alignment={wrapText:true,vertical:"middle"};
formula.fill={type:"pattern",pattern:"solid",fgColor:{argb:ARGB(T.lightgrey)}}; wsIntro.getRow(R).height=30;

// ═══════════════════════════════════════════════════════════════════════════
// WRITE + INJECT SCATTER CHART via fflate
// ═══════════════════════════════════════════════════════════════════════════
const buf = await wb.xlsx.writeBuffer();
const files = unzipSync(new Uint8Array(buf));

// per-point colors (seeded zones)
const dpts = [];
for(let i=0;i<N_STK;i++){ const wc=weightedCoord(i); const meta=STATUSES[statusFor(wc.x,wc.y)]; dpts.push(meta.color.replace("#","")); }
const dPtXml = dpts.map((hex,i)=>`<c:dPt><c:idx val="${i}"/><c:invertIfNegative val="0"/><c:bubble3D val="0"/><c:marker><c:symbol val="circle"/><c:size val="7"/><c:spPr><a:solidFill><a:srgbClr val="${hex}"/></a:solidFill><a:ln><a:solidFill><a:srgbClr val="3D3B39"/></a:solidFill></a:ln></c:spPr></c:marker></c:dPt>`).join("");

const NR = N_STK + 1; // workspace rows 2..21
const chartXml =
`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<c:chartSpace xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:c15="http://schemas.microsoft.com/office/drawing/2012/chart">
<c:chart><c:title><c:tx><c:rich><a:bodyPr/><a:p><a:r><a:t>Stakeholder Map</a:t></a:r></a:p></c:rich></c:tx><c:overlay val="0"/></c:title><c:autoTitleDeleted val="0"/>
<c:plotArea><c:layout/>
<c:scatterChart><c:scatterStyle val="marker"/><c:varyColors val="0"/>
<c:ser><c:idx val="0"/><c:order val="0"/>
<c:tx><c:strRef><c:f>Map!$A$1</c:f><c:strCache><c:ptCount val="1"/><c:pt idx="0"><c:v>Stakeholders</c:v></c:pt></c:strCache></c:strRef></c:tx>
<c:spPr><a:ln w="19050"><a:noFill/></a:ln></c:spPr>
<c:marker><c:symbol val="circle"/><c:size val="7"/></c:marker>
${dPtXml}
<c:dLbls><c:spPr><a:noFill/><a:ln><a:noFill/></a:ln></c:spPr><c:showLegendKey val="0"/><c:showVal val="0"/><c:showCatName val="0"/><c:showSerName val="0"/><c:showPercent val="0"/><c:showBubbleSize val="0"/>
<c:extLst><c:ext uri="{CE6537A1-D6FC-4f65-9D91-7224C49458BB}" xmlns:c15="http://schemas.microsoft.com/office/drawing/2012/chart"><c15:showDataLabelsRange val="1"/></c:ext>
<c:ext uri="{02D57815-91ED-43cb-92C2-25804820EDAC}" xmlns:c15="http://schemas.microsoft.com/office/drawing/2012/chart"><c15:datalabelsRange><c15:f>Workspace!$B$2:$B$${NR}</c15:f></c15:datalabelsRange></c:ext></c:extLst></c:dLbls>
<c:xVal><c:numRef><c:f>Workspace!$L$2:$L$${NR}</c:f></c:numRef></c:xVal>
<c:yVal><c:numRef><c:f>Workspace!$M$2:$M$${NR}</c:f></c:numRef></c:yVal>
<c:smooth val="0"/></c:ser>
<c:axId val="111111111"/><c:axId val="222222222"/></c:scatterChart>
<c:valAx><c:axId val="111111111"/><c:scaling><c:orientation val="minMax"/><c:max val="10"/><c:min val="-10"/></c:scaling><c:delete val="0"/><c:axPos val="b"/><c:majorGridlines/><c:title><c:tx><c:rich><a:bodyPr/><a:p><a:r><a:t>Impact on the business →</a:t></a:r></a:p></c:rich></c:tx><c:overlay val="0"/></c:title><c:numFmt formatCode="General" sourceLinked="1"/><c:majorTickMark val="out"/><c:minorTickMark val="none"/><c:tickLblPos val="nextTo"/><c:crossAx val="222222222"/><c:crosses val="autoZero"/><c:crossBetween val="midCat"/><c:majorUnit val="1"/></c:valAx>
<c:valAx><c:axId val="222222222"/><c:scaling><c:orientation val="minMax"/><c:max val="10"/><c:min val="-10"/></c:scaling><c:delete val="0"/><c:axPos val="l"/><c:majorGridlines/><c:title><c:tx><c:rich><a:bodyPr rot="-5400000" vert="horz"/><a:p><a:r><a:t>Influence in the community →</a:t></a:r></a:p></c:rich></c:tx><c:overlay val="0"/></c:title><c:numFmt formatCode="General" sourceLinked="1"/><c:majorTickMark val="out"/><c:minorTickMark val="none"/><c:tickLblPos val="nextTo"/><c:crossAx val="111111111"/><c:crosses val="autoZero"/><c:crossBetween val="midCat"/><c:majorUnit val="2.5"/></c:valAx>
</c:plotArea><c:plotVisOnly val="1"/><c:dispBlanksAs val="gap"/></c:chart></c:chartSpace>`;

const drawingXml =
`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart">
<xdr:twoCellAnchor><xdr:from><xdr:col>1</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>13</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from><xdr:to><xdr:col>6</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>40</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:to>
<xdr:graphicFrame macro=""><xdr:nvGraphicFramePr><xdr:cNvPr id="2" name="Stakeholder Map Chart"/><xdr:cNvGraphicFramePr/></xdr:nvGraphicFramePr><xdr:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/></xdr:xfrm>
<a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/chart"><c:chart xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:id="rId1"/></a:graphicData></a:graphic></xdr:graphicFrame><xdr:clientData/></xdr:twoCellAnchor></xdr:wsDr>`;

const drawingRels =
`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart" Target="../charts/chart1.xml"/></Relationships>`;

// Map is the 4th worksheet → sheet4.xml
const SHEET = "xl/worksheets/sheet4.xml";
files["xl/charts/chart1.xml"] = strToU8(chartXml);
files["xl/drawings/drawing1.xml"] = strToU8(drawingXml);
files["xl/drawings/_rels/drawing1.xml.rels"] = strToU8(drawingRels);

// worksheet rels for Map → drawing
const sheetRelsPath = "xl/worksheets/_rels/sheet4.xml.rels";
let sheetRels = files[sheetRelsPath] ? strFromU8(files[sheetRelsPath]) : `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>`;
sheetRels = sheetRels.replace("</Relationships>", `<Relationship Id="rIdDraw1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/></Relationships>`);
files[sheetRelsPath] = strToU8(sheetRels);

// add <drawing> ref into Map sheet xml (before </worksheet>)
let sheetXml = strFromU8(files[SHEET]);
if(!sheetXml.includes("<drawing ")){
  sheetXml = sheetXml.replace("</worksheet>", `<drawing r:id="rIdDraw1"/></worksheet>`);
}
files[SHEET] = strToU8(sheetXml);

// content types - register chart + drawing parts
let ct = strFromU8(files["[Content_Types].xml"]);
ct = ct.replace("</Types>",
  `<Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>`
  + `<Override PartName="/xl/charts/chart1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/></Types>`);
files["[Content_Types].xml"] = strToU8(ct);

const outBuf = zipSync(files, { level:0 });
writeFileSync("Stakeholdr_Map.xlsx", outBuf);

// ─── ACCEPTANCE CHECKS (XML-level) ─────────────────────────────────────────
const verify = unzipSync(outBuf);
let badFormula1 = 0, valCount = 0;
for(const [name,data] of Object.entries(verify)){
  if(name.startsWith("xl/worksheets/sheet")){
    const xml = strFromU8(data);
    badFormula1 += (xml.match(/<formula1>=/g)||[]).length;
    valCount += (xml.match(/<dataValidation /g)||[]).length;
  }
}
const hasChart = !!verify["xl/charts/chart1.xml"];
const hasDrawing = !!verify["xl/drawings/drawing1.xml"];
const mapHasDrawingRef = strFromU8(verify[SHEET]).includes("<drawing ");
console.log("── Acceptance checks ──");
console.log("  <formula1>= count :", badFormula1, badFormula1===0 ? "✓" : "✗ FAIL");
console.log("  dataValidation count :", valCount, "(expected", N_ROWS*7, ")");
console.log("  chart part exists :", hasChart ? "✓" : "✗");
console.log("  drawing part exists :", hasDrawing ? "✓" : "✗");
console.log("  Map sheet drawing ref :", mapHasDrawingRef ? "✓" : "✗");
console.log("  output bytes :", outBuf.length);
