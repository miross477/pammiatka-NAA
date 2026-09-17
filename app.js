const ROOT = 'Main253Activity';
let routes = {};
let strings = {};
let arrays = {};
let styledRuns = {};
let externalLinks = {};
let current = ROOT;
let history = [];
let searchIndex = null;

// A few Android activities populate an otherwise empty TextView in Java code.
// Keep those assignments here so the corresponding PWA screens are not blank.
const programmaticStrings = {
  Main145Activity: { textView119: 'fabul69' },
  Main124Activity: { textView101: 'fabul56' },
  Main47Activity: { textView49: 'fabul15' },
  Main288Activity: { textView300: 'fabtah11' },
  Main2Activity: { textView2: 'koap1', textView3: 'koap2', textView4: 'koap3' }
};

// These Android screens fill a ListView from a string-array in Java rather
// than declaring its rows in XML.  Recreate the list and its item routes.
const programmaticLists = {
  Main10Activity: {
    tonir1: {
      array: 'tonir_name',
      screens: ['Main11Activity', 'Main12Activity', 'Main13Activity', 'Main14Activity', 'Main15Activity']
    }
  },
  Main257Activity: {
    perneis1: {
      array: 'pernes_name',
      screens: ['Main258Activity', 'Main259Activity', 'Main260Activity', 'Main261Activity', 'Main262Activity', 'Main263Activity', 'Main264Activity', 'Main450Activity', 'Main451Activity', 'Main452Activity', 'Main453Activity']
    }
  },
  Main400Activity: {
    lview: {
      array: 'npa_name',
      screens: ['Main401Activity', 'Main402Activity', 'Main403Activity', 'Main24_1Activity', 'Main255Activity', 'Main9Activity', 'Main10Activity', 'Main500Activity', 'Main502Activity', 'Main254Activity']
    }
  },
  Main401Activity: {
    lview1: {
      array: 'koap_name',
      screens: ['Main410Activity', 'Main411Activity', 'Main412Activity', 'Main413Activity', 'Main414Activity', 'Main415Activity', 'Main16Activity', 'Main416Activity', 'Main417Activity', 'Main418Activity', 'Main419Activity', 'Main420Activity', 'Main421Activity', 'Main422Activity', 'Main423Activity', 'Main303Activity', 'Main424Activity', 'Main425Activity', 'Main426Activity', 'Main427Activity', 'Main428Activity', 'Main429Activity', 'Main430Activity', 'Main431Activity', 'Main432Activity', 'Main433Activity', 'Main434Activity']
    }
  },
  Main402Activity: {
    lview2: {
      array: 'polis_name',
      screens: ['Main461Activity', 'Main17Activity', 'Main256Activity', 'Main299Activity', 'Main458Activity', 'Main435Activity', 'Main436Activity', 'Main437Activity', 'Main438Activity', 'Main439Activity', 'Main440Activity']
    }
  },
  Main403Activity: {
    lview3: {
      array: 'nastav_name',
      screens: ['Main441Activity', 'Main442Activity', 'Main443Activity', 'Main444Activity', 'Main445Activity', 'Main446Activity', 'Main447Activity', 'Main448Activity', 'Main449Activity']
    }
  }
};

// Main304Activity attaches its MediaPlayer listeners in Java, not XML.
// The browser uses the same four bundled recordings and preserves a paused
// recording's position when PLAY is pressed again.
const programmaticAudio = {
  Main304Activity: {
    play: { file: 'konstit.mp3', action: 'play' },
    pause: { file: 'konstit.mp3', action: 'pause' },
    play1: { file: 'narushit.mp3', action: 'play' },
    pause1: { file: 'narushit.mp3', action: 'pause' },
    play2: { file: 'svidetel.mp3', action: 'play' },
    pause2: { file: 'svidetel.mp3', action: 'pause' },
    play3: { file: 'poniatoy.mp3', action: 'play' },
    pause3: { file: 'poniatoy.mp3', action: 'pause' }
  }
};
const audioPlayers = new Map();

// Non-working weekdays from the calendar embedded in Main468Activity.
const nonWorkingWeekdays = new Set('01.01.2024,01.01.2025,01.01.2026,01.05.2023,01.05.2024,01.05.2025,01.05.2026,02.01.2024,02.01.2025,02.01.2026,02.05.2025,03.01.2024,03.01.2025,03.11.2025,04.01.2024,04.11.2024,04.11.2025,04.11.2026,05.01.2024,05.01.2026,06.01.2025,06.01.2026,06.11.2023,07.01.2025,07.01.2026,08.01.2024,08.01.2025,08.01.2026,08.03.2024,08.05.2023,08.05.2025,09.01.2026,09.03.2026,09.05.2023,09.05.2024,09.05.2025,10.05.2024,11.05.2026,12.06.2023,12.06.2024,12.06.2025,12.06.2026,13.06.2025,23.02.2024,23.02.2026,29.04.2024,30.04.2024,30.12.2024,31.12.2024,31.12.2025,31.12.2026'.split(','));

function audioPlayer(file) {
  if (!audioPlayers.has(file)) audioPlayers.set(file, new Audio(`assets/res/raw/${file}`));
  return audioPlayers.get(file);
}

const $ = id => document.getElementById(id);

function templateDate() {
  const now = new Date();
  const date = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(now);
  const time = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit', hour12: false }).format(now);
  return `${date} в ${time} час. на адрес Иванов И.И.`;
}

function value(raw = '') {
  raw ||= '';
  if (!raw) return '';
  const match = raw.match(/^@string\/(.+)$/);
  const resolved = match ? (strings[match[1]] || match[1]) : raw.replace(/^@android:string\//, '');
  return resolved.replace(/\\n/g, '\n');
}

function setStyledText(element, text, runs) {
  let position = 0;
  for (const run of runs) {
    if (run.start < position || run.end > text.length) continue;
    element.append(document.createTextNode(text.slice(position, run.start)));
    const styled = document.createElement(run.bold ? 'strong' : 'span');
    styled.textContent = text.slice(run.start, run.end);
    if (run.italic) styled.style.fontStyle = 'italic';
    if (run.underline) styled.style.textDecoration = 'underline';
    element.append(styled);
    position = run.end;
  }
  element.append(document.createTextNode(text.slice(position)));
}

function hasInlineMarkup(text) {
  return /<\/?(?:b|strong|i|em|u|br)\s*\/?\s*>/i.test(text);
}

function setInlineMarkup(element, text) {
  const source = new DOMParser().parseFromString(text, 'text/html').body;
  const append = (from, to) => {
    from.childNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        to.append(document.createTextNode(node.textContent));
        return;
      }
      const tag = node.tagName.toLowerCase();
      if (tag === 'br') {
        to.append(document.createElement('br'));
        return;
      }
      const mappedTag = tag === 'b' || tag === 'strong' ? 'strong' : tag === 'i' || tag === 'em' ? 'em' : 'span';
      const styled = document.createElement(mappedTag);
      if (tag === 'u') styled.style.textDecoration = 'underline';
      append(node, styled);
      to.append(styled);
    });
  };
  append(source, element);
}

function setFormattedText(element, text, stringKey) {
  if (styledRuns[stringKey]?.length) {
    setStyledText(element, text, styledRuns[stringKey]);
    return;
  }
  if (hasInlineMarkup(text)) {
    setInlineMarkup(element, text);
    return;
  }
  const pattern = /(Штраф\s+[\d\s]+)(\s*\([^)]*\))?(\s+руб\.)|марка,модель|номер|будучи не пристегнутым|\(пристегнута только грудная клетка и не пристегнута брюшная полость\)|в трех точках|перевозил пассажира(?=, не пристегнутого)|мопедом|без мотошлема|\(в незастегнутом мотошлеме\)|Уполномоченные лица:/gi;
  let position = 0;
  for (const match of text.matchAll(pattern)) {
    element.append(document.createTextNode(text.slice(position, match.index)));
    const matchedText = match[0];
    if (match[1]) {
      const amount = document.createElement('strong');
      amount.textContent = match[1];
      element.append(amount);
      if (match[2]) element.append(document.createTextNode(match[2]));
      const currency = document.createElement('strong');
      currency.textContent = match[3];
      element.append(currency);
    } else {
      const normalized = matchedText.toLowerCase();
      const isItalic = normalized === 'марка,модель' || normalized === 'номер' || normalized === '(в незастегнутом мотошлеме)';
      const emphasis = document.createElement(isItalic ? 'em' : 'strong');
      emphasis.textContent = matchedText;
      if (normalized === 'марка,модель' || normalized === 'номер' || normalized === 'уполномоченные лица:') {
        emphasis.style.textDecoration = 'underline';
      }
      if (normalized === 'марка,модель' || normalized === 'номер') emphasis.style.fontStyle = 'italic';
      element.append(emphasis);
    }
    position = match.index + match[0].length;
  }
  element.append(document.createTextNode(text.slice(position)));
}

function resourceUrl(ref = '') {
  ref ||= '';
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
    '@android:color/holo_red_light': '#e53935',
    '@color/colorPrimary': '#7e8dde',
    '@color/colorPrimaryDark': '#303f9f',
    '@color/colorAccent': '#303f9f'
  };
  return colors[value] || (/^#[0-9a-f]{3,8}$/i.test(value) ? value : '');
}

function applyAndroidStyle(element, node) {
  const background = androidColor(node.getAttribute('android:background'));
  const color = androidColor(node.getAttribute('android:textColor'));
  if (background) element.style.backgroundColor = background;
  if (color) element.style.color = color;
  if (node.getAttribute('android:textStyle')?.includes('bold')) element.style.fontWeight = '700';
  if (node.getAttribute('android:textStyle')?.includes('italic')) element.style.fontStyle = 'italic';
  if (node.getAttribute('android:textAppearance')?.includes('.Body2')) element.style.fontWeight = '700';
  const weight = Number(node.getAttribute('android:layout_weight'));
  if (weight > 0) element.style.flexGrow = String(weight);
}

function applyAndroidId(element, node) {
  const id = androidId(node.getAttribute('android:id'));
  if (id) element.dataset.androidId = id;
  return element;
}

function childElements(node) {
  return [...node.children].filter(child => child.nodeType === 1);
}

function androidId(reference) {
  return reference?.replace(/^@\+?id\//, '');
}

function relativeLayoutGroups(children) {
  const parent = children.map((_, index) => index);
  const find = index => parent[index] === index ? index : (parent[index] = find(parent[index]));
  const join = (left, right) => {
    const leftRoot = find(left);
    const rightRoot = find(right);
    if (leftRoot !== rightRoot) parent[rightRoot] = leftRoot;
  };
  const indexById = new Map();
  children.forEach((child, index) => {
    const id = androidId(child.getAttribute('android:id'));
    if (id) indexById.set(id, index);
  });

  // Elements are on the same Android "line" only if they explicitly share a
  // top/bottom edge, or are both placed below the same element.  This avoids
  // treating a text block referring to an older button as a neighbouring cell.
  children.forEach((child, index) => {
    ['android:layout_alignTop', 'android:layout_alignBottom', 'android:layout_alignBaseline'].forEach(attribute => {
      const target = indexById.get(androidId(child.getAttribute(attribute)));
      if (target !== undefined) join(index, target);
    });
    ['android:layout_toLeftOf', 'android:layout_toStartOf', 'android:layout_toRightOf', 'android:layout_toEndOf'].forEach(attribute => {
      const target = indexById.get(androidId(child.getAttribute(attribute)));
      if (target === undefined) return;
      const below = androidId(child.getAttribute('android:layout_below'));
      const targetBelow = androidId(children[target].getAttribute('android:layout_below'));
      if (below && below === targetBelow) join(index, target);
    });
  });

  const groups = new Map();
  children.forEach((child, index) => {
    const root = find(index);
    if (!groups.has(root)) groups.set(root, { members: [], dependsOn: new Set() });
    groups.get(root).members.push(index);
  });
  children.forEach((child, index) => {
    const target = indexById.get(androidId(child.getAttribute('android:layout_below')));
    if (target === undefined) return;
    const from = find(index);
    const to = find(target);
    if (from !== to) groups.get(from).dependsOn.add(to);
  });

  const ordered = [];
  const pending = new Map([...groups].map(([root, group]) => [root, new Set(group.dependsOn)]));
  while (pending.size) {
    const ready = [...pending.entries()]
      .filter(([, dependencies]) => dependencies.size === 0)
      .map(([root]) => root)
      .sort((left, right) => groups.get(left).members[0] - groups.get(right).members[0]);
    const next = ready[0] ?? [...pending.keys()].sort((left, right) => groups.get(left).members[0] - groups.get(right).members[0])[0];
    ordered.push(groups.get(next).members);
    pending.delete(next);
    pending.forEach(dependencies => dependencies.delete(next));
  }
  return ordered;
}

function renderNode(node) {
  const tag = node.tagName.replace(/^.*:/, '');
  if (node.getAttribute('android:visibility') === 'gone') return document.createDocumentFragment();
  let rawText = node.getAttribute('android:text') || '';
  let stringKey = rawText.match(/^@string\/(.+)$/)?.[1];
  const injectedKey = programmaticStrings[current]?.[androidId(node.getAttribute('android:id'))];
  if (!rawText && injectedKey) {
    rawText = `@string/${injectedKey}`;
    stringKey = injectedKey;
  }
  let text = value(rawText);
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
    const externalUrl = externalLinks[current]?.buttons?.[androidId(node.getAttribute('android:id'))] || externalLinks[current]?.handlers?.[handler];
    const audioAction = programmaticAudio[current]?.[androidId(node.getAttribute('android:id'))];
    const programmaticButton = (current === 'Main468Activity' || current === 'Main485Activity') && androidId(node.getAttribute('android:id')) === 'calculateButton';
    if (audioAction) button.addEventListener('click', () => {
      const player = audioPlayer(audioAction.file);
      if (audioAction.action === 'play') player.play().catch(() => {});
      else player.pause();
    });
    else if (externalUrl) button.addEventListener('click', () => window.open(externalUrl, '_blank', 'noopener'));
    else if (target && routes[target]) button.addEventListener('click', () => openScreen(target));
    else if (!programmaticButton) button.disabled = true;
    return applyAndroidId(button, node);
  }
  if (tag === 'TextView' || tag === 'CheckedTextView') {
    const isDateTemplate = node.getAttribute('android:id') === '@+id/dateTimeTextView';
    if (isDateTemplate) text = templateDate();
    if (text === 'Placeholder text') return document.createDocumentFragment();
    const title = node.getAttribute('android:textStyle') === 'bold' || node.getAttribute('android:textAppearance')?.includes('.Large') || node.getAttribute('android:textSize')?.includes('sp') && Number.parseInt(node.getAttribute('android:textSize')) >= 20;
    const element = document.createElement(title ? 'h2' : 'p');
    setFormattedText(element, text, stringKey);
    applyAndroidStyle(element, node);
    if (styledRuns[stringKey]?.length || hasInlineMarkup(text)) {
      element.style.fontWeight = '400';
    }
    if (node.getAttribute('android:gravity')?.includes('center')) element.classList.add('centered');
    if (isDateTemplate) element.classList.add('template-date');
    return applyAndroidId(element, node);
  }
  if (tag === 'ImageView') {
    const src = resourceUrl(node.getAttribute('android:src') || node.getAttribute('app:srcCompat'));
    if (!src) return document.createDocumentFragment();
    const image = document.createElement('img');
    image.src = src;
    const imageSources = [src, src.replace('.png', '.jpg'), src.replace('/drawable/', '/drawable-nodpi/'), src.replace('/drawable/', '/drawable-nodpi/').replace('.png', '.jpg')];
    image.addEventListener('error', () => {
      const next = Number(image.dataset.fallbackIndex || 0) + 1;
      if (next >= imageSources.length) return;
      image.dataset.fallbackIndex = String(next);
      image.src = imageSources[next];
    });
    image.alt = node.getAttribute('android:contentDescription') || '';
    return applyAndroidId(image, node);
  }
  if (tag === 'EditText') {
    const editId = androidId(node.getAttribute('android:id'));
    const isDateInput = editId === 'dateInput' && (current === 'Main468Activity' || current === 'Main485Activity');
    const input = document.createElement(isDateInput || (current === 'Main485Activity' && editId === 'monthsInput') ? 'input' : 'textarea');
    if (input instanceof HTMLInputElement) input.type = current === 'Main485Activity' && editId === 'monthsInput' ? 'number' : 'date';
    input.placeholder = value(node.getAttribute('android:hint'));
    return applyAndroidId(input, node);
  }
  if (tag === 'RadioButton' || tag === 'Switch') {
    const label = document.createElement('label');
    label.className = tag === 'Switch' ? 'android-switch' : 'android-radio';
    const input = document.createElement('input');
    input.type = tag === 'Switch' ? 'checkbox' : 'radio';
    if (tag === 'RadioButton') input.name = `radio-${current}`;
    input.checked = node.getAttribute('android:checked') === 'true';
    applyAndroidId(input, node);
    const caption = document.createElement('span');
    caption.textContent = text;
    applyAndroidStyle(caption, node);
    label.append(input, caption);
    return label;
  }
  if (tag === 'ProgressBar') {
    const progress = document.createElement('div');
    progress.className = 'android-progress';
    return applyAndroidId(progress, node);
  }
  if (tag === 'ListView') {
    const definition = programmaticLists[current]?.[androidId(node.getAttribute('android:id'))];
    if (!definition) return document.createDocumentFragment();
    const list = document.createElement('div');
    list.className = 'android-list';
    (arrays[definition.array] || []).forEach((label, index) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'android-list-item';
      item.textContent = label;
      const target = definition.screens[index];
      if (target && routes[target]) item.addEventListener('click', () => openScreen(target));
      else item.disabled = true;
      list.append(item);
    });
    return list;
  }
  const wrap = document.createElement('div');
  if (tag === 'RelativeLayout') {
    wrap.className = 'relative-layout';
    const children = childElements(node);
    relativeLayoutGroups(children).forEach(indices => {
      if (indices.length === 2 && indices.every(index => children[index].tagName.replace(/^.*:/, '') === 'Button')) {
        const pair = document.createElement('div');
        pair.className = 'relative-button-pair';
        indices.forEach(index => pair.append(renderNode(children[index])));
        wrap.append(pair);
      } else {
        indices.forEach(index => wrap.append(renderNode(children[index])));
      }
    });
    return wrap;
  }
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

function screenElement(container, id) {
  return container.querySelector(`[data-android-id="${id}"]`);
}

function formatDate(date) {
  return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function nextWorkingDay(date) {
  const result = new Date(date);
  while (result.getDay() === 0 || result.getDay() === 6 || nonWorkingWeekdays.has(formatDate(result))) result.setDate(result.getDate() + 1);
  return result;
}

function initDeadlineCalculator(container) {
  const modeCopy = screenElement(container, 'modeCopyReceived');
  const dateInput = screenElement(container, 'dateInput');
  const calculate = screenElement(container, 'calculateButton');
  const labelForce = screenElement(container, 'labelEnterForce');
  const resultForce = screenElement(container, 'resultEnterForce');
  const resultPay = screenElement(container, 'resultPayPeriod');
  const result2025 = screenElement(container, 'resultArt2025Period');
  const updateMode = () => {
    const copyReceived = modeCopy.checked;
    dateInput.title = copyReceived ? 'Дата постановления (получения копии)' : 'Дата вступления в законную силу';
    labelForce.hidden = !copyReceived;
    resultForce.hidden = !copyReceived;
    resultForce.textContent = '';
    resultPay.textContent = '';
    result2025.textContent = '';
    result2025.style.color = '';
  };
  modeCopy.addEventListener('change', updateMode);
  screenElement(container, 'modeEnterForce').addEventListener('change', updateMode);
  calculate.addEventListener('click', () => {
    if (!dateInput.value) return;
    const [year, month, day] = dateInput.value.split('-').map(Number);
    const source = new Date(year, month - 1, day);
    let effective = source;
    if (modeCopy.checked) {
      effective = nextWorkingDay(addDays(source, 10));
      resultForce.textContent = formatDate(addDays(effective, 1));
    }
    const payStart = addDays(effective, 1);
    const payEnd = nextWorkingDay(addDays(effective, 60));
    resultPay.textContent = `${formatDate(payStart)} - ${formatDate(payEnd)}`;
    const articleStart = addDays(payEnd, 1);
    const articleEnd = new Date(articleStart);
    articleEnd.setFullYear(articleEnd.getFullYear() + 1);
    result2025.textContent = `с ${formatDate(articleStart)} по ${formatDate(articleEnd)}`;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    result2025.style.color = today >= articleStart && today <= articleEnd ? '#d50000' : '';
  });
  updateMode();
}

function initQualificationSelector(container) {
  const ids = ['switch1', 'switch2', 'switch3', 'switch4', 'switch5', 'switch6', 'switch7', 'switch8', 'switch9', 'switch10'];
  const controls = Object.fromEntries(ids.map(id => [id, screenElement(container, id)]));
  const result = screenElement(container, 'resultLabel');
  const conflicts = {
    switch1: ['switch2', 'switch3', 'switch5', 'switch10'],
    switch2: ['switch1', 'switch3', 'switch4', 'switch6', 'switch7'],
    switch3: ['switch1', 'switch2', 'switch4', 'switch5', 'switch6', 'switch7', 'switch8', 'switch10'],
    switch4: ['switch2', 'switch3', 'switch5', 'switch6', 'switch7', 'switch8', 'switch9', 'switch10'],
    switch5: ['switch1', 'switch3', 'switch4', 'switch6', 'switch7', 'switch8', 'switch9', 'switch10'],
    switch6: ['switch2', 'switch3', 'switch4', 'switch5', 'switch7', 'switch8', 'switch9', 'switch10'],
    switch7: ['switch2', 'switch3', 'switch4', 'switch5', 'switch6', 'switch8', 'switch9', 'switch10'],
    switch8: ['switch3', 'switch4', 'switch5', 'switch6', 'switch7', 'switch9', 'switch10'],
    switch9: ['switch4', 'switch5', 'switch6', 'switch7', 'switch8', 'switch10'],
    switch10: ['switch1', 'switch3', 'switch4', 'switch5', 'switch6', 'switch7', 'switch8', 'switch9']
  };
  const update = () => {
    Object.values(controls).forEach(control => { control.disabled = false; });
    const selected = ids.filter(id => controls[id].checked);
    selected.forEach(id => conflicts[id].forEach(conflict => { if (!controls[conflict].checked) controls[conflict].disabled = true; }));
    if (selected.length > 2) selected.slice(2).forEach(id => { controls[id].disabled = true; });
    const has = id => controls[id].checked;
    let text = selected.length === 1 ? 'Выберите еще параметр' : 'Ничего не выбрано';
    if (has('switch1') && has('switch4')) text = 'ч. 1 ст. 264.1 УК РФ';
    else if (has('switch1') && has('switch6')) text = 'ч. 1 ст. 264.1 УК и ч. 1 ст. 12.7 КоАП';
    else if (has('switch1') && has('switch7')) text = 'ч. 1 ст. 264.1 УК и ч. 2 ст. 12.7 КоАП';
    else if (has('switch1') && has('switch8')) text = 'ч. 1 ст. 264.1 УК и ч. 4 ст. 12.7 КоАП';
    else if (has('switch1') && has('switch9')) text = 'ч. 1 ст. 264.1 УК и ч. 1 ст. 264.3 УК';
    else if (has('switch2') && has('switch5')) text = 'ч. 2 ст. 264.1 УК РФ';
    else if (has('switch2') && has('switch8')) text = 'ч. 2 ст. 264.1 УК и ч. 4 ст. 12.7 КоАП';
    else if (has('switch2') && has('switch9')) text = 'ч. 2 ст. 264.1 УК и ч. 1 ст. 264.3 УК';
    else if (has('switch2') && has('switch10')) text = 'ч. 2 ст. 264.1 УК и ч. 2 ст. 264.3 УК';
    else if (has('switch3') && has('switch9')) text = 'ч.3 ст.12.8/ч.2 ст.12.26 КоАП и ч.1 ст. 264.3 УК';
    result.textContent = text;
    result.style.fontWeight = '700';
  };
  Object.values(controls).forEach(control => control.addEventListener('change', update));
  update();
}

function initDisqualificationTermCalculator(container) {
  const dateInput = screenElement(container, 'dateInput');
  const monthsInput = screenElement(container, 'monthsInput');
  const calculate = screenElement(container, 'calculateButton');
  const result = screenElement(container, 'resultText');
  calculate.addEventListener('click', () => {
    if (!dateInput.value) {
      result.style.color = '#d50000';
      result.textContent = 'Не выбрана дата!';
      return;
    }
    if (!monthsInput.value.trim()) {
      result.style.color = '#d50000';
      result.textContent = 'Введите количество месяцев!';
      return;
    }
    const months = Number.parseInt(monthsInput.value, 10);
    if (!Number.isFinite(months)) {
      result.style.color = '#d50000';
      result.textContent = 'Некорректное число месяцев!';
      return;
    }
    const [year, month, day] = dateInput.value.split('-').map(Number);
    const end = new Date(year, month - 1, day);
    end.setMonth(end.getMonth() + months);
    result.style.color = end <= new Date() ? '#000' : '#d50000';
    result.textContent = `до ${formatDate(end)}`;
  });
}

function initializeScreen(screen, container) {
  if (screen === 'Main468Activity') initDeadlineCalculator(container);
  if (screen === 'Main469Activity') initQualificationSelector(container);
  if (screen === 'Main485Activity') initDisqualificationTermCalculator(container);
}

async function openScreen(screen, addHistory = true) {
  if (!routes[screen]) return;
  if (addHistory && current !== screen) history.push(current);
  current = screen;
  document.body.classList.toggle('home-screen', screen === ROOT);
  location.hash = encodeURIComponent(screen);
  $('screen').replaceChildren(Object.assign(document.createElement('p'), { className: 'loading', textContent: 'Загрузка…' }));
  try {
    const layout = await getLayout(screen);
    const container = document.createElement('div');
    container.className = 'android-layout';
    container.append(renderNode(layout));
    initializeScreen(screen, container);
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
  const [routeData, stringXml, arraysXml, styleData, linkData] = await Promise.all([
    fetch('data/routes.json').then(r => r.json()),
    fetch('data/strings.xml').then(r => r.text()),
    fetch('assets/res/values/arrays.xml').then(r => r.text()),
    fetch('data/styled-runs.json').then(r => r.json()).catch(() => ({})),
    fetch('data/external-links.json').then(r => r.json()).catch(() => ({}))
  ]);
  routes = routeData;
  styledRuns = styleData;
  externalLinks = linkData;
  const doc = new DOMParser().parseFromString(stringXml, 'application/xml');
  doc.querySelectorAll('string').forEach(node => strings[node.getAttribute('name')] = node.textContent || '');
  const arraysDoc = new DOMParser().parseFromString(arraysXml, 'application/xml');
  arraysDoc.querySelectorAll('string-array, array').forEach(node => {
    arrays[node.getAttribute('name')] = [...node.querySelectorAll('item')].map(item => item.textContent || '');
  });
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
  if ('serviceWorker' in navigator) {
    let reloadedForUpdate = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!reloadedForUpdate) {
        reloadedForUpdate = true;
        window.location.reload();
      }
    });
    navigator.serviceWorker.register('sw.js').then(registration => registration.update());
  }
}
init().catch(error => $('screen').textContent = `Ошибка загрузки: ${error.message}`);
