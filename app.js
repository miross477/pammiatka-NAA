const ROOT = 'Main253Activity';
let routes = {};
let strings = {};
let current = ROOT;
let history = [];
let searchIndex = null;

const $ = id => document.getElementById(id);

function templateDate() {
  const now = new Date();
  const date = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(now);
  const time = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit', hour12: false }).format(now);
  return `${date} в ${time} час. на адрес Иванов И.И.`;
}

function value(raw = '') {
  if (!raw) return '';
  const match = raw.match(/^@string\/(.+)$/);
  const resolved = match ? (strings[match[1]] || match[1]) : raw.replace(/^@android:string\//, '');
  return resolved.replace(/\\n/g, '\n');
}

function resourceUrl(ref = '') {
  const match = ref.match(/^@(?:drawable|mipmap)\/(.+)$/);
  return match ? `assets/res/drawable/${match[1]}.png` : '';
}

function androidColor(value = '') {
  const colors = {
    '@android:color/holo_orange_light': '#ff9800',
    '@android:color/holo_orange_dark': '#e65100',
    '@android:color/holo_blue_dark': '#1565c0',
    '@android:color/holo_blue_light': '#039be5',
    '@android:color/holo_green_dark': '#2e7d32',
    '@android:color/holo_green_light': '#43a047',
    '@android:color/holo_red_dark': '#c62828',
    '@android:color/holo_red_light': '#e53935'
  };
  return colors[value] || (/^#[0-9a-f]{3,8}$/i.test(value) ? value : '');
}

function applyAndroidStyle(element, node) {
  const background = androidColor(node.getAttribute('android:background'));
  const color = androidColor(node.getAttribute('android:textColor'));
  if (background) element.style.backgroundColor = background;
  if (color) element.style.color = color;
  if (node.getAttribute('android:textStyle')?.includes('bold')) element.style.fontWeight = '700';
}

function childElements(node) {
  return [...node.children].filter(child => child.nodeType === 1);
}

function renderNode(node) {
  const tag = node.tagName.replace(/^.*:/, '');
  let text = value(node.getAttribute('android:text'));
  if (tag === 'Button') {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = text || 'Открыть';
    applyAndroidStyle(button, node);
    const actionText = text.toLowerCase();
    if (actionText.includes('фабула')) button.classList.add('action-fabula');
    else if (actionText.includes('пленум')) button.classList.add('action-plenum');
    else if (actionText.startsWith('гл.')) button.classList.add('action-chapter');
    else if (/^п\.\s*\d/.test(actionText)) button.classList.add('action-rule');
    const handler = node.getAttribute('android:onClick');
    const target = routes[current]?.handlers?.[handler];
    if (target && routes[target]) button.addEventListener('click', () => openScreen(target));
    else button.disabled = true;
    return button;
  }
  if (tag === 'TextView' || tag === 'CheckedTextView') {
    const isDateTemplate = node.getAttribute('android:id') === '@+id/dateTimeTextView';
    if (isDateTemplate) text = templateDate();
    if (text === 'Placeholder text') return document.createDocumentFragment();
    const title = node.getAttribute('android:textStyle') === 'bold' || node.getAttribute('android:textAppearance')?.includes('.Large') || node.getAttribute('android:textSize')?.includes('sp') && Number.parseInt(node.getAttribute('android:textSize')) >= 20;
    const element = document.createElement(title ? 'h2' : 'p');
    element.textContent = text;
    applyAndroidStyle(element, node);
    if (node.getAttribute('android:gravity')?.includes('center')) element.classList.add('centered');
    if (isDateTemplate) element.classList.add('template-date');
    return element;
  }
  if (tag === 'ImageView') {
    const src = resourceUrl(node.getAttribute('android:src'));
    if (!src) return document.createDocumentFragment();
    const image = document.createElement('img');
    image.src = src;
    image.alt = node.getAttribute('android:contentDescription') || '';
    return image;
  }
  if (tag === 'EditText') {
    const input = document.createElement('textarea');
    input.placeholder = value(node.getAttribute('android:hint'));
    return input;
  }
  const wrap = document.createElement('div');
  if ((tag === 'LinearLayout' && node.getAttribute('android:orientation') !== 'vertical') || tag === 'TableRow') wrap.className = 'row';
  childElements(node).forEach(child => wrap.append(renderNode(child)));
  return wrap;
}

async function getLayout(screen) {
  const layout = routes[screen]?.layout;
  if (!layout) throw new Error('Макет экрана не найден');
  const response = await fetch(`assets/res/layout/${layout}.xml`);
  if (!response.ok) throw new Error('Не удалось загрузить экран');
  return new DOMParser().parseFromString(await response.text(), 'application/xml').documentElement;
}

async function openScreen(screen, addHistory = true) {
  if (!routes[screen]) return;
  if (addHistory && current !== screen) history.push(current);
  current = screen;
  location.hash = encodeURIComponent(screen);
  $('screen').replaceChildren(Object.assign(document.createElement('p'), { className: 'loading', textContent: 'Загрузка…' }));
  try {
    const layout = await getLayout(screen);
    const container = document.createElement('div');
    container.className = 'android-layout';
    container.append(renderNode(layout));
    $('screen').replaceChildren(container);
    $('title').textContent = 'Памятка ДПС';
    $('back').disabled = history.length === 0;
  } catch (error) {
    $('screen').replaceChildren(Object.assign(document.createElement('p'), { className: 'empty', textContent: error.message }));
  }
}

async function buildSearchIndex() {
  if (searchIndex) return searchIndex;
  const entries = await Promise.all(Object.entries(routes).map(async ([screen, info]) => {
    try {
      const response = await fetch(`assets/res/layout/${info.layout}.xml`);
      const xml = new DOMParser().parseFromString(await response.text(), 'application/xml');
      const content = [...xml.querySelectorAll('*')]
        .map(node => value(node.getAttribute('android:text')))
        .filter(Boolean)
        .join(' ');
      return { screen, text: content.toLowerCase(), label: content.split(/\n|  +/)[0].slice(0, 110) || info.layout };
    } catch { return { screen, text: '', label: info.layout }; }
  }));
  return searchIndex = entries;
}

async function search(query) {
  const out = $('search-results');
  query = query.trim().toLowerCase();
  if (query.length < 2) { out.hidden = true; out.replaceChildren(); return; }
  out.hidden = false;
  out.replaceChildren(Object.assign(document.createElement('p'), { className: 'loading', textContent: 'Ищем…' }));
  const found = (await buildSearchIndex()).filter(item => item.text.includes(query)).slice(0, 30);
  out.replaceChildren(...(found.length ? found.map(item => {
    const button = document.createElement('button');
    button.className = 'search-item';
    button.textContent = item.label;
    button.addEventListener('click', () => { $('search').value = ''; out.hidden = true; openScreen(item.screen); });
    return button;
  }) : [Object.assign(document.createElement('p'), { className: 'empty', textContent: 'Совпадений не найдено' })]));
}

async function init() {
  const [routeData, stringXml] = await Promise.all([fetch('data/routes.json').then(r => r.json()), fetch('data/strings.xml').then(r => r.text())]);
  routes = routeData;
  const doc = new DOMParser().parseFromString(stringXml, 'application/xml');
  doc.querySelectorAll('string').forEach(node => strings[node.getAttribute('name')] = node.textContent || '');
  $('back').addEventListener('click', () => { if (history.length) openScreen(history.pop(), false); });
  $('home').addEventListener('click', () => { history = []; openScreen(ROOT, false); });
  $('search').addEventListener('input', event => search(event.target.value));
  window.addEventListener('hashchange', () => {
    const requested = decodeURIComponent(location.hash.slice(1));
    if (routes[requested] && requested !== current) {
      history.push(current);
      openScreen(requested, false);
    }
  });
  const requested = decodeURIComponent(location.hash.slice(1));
  openScreen(routes[requested] ? requested : ROOT, false);
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
}
init().catch(error => $('screen').textContent = `Ошибка загрузки: ${error.message}`);
