const STORAGE_KEY = 'fubon-star-learning-v2';

const fieldIds = [
  'baselineGoal',
  'baselineExcuse',
  'contactPerson',
  'contactReason',
  'contactBenefit',
  'monthTheme',
  'monthTarget',
  'monthValue',
  'socialTopic',
  'socialView',
  'setbackNow',
  'setbackAction',
  'finalStandard',
  'finalPeople',
  'finalReminder'
];

let saveTimer;

function $(id) {
  return document.getElementById(id);
}

function valueOf(id) {
  return $(id)?.value.trim() || '';
}

function esc(text) {
  return (text || '').replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
}

function showToast(message) {
  const toast = $('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 1800);
}

function buildBaseline() {
  const goal = valueOf('baselineGoal') || '尚未填寫';
  const excuse = valueOf('baselineExcuse') || '尚未填寫';
  $('baselineOutput').textContent = `我的低標：${goal}

放過自己的理由：${excuse}

下一步：今天先做一個有效接觸。低標不是上限，是每月最低動作量。`;
  saveState();
  updateProgress();
  showToast('已整理起點');
}

function checkedRecognition() {
  return [...document.querySelectorAll('.recognition-check')]
    .filter(input => input.checked)
    .map(input => input.value);
}

function buildRecognition() {
  const checked = checkedRecognition();
  const missing = [...document.querySelectorAll('.recognition-check')]
    .filter(input => !input.checked)
    .map(input => input.value);
  $('recognitionOutput').textContent = `我目前做得到：
${checked.length ? checked.map((item, i) => `${i + 1}. ${item}`).join('\n') : '尚未勾選'}

待補強：
${missing.length ? missing.map((item, i) => `${i + 1}. ${item}`).join('\n') : '目前認同鏈完整，接下來要穩定重複。'}

提醒：先讓人認同你，再讓觀念通，保險才有位置。`;
  saveState();
  updateProgress();
  showToast('已整理認同鏈');
}

function buildAppointment() {
  const person = valueOf('contactPerson') || '這位對象';
  const reason = valueOf('contactReason') || '服務';
  const benefit = valueOf('contactBenefit') || '對他有幫助的價值';
  $('appointmentOutput').textContent = `邀約稿：

「我想用${reason}幫你${benefit}。約 30 分鐘，只做這件事，不臨時推銷。」

對象：${person}
重點：目的先講清楚，對方才有安全感。`;
  saveState();
  updateProgress();
  showToast('已產生邀約稿');
}

function buildPool() {
  const theme = valueOf('monthTheme') || '尚未填寫';
  const target = valueOf('monthTarget') || '尚未填寫';
  const value = valueOf('monthValue') || '尚未填寫';
  $('poolOutput').textContent = `本月水池：

主題：${theme}
適合接觸：${target}
我提供的價值：${value}

3 步驟：
1. 先列出 10 位符合主題的人。
2. 每天接觸 2 位，帶著明確理由。
3. 記錄反應、下次話題與服務機會。

提醒：水池不是等人出現，是每月主動設計入口。`;
  saveState();
  updateProgress();
  showToast('已整理水池');
}

function buildSocial() {
  const topic = valueOf('socialTopic') || '尚未填寫';
  const view = valueOf('socialView') || '尚未填寫';
  $('socialOutput').textContent = `社群草稿：

今天看到「${topic}」，我想到一件事：${view}

很多人以為保險是等需要時才處理。真正重要的是，在健康、時間和選擇權還在時，先看清風險位置。

這不是恐嚇，是我做這份工作後更相信的事：先把底守住，投資與人生選擇才有空間。`;
  saveState();
  updateProgress();
  showToast('已產生社群草稿');
}

function buildSetback() {
  const setback = valueOf('setbackNow') || '尚未填寫';
  const action = valueOf('setbackAction') || '尚未填寫';
  $('setbackOutput').textContent = `目前挫折：
${setback}

下一個可控制動作：
${action}

復原提醒：可以難過，但不要停太久。休息就休息；工作就做下一步。`;
  saveState();
  updateProgress();
  showToast('已整理復原策略');
}

function buildFinalPlan() {
  const standard = valueOf('finalStandard') || '尚未填寫';
  const people = valueOf('finalPeople') || '尚未填寫';
  const reminder = valueOf('finalReminder') || '尚未填寫';
  $('finalOutput').textContent = `我的富邦之星本週行動稿

一、本週低標
${standard}

二、我要立刻接觸的 5 個人
${people}

三、我的約訪原則
約什麼，就做什麼。讓對方先有心理準備，也讓他看見對自己有利的點。

四、我的水池入口
${$('poolOutput').textContent.includes('本月水池') ? $('poolOutput').textContent : '水池規劃尚未完成'}

五、我的社群立場
${$('socialOutput').textContent.includes('社群草稿') ? $('socialOutput').textContent : '社群練習尚未完成'}

六、本週提醒
${reminder}

提醒：富邦之星不是追一個獎項，而是把活動量、認同、服務和接觸變成每月可重複的系統。`;
  saveState();
  updateProgress();
  showToast('已生成行動稿');
}

function progressItems() {
  return [
    { label: '完成低標與藉口盤點', done: valueOf('baselineGoal') && $('baselineOutput').textContent.includes('我的低標') },
    { label: '完成認同鏈檢核', done: checkedRecognition().length >= 2 && $('recognitionOutput').textContent.includes('我目前做得到') },
    { label: '完成邀約稿', done: valueOf('contactPerson') && valueOf('contactBenefit') && $('appointmentOutput').textContent.includes('邀約稿') },
    { label: '完成水池規劃', done: valueOf('monthTheme') && $('poolOutput').textContent.includes('本月水池') },
    { label: '完成社群草稿', done: valueOf('socialTopic') && $('socialOutput').textContent.includes('社群草稿') },
    { label: '完成挫折復原', done: valueOf('setbackNow') && $('setbackOutput').textContent.includes('目前挫折') },
    { label: '完成本週行動稿', done: valueOf('finalStandard') && valueOf('finalPeople') && $('finalOutput').textContent.includes('本週行動稿') }
  ];
}

function updateProgress() {
  const items = progressItems();
  const done = items.filter(item => item.done).length;
  const percent = Math.round(done / items.length * 100);
  $('progressText').textContent = `${percent}%`;
  $('navProgressText').textContent = `${percent}%`;
  $('progressBar').style.width = `${percent}%`;
  $('navProgressBar').style.width = `${percent}%`;
  $('progressList').innerHTML = items.map(item => `<div class="progress-item ${item.done ? 'done' : ''}">${esc(item.label)}</div>`).join('');
}

function gatherState() {
  const values = {};
  fieldIds.forEach(id => {
    const el = $(id);
    if (el) values[id] = el.value;
  });
  return {
    values,
    baselineOutput: $('baselineOutput')?.textContent || '',
    recognitionOutput: $('recognitionOutput')?.textContent || '',
    appointmentOutput: $('appointmentOutput')?.textContent || '',
    poolOutput: $('poolOutput')?.textContent || '',
    socialOutput: $('socialOutput')?.textContent || '',
    setbackOutput: $('setbackOutput')?.textContent || '',
    finalOutput: $('finalOutput')?.textContent || '',
    recognitionChecks: [...document.querySelectorAll('.recognition-check')].map(input => input.checked)
  };
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gatherState()));
  } catch (err) {
    console.warn('Unable to save state', err);
  }
}

function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveState();
    updateProgress();
  }, 160);
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const state = JSON.parse(raw);
    Object.entries(state.values || {}).forEach(([id, value]) => {
      const el = $(id);
      if (el) el.value = value;
    });
    if (state.baselineOutput) $('baselineOutput').textContent = state.baselineOutput;
    if (state.recognitionOutput) $('recognitionOutput').textContent = state.recognitionOutput;
    if (state.appointmentOutput) $('appointmentOutput').textContent = state.appointmentOutput;
    if (state.poolOutput) $('poolOutput').textContent = state.poolOutput;
    if (state.socialOutput) $('socialOutput').textContent = state.socialOutput;
    if (state.setbackOutput) $('setbackOutput').textContent = state.setbackOutput;
    if (state.finalOutput) $('finalOutput').textContent = state.finalOutput;
    [...document.querySelectorAll('.recognition-check')].forEach((input, index) => {
      input.checked = Boolean(state.recognitionChecks?.[index]);
    });
  } catch (err) {
    console.warn('Unable to load state', err);
  }
}

async function copyText(id) {
  const text = $(id)?.textContent.trim();
  if (!text) {
    showToast('目前沒有可複製的內容');
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    const area = document.createElement('textarea');
    area.value = text;
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    area.remove();
  }
  showToast('已複製');
}

function exportPlan() {
  const text = $('finalOutput').textContent.includes('本週行動稿')
    ? $('finalOutput').textContent
    : `富邦之星學習作業

低標：
${$('baselineOutput').textContent}

認同鏈：
${$('recognitionOutput').textContent}

邀約：
${$('appointmentOutput').textContent}

水池：
${$('poolOutput').textContent}

社群：
${$('socialOutput').textContent}

挫折復原：
${$('setbackOutput').textContent}
`;
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = '富邦之星學習作業.txt';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast('已匯出文字檔');
}

function resetAll() {
  if (!confirm('確定要清除這一頁保存的練習內容嗎？')) return;
  localStorage.removeItem(STORAGE_KEY);
  fieldIds.forEach(id => {
    const el = $(id);
    if (el) el.value = '';
  });
  document.querySelectorAll('.recognition-check').forEach(input => { input.checked = false; });
  $('baselineOutput').textContent = '填寫後，這裡會把你的低標與理由轉成行動提醒。';
  $('recognitionOutput').textContent = '勾選後，這裡會整理你的認同鏈缺口。';
  $('appointmentOutput').textContent = '填完後，這裡會產生一段不尷尬的邀約稿。';
  $('poolOutput').textContent = '填寫後，這裡會產生本月水池行動。';
  $('socialOutput').textContent = '填寫後，這裡會產生一段有立場、不恐嚇的社群草稿。';
  $('setbackOutput').textContent = '填寫後，這裡會把挫折轉成下一個可控制動作。';
  $('finalOutput').textContent = '完成上方欄位後，這裡會生成一份可帶回去執行的富邦之星行動稿。';
  updateProgress();
  showToast('已重新開始');
}

document.addEventListener('DOMContentLoaded', () => {
  loadState();
  fieldIds.forEach(id => {
    const el = $(id);
    if (!el) return;
    el.addEventListener('input', scheduleSave);
    el.addEventListener('change', scheduleSave);
  });
  document.querySelectorAll('.recognition-check').forEach(input => input.addEventListener('change', scheduleSave));
  updateProgress();
});
