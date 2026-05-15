const ACCOUNTS = [
  "Cash",
  "Accounts Receivable",
  "Office Supplies",
  "Computer Equipment",
  "Software Subscription",
  "Accounts Payable",
  "Unearned Revenue",
  "Owner's Capital",
  "Owner's Drawings",
  "Service Revenue",
  "Rent Expense",
  "Internet Expense",
  "Salaries Expense",
  "Utilities Expense",
  "Notes Payable",
  "Prepaid Expense"
];

let rows = [];
let nextId = 1;

function fmt(n){
  return 'P ' + Number(n).toLocaleString('en-PH',{
    minimumFractionDigits:2,
    maximumFractionDigits:2
  });
}

function acctOptions(selected){
  return `
    <option value="">Select Account...</option>
    ${ACCOUNTS.map(a =>
      `<option value="${a}" ${a===selected?'selected':''}>${a}</option>`
    ).join('')}
  `;
}

function addRow(){
  rows.push({
    id:nextId++,
    drAcc:'',
    drAmt:'',
    crAcc:''
  });

  renderTable();
}

function removeRow(id){
  rows = rows.filter(r => r.id !== id);
  renderTable();
}

function updateField(id, field, value){

  const row = rows.find(r => r.id === id);

  if(row){
    row[field] = value;
  }

  updateTotals();
}

function renderTable(){

  document.getElementById('journal-body').innerHTML =
  rows.map((r,i)=>`

    <tr>

      <td>${i+1}</td>

      <td>
        <select onchange="updateField(${r.id},'drAcc',this.value)">
          ${acctOptions(r.drAcc)}
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
          ${acctOptions(r.crAcc)}
        </select>
      </td>

      <td>
        <input
          class="cr-mirror"
          type="number"
          value="${r.drAmt}"
          readonly
        >
      </td>

      <td>
        <button class="del-btn" onclick="removeRow(${r.id})">
          X
        </button>
      </td>

    </tr>

  `).join('');

  updateTotals();
}

function updateTotals(){

  let total = 0;

  rows.forEach(r=>{
    total += parseFloat(r.drAmt) || 0;
  });

  document.getElementById('total-dr').textContent = fmt(total);
  document.getElementById('total-cr').textContent = fmt(total);
}

function clearAll(){

  if(confirm('Clear all entries?')){
    rows = [];
    renderTable();
  }

}

function saveEntries(){
  alert('Entries Saved!');
}

function showPage(page){

  document.querySelectorAll('.page')
  .forEach(p=>p.classList.remove('active'));

  document.getElementById('page-'+page)
  .classList.add('active');

  if(page === 'tb'){
    renderTB();
  }
}

function renderTB(){

  const debitTotals = {};
  const creditTotals = {};

  rows.forEach(r=>{

    const amt = parseFloat(r.drAmt) || 0;

    if(r.drAcc){
      debitTotals[r.drAcc] =
      (debitTotals[r.drAcc] || 0) + amt;
    }

    if(r.crAcc){
      creditTotals[r.crAcc] =
      (creditTotals[r.crAcc] || 0) + amt;
    }

  });

  const accounts = [
    ...new Set([
      ...Object.keys(debitTotals),
      ...Object.keys(creditTotals)
    ])
  ];

  if(accounts.length === 0){

    document.getElementById('tb-content').innerHTML =
    `<div class="empty-state">No entries yet.</div>`;

    return;
  }

  let totalD = 0;
  let totalC = 0;

  const rowsHTML = accounts.map(acc=>{

    const d = debitTotals[acc] || 0;
    const c = creditTotals[acc] || 0;

    totalD += d;
    totalC += c;

    return `
      <tr>
        <td>${acc}</td>
        <td>${d ? fmt(d) : '-'}</td>
        <td>${c ? fmt(c) : '-'}</td>
      </tr>
    `;
  }).join('');

  document.getElementById('tb-content').innerHTML = `

    <table>

      <thead>
        <tr>
          <th>Account</th>
          <th>Debit</th>
          <th>Credit</th>
        </tr>
      </thead>

      <tbody>
        ${rowsHTML}
      </tbody>

    </table>

  `;
}

addRow();
addRow();