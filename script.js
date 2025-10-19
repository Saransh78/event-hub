const els = {
  grid: document.getElementById('grid'),
  empty: document.getElementById('empty'),
  search: document.getElementById('search'),
  category: document.getElementById('category'),
  sort: document.getElementById('sort')
};

let EVENTS = [];

function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function daysAway(iso) {
  const ms = new Date(iso) - Date.now();
  const days = Math.ceil(ms / (1000*60*60*24));
  if (days <= 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
}

function render(list) {
  els.grid.innerHTML = '';
  if (!list.length) { els.empty.classList.remove('hidden'); return; }
  els.empty.classList.add('hidden');

  for (const e of list) {
    const card = document.createElement('article');
    card.className = 'card';

    card.innerHTML = `
      <div class="badges">
        <span class="badge">${e.category}</span>
        <span class="badge">${e.club}</span>
        <span class="badge">${daysAway(e.datetime)}</span>
      </div>
      <h3 class="title" title="${e.title}">${e.title}</h3>
      ${e.description ? `<p class="desc">${e.description}</p>` : ``}
      <div class="meta">
        <div>📅 ${fmtDate(e.datetime)}</div>
        <div>📍 ${e.venue}</div>
      </div>
      ${e.regLink ? `
        <a class="btn" href="${e.regLink}" target="_blank" rel="noreferrer">
          Register Now →
        </a>` : ``}
    `;
    els.grid.appendChild(card);
  }
}

function applyFilters() {
  const q = els.search.value.trim().toLowerCase();
  const cat = els.category.value;
  const sort = els.sort.value;

  let list = EVENTS.filter(e => {
    const text = [e.title, e.club, e.description, e.venue].join(' ').toLowerCase();
    const okText = !q || text.includes(q);
    const okCat = cat === 'All' || e.category === cat;
    return okText && okCat;
  });

  list.sort((a,b) => {
    if (sort === 'soon') return new Date(a.datetime) - new Date(b.datetime);
    if (sort === 'new')  return new Date(b.datetime) - new Date(a.datetime);
    return 0;
  });

  render(list);
}

async function boot() {
  try {
    const res = await fetch('events.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to load events.json');
    EVENTS = await res.json();
    applyFilters();

    els.search.addEventListener('input', applyFilters);
    els.category.addEventListener('change', applyFilters);
    els.sort.addEventListener('change', applyFilters);
  } catch (err) {
    console.error(err);
    els.empty.textContent = 'Could not load events.';
    els.empty.classList.remove('hidden');
  }
}

boot();
