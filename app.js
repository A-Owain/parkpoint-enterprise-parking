
const PP = (() => {
  const STORAGE = "parkpoint-enterprise-v2";
  const defaultState = {
    role: "admin",
    route: "overview",
    balance: 6288.5,
    receptionTopupEnabled: false,
    receptionTopupLimit: 1500,
    employeeDailyLimit: 1,
    employeeMaxHours: 10,
    language: "en",
    validationsToday: 47,
    audit: [
      {time:"Today 16:58", actor:"Company Admin", text:"Parking policy reviewed"},
      {time:"Today 09:11", actor:"Reception", text:"Visitor ticket PP-90511 validated"},
      {time:"Yesterday 17:35", actor:"System", text:"Monthly usage forecast updated"}
    ],
    ledger: [
      {date:"27 Aug 17:14", type:"Validation", actor:"Abdulrahman M.", ref:"PP-90821", points:-12.5, channel:"Self-service"},
      {date:"27 Aug 16:48", type:"Validation", actor:"Mohammed N.", ref:"PP-90792", points:-12.5, channel:"Self-service"},
      {date:"27 Aug 16:22", type:"Validation", actor:"Sarah A.", ref:"PP-90744", points:-12.5, channel:"Reception"},
      {date:"26 Aug 11:10", type:"Top-up", actor:"Company Admin", ref:"TOP-1038", points:2500, channel:"Admin"}
    ]
  };

  const employees = [
    ["Abdulrahman M.","Internal Communications","ABC 1234",19,237.5,8.2,"Self-service","27 Aug 17:14"],
    ["Mohammed N.","Customer Care","XYZ 9081",21,262.5,8.7,"Self-service","27 Aug 16:48"],
    ["Sarah A.","Compliance","RDA 7712",18,225,7.9,"Mixed","27 Aug 16:22"],
    ["Nawaf A.","Operations","KSA 3821",22,275,9.1,"Self-service","27 Aug 17:03"],
    ["Nora J.","Finance","JED 2920",14,175,7.4,"Self-service","27 Aug 15:51"],
    ["Reham G.","Governance","HJK 4490",17,212.5,8.0,"Self-service","27 Aug 16:35"],
    ["Munira B.","Reception","RQA 1119",20,250,8.5,"Self-service","27 Aug 17:08"],
    ["Ammar N.","IT","TEC 7731",16,200,7.6,"Self-service","27 Aug 16:57"],
    ["Khalid A.","Management","MGT 1001",11,137.5,6.8,"Self-service","26 Aug 18:05"],
    ["Sultan H.","Sales","SLZ 9023",23,287.5,8.9,"Self-service","27 Aug 17:25"],
    ["Mahmoud K.","Growth","GRW 8120",15,187.5,7.2,"Mixed","27 Aug 16:14"],
    ["Norah G.","HR","HRR 5521",13,162.5,7.7,"Self-service","27 Aug 15:48"]
  ];

  const trend = [36,42,44,39,47,51,49,54,46,58,61,57,63,59];
  const departments = [
    ["Sales",148,18.1],["Operations",132,16.2],["Customer Care",119,14.6],
    ["Finance",104,12.8],["IT",98,12.0],["Other",214,26.3]
  ];
  const hourly = [10,18,36,60,82,76,58,39];
  const roles = {
    employee:{label:"Employee",initial:"E"},
    reception:{label:"Reception",initial:"R"},
    admin:{label:"Company Admin",initial:"A"},
    parkpoint:{label:"ParkPoint Operator",initial:"P"}
  };

  const navByRole = {
    employee:[
      ["employeeHome","⌂","My Parking"],["validate","◎","Validate"],["myUsage","◔","My usage"],["mobile","▯","Mobile UX"]
    ],
    reception:[
      ["overview","⌂","Overview"],["validate","◎","Validate"],["exceptions","⌁","Exceptions","2"],["transactions","≡","Transactions"],["mobile","▯","Mobile UX"]
    ],
    admin:[
      ["overview","⌂","Overview"],["analytics","◫","Analytics"],["employees","♙","Employees"],["permissions","◇","Permissions"],["transactions","≡","Transactions"],["mobile","▯","Mobile UX"]
    ],
    parkpoint:[
      ["parkpoint","▦","Portfolio"],["analytics","◫","Tenant analytics"],["permissions","◇","Permission model"],["flows","↳","Product flows"]
    ]
  };

  function load(){
    try{
      const s = JSON.parse(localStorage.getItem(STORAGE));
      return {...defaultState,...s};
    }catch(e){ return {...defaultState}; }
  }
  let state = load();

  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const money = n => Number(n).toLocaleString(undefined,{minimumFractionDigits:3,maximumFractionDigits:3});
  const pts = n => `${money(n)} pts`;

  function save(){ localStorage.setItem(STORAGE,JSON.stringify(state)); }
  function toast(msg){
    const el=$("#toast"); el.textContent=msg; el.classList.add("show");
    clearTimeout(toast.t); toast.t=setTimeout(()=>el.classList.remove("show"),2200);
  }
  function escapeHTML(v){ return String(v).replace(/[&<>"']/g,s=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[s])); }

  function routeMeta(route){
    const map={
      overview:["Overview","Parking operations at Laysen Valley"],
      analytics:["Employee usage analytics","Detailed adoption, usage and efficiency insights"],
      employees:["Employees","Access, vehicles and parking usage"],
      permissions:["Permissions & policy","Control what each company role can do"],
      transactions:["Wallet transactions","Validation and top-up audit ledger"],
      validate:["Validate parking","Ticket, QR or vehicle validation"],
      exceptions:["Exceptions","Cases requiring receptionist intervention"],
      employeeHome:["My Parking","Employee self-service experience"],
      myUsage:["My parking usage","Personal parking history and benefit usage"],
      mobile:["Mobile application","Employee-first mobile parking experience"],
      parkpoint:["ParkPoint portfolio","Multi-tenant operator experience"],
      flows:["Product flows","End-to-end enterprise parking journeys"]
    };
    return map[route]||map.overview;
  }

  function setRole(role, close=true){
    state.role=role;
    const routes=navByRole[role].map(i=>i[0]);
    if(!routes.includes(state.route)) state.route=routes[0];
    save();
    if(close) $("#roleGate").classList.add("hidden");
    renderShell();
    render();
  }

  function renderShell(){
    const role=roles[state.role];
    $("#profileRole").textContent=role.label;
    $("#profileInitial").textContent=role.initial;

    $("#nav").innerHTML=`<div class="nav__label">${state.role==="parkpoint"?"Operator":"Workspace"}</div>`+
      navByRole[state.role].map(([route,icon,label,badge])=>`
        <button class="nav__item ${state.route===route?"active":""}" data-route="${route}">
          <span class="nav-icon">${icon}</span><span>${label}</span>${badge?`<span class="nav-badge">${badge}</span>`:""}
        </button>`).join("");

    $("#mobileNav").innerHTML=navByRole[state.role].slice(0,4).map(([route,icon,label])=>`
      <button class="${state.route===route?"active":""}" data-route="${route}"><b>${icon}</b><span>${label}</span></button>
    `).join("");

    $$("[data-route]").forEach(b=>b.onclick=()=>go(b.dataset.route));
    const [title,sub]=routeMeta(state.route);
    $("#pageTitle").textContent=title; $("#pageSub").textContent=sub;
    $("#quickValidateBtn").style.display = state.role==="parkpoint" ? "none" : "";
  }

  function go(route){
    state.route=route; save();
    try { history.replaceState(null,"",`#${state.role}/${route}`); } catch(e) {}
    renderShell(); render(); window.scrollTo({top:0,behavior:"smooth"});
  }

  function kpi(label,value,foot,trend=""){
    return `<div class="card kpi"><div class="kpi__label"><span>${label}</span>${trend?`<span class="kpi__trend">${trend}</span>`:""}</div><div class="kpi__value">${value}</div><div class="kpi__foot">${foot}</div></div>`;
  }

  function hero(){
    return `<section class="hero">
      <div class="hero__content">
        <span class="eyebrow">Alraedah Finance · Corporate Parking</span>
        <h2>Parking benefits without a shared account.</h2>
        <p>Individual employee identity, one controlled corporate wallet, policy-based validation and full visibility for reception, company admins and ParkPoint.</p>
      </div>
      <div class="hero__wallet">
        <small>Available corporate wallet</small>
        <strong>${pts(state.balance)}</strong>
        <span>Updated locally in this prototype</span>
        <div class="wallet-line"><i></i></div>
      </div>
    </section>`;
  }

  function overview(){
    const receptionPermission=state.receptionTopupEnabled
      ? `<span class="badge badge--green">Enabled · max ${money(state.receptionTopupLimit)}</span>`
      : `<span class="badge badge--red">Disabled</span>`;
    return `${hero()}
      <div class="grid grid--4">
        ${kpi("Validations today",state.validationsToday,"42 self-service · 5 assisted","+8.3%")}
        ${kpi("Employee adoption","92%","118 of 128 employees","+6 pts")}
        ${kpi("Self-service rate","89.4%","Reception no longer handles normal use","+31%")}
        ${kpi("Time saved","9.6 hrs","Estimated reception handling saved","This month")}
      </div>

      <section class="section">
        <div class="grid grid--2">
          <div class="card">
            <div class="card__head"><div><h3>Validation activity</h3><p>Last 14 operating days</p></div><span class="badge badge--green">Healthy</span></div>
            ${lineChart(trend)}
          </div>
          <div class="card">
            <div class="card__head"><div><h3>Current control model</h3><p>What the tenant can delegate</p></div></div>
            <div class="list">
              <div class="row"><span>Employee self-validation</span><span class="badge badge--green">Enabled</span></div>
              <div class="row"><span>Reception exception validation</span><span class="badge badge--green">Enabled</span></div>
              <div class="row"><span>Reception wallet top-up</span>${receptionPermission}</div>
              <div class="row"><span>Company admin wallet top-up</span><span class="badge badge--green">Enabled</span></div>
              <div class="row"><span>Employee top-up</span><span class="badge badge--red">Blocked</span></div>
            </div>
            ${state.role==="reception"?receptionTopupPanel(true):""}
          </div>
        </div>
      </section>

      <section class="section">
        <div class="section__head"><div><h2>Employee usage snapshot</h2><p>Who is using the benefit and how</p></div><button class="button" data-go="analytics">View analytics →</button></div>
        <div class="card">${employeeTable(employees.slice(0,6),false)}</div>
      </section>`;
  }

  function lineChart(data){
    const w=680,h=175,pad=14,max=Math.max(...data)+5,min=Math.min(...data)-5;
    const ptsArr=data.map((v,i)=>{
      const x=pad+i*((w-pad*2)/(data.length-1));
      const y=h-pad-((v-min)/(max-min))*(h-pad*2);
      return [x,y];
    });
    const poly=ptsArr.map(p=>p.join(",")).join(" ");
    const area=`${pad},${h-pad} ${poly} ${w-pad},${h-pad}`;
    return `<div class="chart"><svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
      <defs><linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#aa6656" stop-opacity=".20"/><stop offset="1" stop-color="#aa6656" stop-opacity="0"/></linearGradient></defs>
      <g class="chart__grid">${[.2,.4,.6,.8].map(v=>`<line x1="0" y1="${h*v}" x2="${w}" y2="${h*v}"/>`).join("")}</g>
      <polygon class="chart__area" points="${area}"/>
      <polyline class="chart__line" points="${poly}"/>
      ${ptsArr.filter((_,i)=>i===ptsArr.length-1).map(p=>`<circle class="chart__point" cx="${p[0]}" cy="${p[1]}" r="4"/>`).join("")}
    </svg></div>
    <div class="chart__labels">${["14d","12d","10d","8d","6d","4d","Today"].map(x=>`<span>${x}</span>`).join("")}</div>`;
  }

  function analytics(){
    return `<div class="grid grid--4">
      ${kpi("Monthly validations","1,086","Across 118 enrolled employees","+12.4%")}
      ${kpi("Points consumed","13,575","Avg 12.5 pts / validation","+9.1%")}
      ${kpi("Avg. parking duration","8h 06m","Median 7h 52m","Stable")}
      ${kpi("Reception assisted","10.6%","115 validations this month","↓ 31%")}
    </div>

    <section class="section">
      <div class="grid grid--2">
        <div class="card">
          <div class="card__head"><div><h3>Usage trend</h3><p>Validated sessions · last 14 operating days</p></div><div class="toolbar"><select class="select"><option>Last 30 days</option><option>Last 7 days</option></select></div></div>
          ${lineChart(trend)}
        </div>
        <div class="card">
          <div class="card__head"><div><h3>Self-service adoption</h3><p>Employee vs assisted validation</p></div></div>
          <div class="grid grid--2" style="align-items:center">
            <div class="donut-wrap"><div class="donut"></div><div class="donut__center"><strong>89.4%</strong><span>self-service</span></div></div>
            <div class="list">
              <div class="row"><span>Self-service</span><strong>971</strong></div>
              <div class="row"><span>Reception assisted</span><strong>115</strong></div>
              <div class="row"><span>Estimated reception time saved</span><strong>9.6 h</strong></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="grid grid--2">
        <div class="card">
          <div class="card__head"><div><h3>Usage by department</h3><p>Monthly validated sessions</p></div></div>
          ${departments.map(([n,v,p])=>`<div class="statbar statbar--accent"><span>${n}</span><div class="statbar__track"><i style="width:${Math.min(100,p*3)}%"></i></div><b>${v}</b></div>`).join("")}
        </div>
        <div class="card">
          <div class="card__head"><div><h3>Exit-hour concentration</h3><p>When employees typically validate</p></div><span class="badge badge--amber">Peak 5–6 PM</span></div>
          <div class="heatmap">
            <span>Time</span>${["2p","3p","4p","5p","6p","7p","8p","9p"].map(x=>`<span>${x}</span>`).join("")}
            <span>Usage</span>${hourly.map(v=>`<div class="heat h${v>70?4:v>50?3:v>25?2:1}" title="${v} validations"></div>`).join("")}
          </div>
          <div class="alert alert--neutral" style="margin-top:18px"><b>Operational insight:</b> 58% of weekday validations happen between 4:30–6:30 PM. Reception coverage for exceptions should be strongest during this window.</div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="section__head">
        <div><h2>Employee-level usage</h2><p>Detailed benefit consumption and behavior</p></div>
        <div class="toolbar">
          <input id="employeeSearch" class="input" placeholder="Search employee or department">
          <select id="channelFilter" class="select"><option value="">All channels</option><option>Self-service</option><option>Mixed</option></select>
          <button id="exportCsv" class="button">Export CSV</button>
        </div>
      </div>
      <div class="card"><div id="analyticsEmployeeTable">${employeeTable(employees,true)}</div></div>
    </section>

    <section class="section">
      <div class="grid grid--3">
        <div class="card"><div class="card__head"><div><h3>High usage</h3><p>Potential review candidates</p></div></div>
          <div class="row"><div><strong>Sultan H.</strong><span class="sub">Sales · 23 validations</span></div><span class="badge badge--amber">+31% vs avg</span></div>
          <div class="row"><div><strong>Nawaf A.</strong><span class="sub">Operations · 22 validations</span></div><span class="badge">Normal</span></div>
        </div>
        <div class="card"><div class="card__head"><div><h3>Friction signals</h3><p>Users needing intervention</p></div></div>
          <div class="row"><div><strong>2 employees</strong><span class="sub">Vehicle not registered</span></div><span class="badge badge--red">Action</span></div>
          <div class="row"><div><strong>5 assisted sessions</strong><span class="sub">Today</span></div><span class="badge badge--green">Low</span></div>
        </div>
        <div class="card"><div class="card__head"><div><h3>Benefit efficiency</h3><p>Current month</p></div></div>
          <div class="row"><span>Avg. points / employee</span><strong>115.0</strong></div>
          <div class="row"><span>Unused enrolled employees</span><strong>7</strong></div>
          <div class="row"><span>Projected month-end use</span><strong>17,240 pts</strong></div>
        </div>
      </div>
    </section>`;
  }

  function employeeTable(rows,detailed){
    return `<div class="table-wrap"><table><thead><tr>
      <th>Employee</th><th>Department</th><th>Vehicle</th><th>Validations</th><th>Points</th>${detailed?"<th>Avg duration</th><th>Channel</th>":""}<th>Last use</th>
    </tr></thead><tbody>
      ${rows.map(r=>`<tr>
        <td><div class="employee-cell"><span class="avatar">${r[0].split(" ").map(x=>x[0]).join("").slice(0,2)}</span><strong>${r[0]}</strong></div></td>
        <td>${r[1]}</td><td>${r[2]}</td><td><b>${r[3]}</b></td><td>${money(r[4])}</td>
        ${detailed?`<td>${r[5]} h</td><td><span class="badge ${r[6]==="Self-service"?"badge--green":"badge--amber"}">${r[6]}</span></td>`:""}
        <td>${r[7]}</td>
      </tr>`).join("")}
    </tbody></table></div>`;
  }

  function employeesView(){
    return `<div class="grid grid--4">
      ${kpi("Active employees","118","92% enrollment")}
      ${kpi("Registered vehicles","114","4 employees need setup")}
      ${kpi("Used benefit this month","111","94% of enrolled")}
      ${kpi("Suspended","0","No access issues")}
    </div>
    <section class="section">
      <div class="section__head"><div><h2>Employee access</h2><p>Tenant identity, vehicles and usage</p></div>
        <div class="toolbar"><input id="empDirectorySearch" class="input" placeholder="Search employees"><button class="button button--dark" id="inviteEmployee">＋ Add employee</button></div>
      </div>
      <div class="card" id="directoryTable">${employeeTable(employees,true)}</div>
    </section>`;
  }

  function permissionsView(){
    const on=state.receptionTopupEnabled;
    return `<div class="grid grid--2">
      <div class="card">
        <div class="card__head"><div><h3>Reception permissions</h3><p>Delegated company capabilities</p></div><span class="badge ${on?"badge--green":"badge--red"}">${on?"Custom access":"Restricted"}</span></div>
        <div class="permission">
          <div><h4>Validate employee exceptions</h4><p>Reception can validate eligible employee tickets when self-service fails or a vehicle is not recognized.</p></div>
          <div class="permission__control"><strong>Always on</strong><button class="switch on" disabled></button></div>
        </div>
        <div class="permission">
          <div><h4>Validate visitors</h4><p>Reception can validate visitor tickets and must select a business reason.</p></div>
          <div class="permission__control"><strong>Always on</strong><button class="switch on" disabled></button></div>
        </div>
        <div class="permission">
          <div><h4>Top up corporate wallet</h4><p>Allow reception to add funds when needed. Every top-up is attributed to the receptionist and written to the audit ledger.</p></div>
          <div class="permission__control"><strong>${on?"Enabled":"Disabled"}</strong><button id="receptionTopupSwitch" class="switch ${on?"on":""}" ${state.role!=="admin"?"disabled":""}></button></div>
        </div>
        <div class="permission">
          <div><h4>Per-transaction top-up limit</h4><p>Maximum points that reception may add in one transaction.</p></div>
          <div class="permission__control"><input id="receptionLimit" class="input" style="min-width:95px;width:95px" type="number" value="${state.receptionTopupLimit}" ${state.role!=="admin"||!on?"disabled":""}></div>
        </div>
        ${state.role==="admin"?`<div class="alert alert--green" style="margin-top:16px">Company Admin is the authority that can grant or revoke Reception top-up access. Employees can never top up the corporate wallet.</div>`:`<div class="alert alert--neutral" style="margin-top:16px">Read-only permission view. Only the Company Admin can change tenant-level permissions.</div>`}
      </div>
      <div class="card">
        <div class="card__head"><div><h3>Employee parking policy</h3><p>Applied automatically before validation</p></div><span class="badge badge--green">Active</span></div>
        <div class="row"><span>Daily validation limit</span><strong>${state.employeeDailyLimit} / day</strong></div>
        <div class="row"><span>Maximum sponsored duration</span><strong>${state.employeeMaxHours} hours</strong></div>
        <div class="row"><span>Allowed site</span><strong>Laysen Valley</strong></div>
        <div class="row"><span>Registered vehicle required</span><strong>Yes</strong></div>
        <div class="row"><span>Employee wallet visibility</span><strong>No</strong></div>
        <div class="row"><span>Employee top-up permission</span><strong>Never</strong></div>
      </div>
    </div>
    <section class="section">
      <div class="grid grid--2">
        <div class="card"><div class="card__head"><div><h3>Role matrix</h3><p>Least-privilege model</p></div></div>
          <div class="table-wrap"><table><thead><tr><th>Capability</th><th>Employee</th><th>Reception</th><th>Admin</th></tr></thead><tbody>
            ${[
              ["Own validation","✓","—","✓"],["Visitor / exception validation","—","✓","✓"],["Wallet top-up","—",on?"Conditional":"—","✓"],["Manage top-up permission","—","—","✓"],["Employee analytics","Own only","Summary","Full"],["Manage employees","—","—","✓"]
            ].map(r=>`<tr>${r.map((c,i)=>`<${i?"td":"td"}>${c}</td>`).join("")}</tr>`).join("")}
          </tbody></table></div>
        </div>
        <div class="card"><div class="card__head"><div><h3>Recent permission activity</h3><p>Audit events</p></div></div>
          <div class="audit">${state.audit.slice(0,7).map(x=>`<div class="audit__item"><div class="audit__dot"></div><div><strong>${escapeHTML(x.text)}</strong><p>${escapeHTML(x.actor)} · ${escapeHTML(x.time)}</p></div></div>`).join("")}</div>
        </div>
      </div>
    </section>`;
  }

  function transactionsView(){
    const ledger=[...state.ledger];
    return `<div class="grid grid--4">
      ${kpi("Wallet balance",pts(state.balance),"Available now")}
      ${kpi("Validation spend","13,575 pts","Current month")}
      ${kpi("Top-ups this month","3","7,500 pts added")}
      ${kpi("Avg validation","12.500 pts","Per eligible session")}
    </div>
    <section class="section">
      <div class="section__head"><div><h2>Wallet ledger</h2><p>Immutable-style prototype audit trail</p></div>
        <div class="toolbar">${(state.role==="admin"||state.role==="reception")?`<button id="topupButton" class="button button--dark" ${state.role==="reception"&&!state.receptionTopupEnabled?"disabled":""}>＋ Top up</button>`:""}</div>
      </div>
      ${state.role==="reception"&&!state.receptionTopupEnabled?`<div class="alert" style="margin-bottom:10px">Reception top-up is currently disabled by Company Admin. You can validate tickets, but you cannot add points to the corporate wallet.</div>`:""}
      <div class="card">${ledgerTable(ledger)}</div>
    </section>`;
  }

  function ledgerTable(rows){
    return `<div class="table-wrap"><table><thead><tr><th>Date</th><th>Type</th><th>Actor</th><th>Reference</th><th>Channel</th><th>Points</th></tr></thead><tbody>
      ${rows.map(x=>`<tr><td>${x.date}</td><td><span class="badge ${x.type==="Top-up"?"badge--blue":"badge--green"}">${x.type}</span></td><td>${x.actor}</td><td>${x.ref}</td><td>${x.channel}</td><td style="color:${x.points>0?"var(--green)":"var(--ink)"};font-weight:700">${x.points>0?"+":""}${money(x.points)}</td></tr>`).join("")}
    </tbody></table></div>`;
  }

  function receptionTopupPanel(compact=false){
    const on=state.receptionTopupEnabled;
    return `<div style="margin-top:${compact?12:0}px">${on
      ? `<div class="alert alert--green"><b>Top-up permission enabled.</b> Reception can add up to ${money(state.receptionTopupLimit)} points per transaction. Every transaction is logged.</div><button class="button button--dark button--wide" style="margin-top:9px" id="receptionTopupNow">Top up wallet</button>`
      : `<div class="alert"><b>Top-up permission disabled.</b> Ask Company Admin to enable this capability if reception should be able to refill the corporate wallet.</div>`
    }</div>`;
  }

  function validateView(){
    const isReception=state.role==="reception";
    return `<div class="grid grid--2">
      <div class="card">
        <div class="card__head"><div><h3>${isReception?"Reception validation":"Parking validation"}</h3><p>Search by ticket, QR or vehicle plate</p></div><span class="badge badge--green">Connected demo</span></div>
        <div class="form">
          <div class="field"><label>Ticket / vehicle plate</label><input id="ticketSearch" value="PP-90892"></div>
          <div class="field"><label>Validation type</label><select id="validationType"><option>Employee parking benefit</option><option>Visitor validation</option><option>Exception override</option></select></div>
          <button id="findSession" class="button button--dark button--wide">Find parking session</button>
        </div>
        <div id="sessionResult" style="margin-top:14px"></div>
      </div>
      <div class="card">
        <div class="card__head"><div><h3>Wallet & permissions</h3><p>Only capabilities for this role are shown</p></div></div>
        <div class="row"><span>Corporate balance</span><strong>${state.role==="employee"?"Hidden":pts(state.balance)}</strong></div>
        <div class="row"><span>Can validate</span><span class="badge badge--green">Yes</span></div>
        <div class="row"><span>Can top up</span><span class="badge ${(state.role==="admin"||(state.role==="reception"&&state.receptionTopupEnabled))?"badge--green":"badge--red"}">${state.role==="admin"?"Yes":state.role==="reception"&&state.receptionTopupEnabled?"Yes · delegated":"No"}</span></div>
        ${state.role==="reception"?receptionTopupPanel():""}
      </div>
    </div>`;
  }

  function exceptionsView(){
    return `<div class="grid grid--4">
      ${kpi("Open exceptions","2","Needs reception review")}
      ${kpi("Resolved today","5","All audited")}
      ${kpi("Visitors","9","Validated today")}
      ${kpi("Avg handling","21 sec","Target < 30 sec")}
    </div>
    <section class="section"><div class="grid grid--2">
      <div class="card">
        <div class="card__head"><div><h3>Exception queue</h3><p>Only cases that could not self-resolve</p></div><span class="badge badge--amber">2 pending</span></div>
        <div class="row"><div><strong>Sarah A.</strong><span class="sub">PP-90901 · Plate mismatch</span></div><button class="button resolveException">Review</button></div>
        <div class="row"><div><strong>Mohammed N.</strong><span class="sub">PP-90914 · Daily limit exceeded</span></div><button class="button resolveException">Review</button></div>
      </div>
      <div class="card">
        <div class="card__head"><div><h3>Top-up capability</h3><p>Controlled by Company Admin</p></div></div>
        ${receptionTopupPanel()}
      </div>
    </div></section>`;
  }

  function employeeHome(){
    return `<div class="phone-wrap">
      ${phoneUI()}
      <div>
        <span class="eyebrow">Employee experience</span>
        <h2 style="font-size:30px;letter-spacing:-.045em;margin:8px 0 10px">Parking should take seconds, not a receptionist.</h2>
        <p style="font-size:11px;color:var(--muted);line-height:1.7;max-width:650px">The employee signs in with their company identity, registers a vehicle once, then validates only their own eligible parking session. They never see or control the company wallet.</p>
        <div class="grid grid--2" style="margin-top:18px">
          ${kpi("Your validations","19","Current month")}
          ${kpi("Benefit used","237.500 pts","Paid by Alraedah")}
          ${kpi("Avg duration","8h 12m","Current month")}
          ${kpi("Assisted sessions","0","100% self-service")}
        </div>
      </div>
    </div>`;
  }

  function phoneUI(){
    return `<div class="phone"><div class="phone__screen">
      <div class="phone__island"></div>
      <div class="phone__top"><div class="phone__topbar"><div class="phone__parkpoint">PARKPOINT</div><span class="avatar">AM</span></div></div>
      <div class="phone__hero"><small>Good evening, Abdulrahman</small><h2>You're parked at<br>Laysen Valley.</h2><div class="plate-ui"><i></i> ABC 1234</div></div>
      <div class="phone__content">
        <div class="phone__session">
          <span class="badge badge--green">● Active session</span>
          <div class="session-time">08:41 AM</div>
          <span class="sub">Gate B · Employee parking</span>
          <div style="margin-top:12px">
            <div class="minirow"><span>Eligibility</span><b style="color:var(--green)">Covered</b></div>
            <div class="minirow"><span>Daily use</span><b>0 / ${state.employeeDailyLimit}</b></div>
            <div class="minirow"><span>Sponsored up to</span><b>${state.employeeMaxHours} hours</b></div>
          </div>
          <button class="phone__cta" id="phoneValidate">Validate parking</button>
        </div>
        <div class="section__head"><div><h2 style="font-size:13px">Recent parking</h2><p>Last two sessions</p></div></div>
        <div class="row"><span>26 Aug · 5:11 PM</span><span class="badge badge--green">Validated</span></div>
        <div class="row"><span>25 Aug · 4:49 PM</span><span class="badge badge--green">Validated</span></div>
      </div>
      <div class="phone__nav"><div class="active"><b>⌂</b>Home</div><div><b>◎</b>Validate</div><div><b>◔</b>Usage</div><div><b>♙</b>Profile</div></div>
    </div></div>`;
  }

  function myUsage(){
    return `<div class="grid grid--4">
      ${kpi("This month","19","Validated sessions")}
      ${kpi("Benefit used","237.500 pts","Company-sponsored")}
      ${kpi("Avg duration","8h 12m","Across 19 sessions")}
      ${kpi("Self-service","100%","No reception assistance")}
    </div>
    <section class="section"><div class="grid grid--2">
      <div class="card"><div class="card__head"><div><h3>My parking trend</h3><p>Last 14 working days</p></div></div>${lineChart([1,1,0,1,1,1,1,0,1,1,1,1,1,1])}</div>
      <div class="card"><div class="card__head"><div><h3>My policy</h3><p>Assigned by Alraedah Finance</p></div></div>
        <div class="row"><span>Validations</span><strong>${state.employeeDailyLimit} / day</strong></div>
        <div class="row"><span>Sponsored duration</span><strong>${state.employeeMaxHours} hours</strong></div>
        <div class="row"><span>Site</span><strong>Laysen Valley</strong></div>
        <div class="row"><span>Vehicle</span><strong>ABC 1234</strong></div>
      </div>
    </div></section>`;
  }

  function mobileView(){
    return `<div class="phone-wrap">
      ${phoneUI()}
      <div>
        <div class="card">
          <div class="card__head"><div><h3>Mobile UX principles</h3><p>Designed around the action employees actually need</p></div></div>
          <div class="permission"><div><h4>One dominant action</h4><p>“Validate parking” is visible immediately when an eligible session exists.</p></div><span class="badge badge--green">Fast</span></div>
          <div class="permission"><div><h4>No corporate wallet exposure</h4><p>Employees see coverage and limits, not privileged company financial controls.</p></div><span class="badge badge--green">Safe</span></div>
          <div class="permission"><div><h4>Automatic session detection</h4><p>Target state is ticket/QR/ANPR detection so employees do not re-enter data unnecessarily.</p></div><span class="badge badge--blue">Target</span></div>
          <div class="permission"><div><h4>Exception-first reception</h4><p>Normal employee parking is self-service. Reception only handles exceptions and visitors.</p></div><span class="badge badge--green">Efficient</span></div>
        </div>
      </div>
    </div>`;
  }

  function parkpointView(){
    return `<div class="grid grid--4">
      ${kpi("Portfolio tenants","38","Enterprise demo tenants")}
      ${kpi("End users","4,218","Across all tenant companies")}
      ${kpi("Validations today","1,906","All managed locations","+7.2%")}
      ${kpi("Platform health","99.97%","Simulated uptime")}
    </div>
    <section class="section">
      <div class="card">
        <div class="card__head"><div><h3>Tenant portfolio</h3><p>ParkPoint operator view</p></div><span class="badge badge--green">Multi-tenant</span></div>
        <div class="table-wrap"><table><thead><tr><th>Tenant</th><th>Location</th><th>Users</th><th>Monthly validations</th><th>Wallet</th><th>Self-service</th><th>Status</th></tr></thead><tbody>
          <tr><td><strong>Alraedah Finance</strong></td><td>Laysen Valley</td><td>118</td><td>1,086</td><td>${pts(state.balance)}</td><td>89.4%</td><td><span class="badge badge--green">Live</span></td></tr>
          <tr><td>Demo Healthcare</td><td>Riyadh</td><td>412</td><td>3,840</td><td>13,442 pts</td><td>83.1%</td><td><span class="badge badge--green">Live</span></td></tr>
          <tr><td>Demo Hospitality</td><td>Jeddah</td><td>87</td><td>684</td><td>4,115 pts</td><td>74.2%</td><td><span class="badge badge--amber">Pilot</span></td></tr>
        </tbody></table></div>
      </div>
    </section>
    <section class="section"><div class="grid grid--3">
      <div class="card"><span class="eyebrow">Identity</span><h3>Enterprise RBAC</h3><p class="sub" style="line-height:1.6">Individual identities underneath each tenant instead of one shared corporate login.</p></div>
      <div class="card"><span class="eyebrow">Operations</span><h3>Policy engine</h3><p class="sub" style="line-height:1.6">Location, duration, daily limits, wallet balance, vehicle eligibility and delegated permissions.</p></div>
      <div class="card"><span class="eyebrow">Intelligence</span><h3>Tenant analytics</h3><p class="sub" style="line-height:1.6">Adoption, usage, exceptions, wallet forecast, peak times and employee-level reporting.</p></div>
    </div></section>`;
  }

  function flowsView(){
    const flow=(title,desc,steps)=>`<div class="card" style="margin-bottom:12px"><div class="card__head"><div><h3>${title}</h3><p>${desc}</p></div></div>
      <div class="flow-grid">${steps.map((s,i)=>`<div class="flow-step"><b>${i+1}</b><strong>${s[0]}</strong><span>${s[1]}</span></div>`).join("")}</div></div>`;
    return flow("Employee onboarding","One-time setup, no shared credentials",[
      ["Company SSO","Employee signs in using tenant identity."],["Tenant match","User is assigned to Alraedah Finance."],["Vehicle setup","Plate is registered once."],["Policy assigned","Parking benefit becomes available."],["Ready","Employee can validate own sessions."]
    ])+flow("Daily employee validation","The everyday flow should be almost invisible",[
      ["Session detected","QR, ticket or plate event."],["Identity matched","Employee + vehicle."],["Rules checked","Location, daily limit, duration."],["Validated","Benefit applies from corporate wallet."],["Audited","Actor, ticket, cost and timestamp."]
    ])+flow("Reception exception","Reception only works on exceptions",[
      ["Exception created","Unknown plate / visitor / policy issue."],["Reception reviews","Limited role sees relevant data."],["Reason captured","Business purpose or override reason."],["Validation applied","Corporate wallet deduction."],["Report updated","Exception remains auditable."]
    ])+flow("Delegated top-up","Company Admin controls financial delegation",[
      ["Admin enables","Reception top-up permission switched on."],["Limit assigned","Maximum points per top-up."],["Reception tops up","Reason required."],["Wallet updates","Balance is immediately reflected."],["Audit recorded","Actor, amount and permission state."]
    ])+flow("Zero-touch target state","The strongest long-term experience",[
      ["Vehicle enters","ANPR recognizes plate."],["Employee matched","Active tenant entitlement."],["Benefit reserved","No user action."],["Vehicle exits","Duration confirmed."],["Auto-validation","Only failed cases reach reception."]
    ]);
  }

  function render(){
    try {
      const map={
        overview,analytics,employees:employeesView,permissions:permissionsView,transactions:transactionsView,
        validate:validateView,exceptions:exceptionsView,employeeHome,myUsage,mobile:mobileView,parkpoint:parkpointView,flows:flowsView
      };
      const renderer=map[state.route]||overview;
      $("#view").innerHTML=renderer();
      wireView();
    } catch(err) {
      console.error("ParkPoint prototype render error",err);
      $("#view").innerHTML=`<div class="card"><div class="card__head"><div><h3>We couldn't load this page</h3><p>The prototype caught a UI error instead of leaving a blank screen.</p></div><span class="badge badge--red">UI error</span></div><div class="alert"><b>${escapeHTML(err?.message||"Unknown error")}</b><br>Switch role or use Reset demo data. If this is the finalized hosted build, report the route shown in the address bar.</div><button class="button button--dark" style="margin-top:12px" id="recoverOverview">Return to overview</button></div>`;
      const b=$("#recoverOverview"); if(b) b.onclick=()=>go(state.role==="employee"?"employeeHome":state.role==="parkpoint"?"parkpoint":"overview");
    }
  }

  function modal(html){
    const tpl=$("#modalTemplate").content.cloneNode(true);
    const layer=tpl.querySelector(".modal-layer");
    layer.querySelector(".modal__content").innerHTML=html;
    $("#modalRoot").appendChild(tpl);
    $$("[data-close-modal]").forEach(x=>x.onclick=closeModal);
  }
  function closeModal(){ $("#modalRoot").innerHTML=""; }

  function showTopup(){
    const isReception=state.role==="reception";
    if(isReception && !state.receptionTopupEnabled){ toast("Reception top-up is disabled by Company Admin"); return; }
    const max=isReception?state.receptionTopupLimit:100000;
    modal(`<h2>Top up corporate wallet</h2>
      <p>${isReception?`Delegated Reception access · maximum ${money(max)} points per transaction.`:"Company Admin top-up access."}</p>
      <div class="form">
        <div class="field"><label>Points</label><input id="topupAmount" type="number" min="1" max="${max}" value="${isReception?500:1000}"></div>
        <div class="field"><label>Reason</label><select id="topupReason"><option>Low wallet balance</option><option>Operational requirement</option><option>Monthly refill</option></select></div>
        <div class="form-actions"><button class="button" data-close-modal>Cancel</button><button class="button button--dark" id="confirmTopup">Confirm top-up</button></div>
      </div>`);
    $("#confirmTopup").onclick=()=>{
      const n=Number($("#topupAmount").value);
      if(!n||n<=0){toast("Enter a valid amount");return}
      if(isReception && n>max){toast(`Reception limit is ${money(max)} points`);return}
      state.balance+=n;
      state.ledger.unshift({date:"Now",type:"Top-up",actor:isReception?"Reception":"Company Admin",ref:`TOP-${Math.floor(1000+Math.random()*8999)}`,points:n,channel:isReception?"Delegated reception":"Admin"});
      state.audit.unshift({time:"Now",actor:isReception?"Reception":"Company Admin",text:`Corporate wallet topped up by ${money(n)} points`});
      save(); closeModal(); renderShell(); render(); toast(`${money(n)} points added`);
    };
  }

  function showValidationResult(){
    $("#sessionResult").innerHTML=`<div class="callout"><div class="callout__icon">P</div><div style="flex:1"><strong>Eligible parking session found</strong><p>Ticket PP-90892 · Laysen Valley · Employee matched · 7h 43m parked</p><button id="confirmValidation" class="button button--accent" style="margin-top:9px">Validate · 12.500 pts</button></div></div>`;
    $("#confirmValidation").onclick=performValidation;
  }

  function performValidation(){
    if(state.balance<12.5){toast("Corporate wallet balance is too low");return}
    state.balance-=12.5;state.validationsToday++;
    const actor=state.role==="employee"?"Abdulrahman M.":state.role==="reception"?"Reception":"Company Admin";
    state.ledger.unshift({date:"Now",type:"Validation",actor,ref:"PP-90892",points:-12.5,channel:state.role==="employee"?"Self-service":state.role==="reception"?"Reception":"Admin"});
    state.audit.unshift({time:"Now",actor,text:"Parking ticket PP-90892 validated"});
    save(); toast("Parking validated successfully");
    if(state.route==="validate") render();
  }

  function inviteEmployeeModal(){
    modal(`<h2>Add employee</h2><p>Create an employee record for the prototype tenant. A real version should use SSO / HR directory sync rather than manual creation where possible.</p>
      <div class="form"><div class="field"><label>Full name</label><input id="newName" placeholder="Employee name"></div><div class="field"><label>Work email</label><input id="newEmail" placeholder="name@alraedah.sa"></div><div class="field"><label>Department</label><input id="newDept" placeholder="Department"></div><div class="form-actions"><button class="button" data-close-modal>Cancel</button><button id="saveEmployee" class="button button--dark">Create</button></div></div>`);
    $("#saveEmployee").onclick=()=>{ if(!$("#newName").value.trim()){toast("Enter the employee name");return} closeModal();toast("Employee created in demo"); };
  }

  function exceptionModal(){
    modal(`<h2>Review exception</h2><p>PP-90901 · Employee ticket could not self-validate because the detected plate does not match the registered vehicle.</p>
      <div class="alert alert--neutral"><b>Employee:</b> Sarah A.<br><b>Registered plate:</b> RDA 7712<br><b>Detected plate:</b> RDA 7717</div>
      <div class="form" style="margin-top:12px"><div class="field"><label>Resolution reason</label><select><option>Temporary / replacement vehicle</option><option>Correct registration error</option><option>Business override</option></select></div>
      <div class="form-actions"><button class="button" data-close-modal>Cancel</button><button id="approveException" class="button button--dark">Approve validation</button></div></div>`);
    $("#approveException").onclick=()=>{closeModal();performValidation();toast("Exception validated and audited");};
  }

  function filterAnalytics(){
    const q=($("#employeeSearch")?.value||"").toLowerCase();
    const ch=$("#channelFilter")?.value||"";
    const rows=employees.filter(r=>(r[0]+" "+r[1]).toLowerCase().includes(q)&&(!ch||r[6]===ch));
    $("#analyticsEmployeeTable").innerHTML=employeeTable(rows,true);
  }
  function filterDirectory(){
    const q=($("#empDirectorySearch")?.value||"").toLowerCase();
    $("#directoryTable").innerHTML=employeeTable(employees.filter(r=>(r[0]+" "+r[1]).toLowerCase().includes(q)),true);
  }
  function exportCSV(){
    const csv=[["Employee","Department","Vehicle","Validations","Points","Avg Duration","Channel","Last Use"],...employees].map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="parkpoint-employee-usage-demo.csv";a.click();URL.revokeObjectURL(a.href);
    toast("CSV exported");
  }

  function wireView(){
    $$("[data-go]").forEach(b=>b.onclick=()=>go(b.dataset.go));
    if($("#findSession")) $("#findSession").onclick=showValidationResult;
    if($("#topupButton")) $("#topupButton").onclick=showTopup;
    if($("#receptionTopupNow")) $("#receptionTopupNow").onclick=showTopup;
    if($("#phoneValidate")) $("#phoneValidate").onclick=performValidation;
    if($("#inviteEmployee")) $("#inviteEmployee").onclick=inviteEmployeeModal;
    $$(".resolveException").forEach(b=>b.onclick=exceptionModal);
    if($("#employeeSearch")) $("#employeeSearch").oninput=filterAnalytics;
    if($("#channelFilter")) $("#channelFilter").onchange=filterAnalytics;
    if($("#exportCsv")) $("#exportCsv").onclick=exportCSV;
    if($("#empDirectorySearch")) $("#empDirectorySearch").oninput=filterDirectory;

    if($("#receptionTopupSwitch")){
      $("#receptionTopupSwitch").onclick=()=>{
        if(state.role!=="admin") return;
        state.receptionTopupEnabled=!state.receptionTopupEnabled;
        state.audit.unshift({time:"Now",actor:"Company Admin",text:`Reception wallet top-up permission ${state.receptionTopupEnabled?"enabled":"disabled"}`});
        save();render();toast(`Reception top-up ${state.receptionTopupEnabled?"enabled":"disabled"}`);
      };
    }
    if($("#receptionLimit")){
      $("#receptionLimit").onchange=()=>{
        const n=Math.max(100,Number($("#receptionLimit").value)||1500);
        state.receptionTopupLimit=n;
        state.audit.unshift({time:"Now",actor:"Company Admin",text:`Reception top-up limit changed to ${money(n)} points`});
        save();render();toast("Reception top-up limit updated");
      };
    }
  }

  function toggleLanguage(){
    state.language=state.language==="en"?"ar":"en";
    const rtl=state.language==="ar";
    document.documentElement.dir=rtl?"rtl":"ltr";
    document.documentElement.lang=rtl?"ar":"en";
    save();
    toast(rtl?"تم تفعيل اتجاه العربية للنموذج":"English interface direction enabled");
  }

  function init(){
    const hash=(location.hash||"").replace(/^#/,"");
    if(hash.includes("/")){
      const [r,route]=hash.split("/");
      if(roles[r] && navByRole[r]?.some(x=>x[0]===route)){ state.role=r; state.route=route; }
    }
    $("#roleGate").classList.remove("hidden");
    $$(".role-card").forEach(x=>x.onclick=()=>setRole(x.dataset.role));
    $("#openRoles").onclick=()=>$("#roleGate").classList.remove("hidden");
    $("#mobileRoleBtn").onclick=()=>$("#roleGate").classList.remove("hidden");
    $("#quickValidateBtn").onclick=()=>go("validate");
    $("#languageBtn").onclick=toggleLanguage;
    $("#resetDemo").onclick=()=>{
      localStorage.removeItem(STORAGE);state={...defaultState,ledger:[...defaultState.ledger],audit:[...defaultState.audit]};
      toast("Demo data reset");setRole("admin",false);
    };
    document.documentElement.dir=state.language==="ar"?"rtl":"ltr";
    renderShell(); render();
    if("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("sw.js").catch(()=>{});
  }

  return {init};
})();
document.addEventListener("DOMContentLoaded",PP.init);
