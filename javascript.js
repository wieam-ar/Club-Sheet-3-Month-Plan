// Default dataset (prefilled with your 3-month plan)
const defaultData = [
    {
        month: 'Month 1',
        activities: 'we will start the first month by organizing an introductory meeting for new members with ice-breaking activities and group games, along with a small workshop on communication or creative thinking.',
        meetings: 'Weekly 1h meeting to coordinate tasks and set roles',
        recruitment: 'Social media stories; University presentations; Welcome open day',
        progress: 'Not started'
    },
    {
        month: 'Month 2',
        activities: 'Programming & Arduino lessons; Team projects; Simple app buildsby forming an organized team, setting a clear and successful plan to deliver lessons to trainees in a gradual and practical way.',
        meetings: 'Weekly meetings + monthly review to check progress',
        recruitment: '"to attract new members, we will rely on engaging social media stories and introductory presentations at the university',
        progress: 'Not started'
    },
    {
        month: 'Month 3',
        activities: 'Programming and Arduino lessons, team projects, and simple app builds will be carried out by forming an organized team and setting a clear, effective plan to deliver lessons to trainees in a gradual and practical way.',
        meetings: 'Weekly meetings + final evaluation meeting',
        recruitment: 'Share photos & videos; Partnerships with other clubs for cross-promotion',
        progress: 'Not started'
    }
];

// Storage key
const KEY = 'club_sheet_v1';

// Elements
const tbody = document.getElementById('tbody');
const addRowBtn = document.getElementById('addRow');
const exportCSVBtn = document.getElementById('exportCSV');
const exportJSONBtn = document.getElementById('exportJSON');
const importBtn = document.getElementById('importBtn');
const imp = document.getElementById('imp');

// Load or seed
let data = JSON.parse(localStorage.getItem(KEY) || 'null');
if (!data) { data = defaultData; save(); }

function save() { localStorage.setItem(KEY, JSON.stringify(data)); }

// Render
function render() {
    tbody.innerHTML = '';
    data.forEach((row, idx) => {
        const tr = document.createElement('tr');
        tr.className = 'align-top';
        tr.innerHTML = `
          <td class="p-3 border text-sm text-slate-600">${idx + 1}</td>
          <td class="p-3 border"><div class="cell p-2 rounded" contenteditable="true" data-field="month" data-idx="${idx}">${escapeHtml(row.month)}</div></td>
          <td class="p-3 border"><div class="cell p-2 rounded" contenteditable="true" data-field="activities" data-idx="${idx}">${escapeHtml(row.activities)}</div></td>
          <td class="p-3 border"><div class="cell p-2 rounded" contenteditable="true" data-field="meetings" data-idx="${idx}">${escapeHtml(row.meetings)}</div></td>
          <td class="p-3 border"><div class="cell p-2 rounded" contenteditable="true" data-field="recruitment" data-idx="${idx}">${escapeHtml(row.recruitment)}</div></td>
          <td class="p-3 border"><div class="cell p-2 rounded" contenteditable="true" data-field="progress" data-idx="${idx}">${escapeHtml(row.progress)}</div></td>
          <td class="p-3 border text-right space-x-2"><button data-idx="${idx}" class="del px-2 py-1 rounded bg-red-100 text-red-600 ">Delete</button></td>
        `;
        tbody.appendChild(tr);
    });
    attachEvents();
}

function attachEvents() {
    document.querySelectorAll('.cell').forEach(el => {
        el.addEventListener('input', onEdit);
        el.addEventListener('blur', onEdit);
    });
    document.querySelectorAll('.del').forEach(b => b.addEventListener('click', onDelete));
}

function onEdit(e) {
    const el = e.currentTarget;
    const idx = Number(el.dataset.idx);
    const field = el.dataset.field;
    data[idx][field] = el.innerText.trim();
    save();
}

function onDelete(e) {
    const idx = Number(e.currentTarget.dataset.idx);
    if (!confirm('Delete this row?')) return;
    data.splice(idx, 1);
    save(); render();
}

// Add row
addRowBtn.addEventListener('click', () => {
    data.push({ month: 'New Month', activities: '', meetings: '', recruitment: '', progress: 'Not started' });
    save(); render();
    // focus the new row's first cell
    setTimeout(() => {
        const last = document.querySelectorAll('.cell')[(data.length - 1) * 5];
        if (last) last.focus();
    }, 100);
});

// Export CSV
function toCSV(arr) {
    const header = ['Month', 'Activities & Workshops', 'Meetings', 'Recruitment Methods', 'Progress'];
    const rows = arr.map(r => [r.month, r.activities, r.meetings, r.recruitment, r.progress]);
    const esc = v => '"' + String(v || '').replace(/"/g, '""') + '"';
    return [header.map(esc).join(','), ...rows.map(row => row.map(esc).join(','))].join('\n');
}

exportCSVBtn.addEventListener('click', () => {
    const csv = toCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'club_plan.csv'; a.click();
});

// Export JSON
exportJSONBtn.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'club_plan.json'; a.click();
});

// Import JSON
importBtn.addEventListener('click', () => imp.click());
imp.addEventListener('change', e => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader(); r.onload = () => {
        try {
            const parsed = JSON.parse(r.result);
            if (!Array.isArray(parsed)) throw new Error('JSON must be an array');
            data = parsed; save(); render(); alert('Imported successfully');
        } catch (err) { alert('Invalid JSON file'); }
    }; r.readAsText(f);
});

// Utilities
function escapeHtml(s) { return (s || '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;'); }

// Initialize
render();