const ACCOUNTS = [
  "Cash",
  "Accounts Receivable",
  "Office Supplies",
  "Computer Equipment",
  "Accounts Payable",
  "Service Revenue",
  "Expenses",
  "Capital"
];

let rows = [];
let nextId = 1;

/* FORMAT */
function fmt(n){
  return "₱ " + Number(n).toLocaleString("en-PH",{
    minimumFractionDigits:2,
    maximumFractionDigits:2
  });
}

/* ADD ROW */
function addRow(){
  rows.push({
    id:nextId++,
    drAcc:"",
    drAmt:"",
    crAcc:""
  });

  render();
}

/* DELETE */
function removeRow(id){
  rows = rows.filter(r => r.id !== id);
  render();
}

/* UPDATE */
function updateField(id, field, val){
  const row = rows.find(r => r.id === id);
  if(!row) return;

  row[field] = val;

  if(field === "drAmt"){
    const cr = document.getElementById("cr-"+id);
    const num = parseFloat(val);

    cr.value = (!isNaN(num) && num > 0)
      ? num.toFixed(2)
      : "";
  }

  updateTotals();
}

/* SELECT OPTIONS */
function options(selected){
  return `
    <option value="">Select...</option>

    ${ACCOUNTS.map(acc => `
      <option value="${acc}"
        ${selected === acc ? "selected" : ""}>
        ${acc}
      </option>
    `).join("")}
  `;
}

/* RENDER TABLE */
function render(){

  document.getElementById("journal-body").innerHTML =
  rows.map((r,i)=>`

    <tr>

      <td>${i+1}</td>

      <td>
        <select onchange="updateField(${r.id},'drAcc',this.value)">
          ${options(r.drAcc)}
        </select>
      </td>

      <td>
        <input
          type="number"
          value="${r.drAmt}"
          oninput="updateField(${r.id},'drAmt',this.value)"
        >
      </td>

      <td>
        <select onchange="updateField(${r.id},'crAcc',this.value)">
          ${options(r.crAcc)}
        </select>
      </td>

      <td>
        <input
          id="cr-${r.id}"
          class="cr-mirror"
          value="${r.drAmt ? parseFloat(r.drAmt).toFixed(2) : ""}"
          readonly
        >
      </td>

      <td>
        <button class="del-btn"
          onclick="removeRow(${r.id})">
          ✕
        </button>
      </td>

    </tr>

  `).join("");

  updateTotals();
}

/* TOTALS */
function updateTotals(){

  let total = 0;

  rows.forEach(r=>{
    total += parseFloat(r.drAmt) || 0;
  });

  document.getElementById("total-dr").innerText = fmt(total);
  document.getElementById("total-cr").innerText = fmt(total);
}

/* SAVE */
function saveEntries(){
  alert("Saved successfully.");
}

/* SWITCH PAGE */
function showTB(){
  document.getElementById("journal-page").style.display = "none";
  document.getElementById("tb-page").style.display = "block";

  renderTB();
}

function showJournal(){
  document.getElementById("journal-page").style.display = "block";
  document.getElementById("tb-page").style.display = "none";
}

/* TRIAL BALANCE */
function renderTB(){

  const debit = {};
  const credit = {};

  rows.forEach(r=>{

    const amt = parseFloat(r.drAmt) || 0;

    if(r.drAcc){
      debit[r.drAcc] =
        (debit[r.drAcc] || 0) + amt;
    }

    if(r.crAcc){
      credit[r.crAcc] =
        (credit[r.crAcc] || 0) + amt;
    }
  });

  const accounts = [...new Set([
    ...Object.keys(debit),
    ...Object.keys(credit)
  ])];

  if(accounts.length === 0){

    document.getElementById("tb-content").innerHTML =
      "No entries yet.";

    return;
  }

  let totalD = 0;
  let totalC = 0;

  const html = accounts.map(acc=>{

    const d = debit[acc] || 0;
    const c = credit[acc] || 0;

    totalD += d;
    totalC += c;

    return `
      <tr>
        <td>${acc}</td>
        <td>${d ? fmt(d) : "-"}</td>
        <td>${c ? fmt(c) : "-"}</td>
      </tr>
    `;
  }).join("");

  const balanced =
    Math.abs(totalD - totalC) < 0.01;

  document.getElementById("tb-content").innerHTML = `

    <table>
      <thead>
        <tr>
          <th>Account</th>
          <th>Debit</th>
          <th>Credit</th>
        </tr>
      </thead>

      <tbody>
        ${html}
      </tbody>

      <tfoot>
        <tr class="totals">
          <td>Total</td>
          <td>${fmt(totalD)}</td>
          <td>${fmt(totalC)}</td>
        </tr>
      </tfoot>
    </table>

    <div class="badge ${balanced ? "ok":"no"}">
      ${balanced ? "✓ Balanced" : "✗ Not Balanced"}
    </div>
  `;
}

/* INIT */
addRow();
addRow();