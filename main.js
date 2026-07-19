import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
    getDatabase,
    ref,
    set,
    push,
    onValue
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyBnOc_X0L4AUgbABO7aSaGFQq5I59lB7mo",
    authDomain: "vocabularyapp-20ac4.firebaseapp.com",
    databaseURL: "https://vocabularyapp-20ac4-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "vocabularyapp-20ac4",
    storageBucket: "vocabularyapp-20ac4.firebasestorage.app",
    messagingSenderId: "484616343794",
    appId: "1:484616343794:web:5047bc769c441dd18e806b"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const vocabRef = ref(db, "vocabulary");

const defaultVocab = [
  
];

const categorySelectToggle = document.getElementById('categorySelectToggle');
const categorySelectPanel = document.getElementById('categorySelectPanel');
const categorySelectSummary = document.getElementById('categorySelectSummary');
const tagSelect = document.getElementById('tagSelectPanel');
const tagSelectToggle = document.getElementById('tagSelectToggle');
const tagSelectSummary = document.getElementById('tagSelectSummary');
const clearTagSelectionBtn = document.getElementById('clearTagSelectionBtn');
const reviewModeSelect = document.getElementById('reviewModeSelect');
const quizTypeSelect = document.getElementById('quizTypeSelect');
const directionSelect = document.getElementById('directionSelect');
const quizCountSelect = document.getElementById('quizCountSelect');
const darkModeToggle = document.getElementById('darkModeToggle');
const learnModeBtn = document.getElementById('learnModeBtn');
const quizModeBtn = document.getElementById('quizModeBtn');
const learnPanel = document.getElementById('learnPanel');
const quizPanel = document.getElementById('quizPanel');
const flashFront = document.getElementById('flashFront');
const flashBack = document.getElementById('flashBack');
const flashCategory = document.getElementById('flashCategory');
const flashSpeakBtn = document.getElementById('flashSpeakBtn');
const flipBtn = document.getElementById('flipBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const questionNumber = document.getElementById('questionNumber');
const scoreDisplay = document.getElementById('scoreDisplay');
const questionText = document.getElementById('questionText');
const answersContainer = document.getElementById('answersContainer');
const typingContainer = document.getElementById('typingContainer');
const matchContainer = document.getElementById('matchContainer');
const matchEnglishColumn = document.getElementById('matchEnglishColumn');
const matchVietnameseColumn = document.getElementById('matchVietnameseColumn');
const matchMessage = document.getElementById('matchMessage');
const listenContainer = document.getElementById('listenContainer');
const listenButton = document.getElementById('listenButton');
const listenInput = document.getElementById('listenInput');
const submitListen = document.getElementById('submitListen');
const typingInput = document.getElementById('typingInput');
const submitTyping = document.getElementById('submitTyping');
const nextQuizBtn = document.getElementById('nextQuizBtn');
const restartBtn = document.getElementById('restartBtn');
const addWordBtn = document.getElementById('addWordBtn');
const newWordEng = document.getElementById('newWordEng');
const newWordVn = document.getElementById('newWordVn');
const newWordCategory = document.getElementById('newWordCategory');
const newWordCategoryPanel = document.getElementById('newWordCategoryPanel');
const newWordTagsInput = document.getElementById('newWordTagsInput');
const newWordTagsPanel = document.getElementById('newWordTagsPanel');
const newWordExamplesInput = document.getElementById('newWordExamplesInput');
const newWordExamplesPanel = document.getElementById('newWordExamplesPanel');
const addTagBtn = document.getElementById('addTagBtn');
const tagsDisplay = document.getElementById('tagsDisplay');
const examplesDisplay = document.getElementById('examplesDisplay');
const searchInput = document.getElementById('searchInput');
const vocabList = document.getElementById('vocabList');
const editModal = document.getElementById('editModal');
const closeEditModal = document.getElementById('closeEditModal');
const editWordEng = document.getElementById('editWordEng');
const editWordVn = document.getElementById('editWordVn');
const editWordCategory = document.getElementById('editWordCategory');
const editWordTagsInput = document.getElementById('editWordTagsInput');
const editAddTagBtn = document.getElementById('editAddTagBtn');
const editTagsDisplay = document.getElementById('editTagsDisplay');
const editWordStats = document.getElementById('editWordStats');
const saveEditWord = document.getElementById('saveEditWord');
const cancelEditWord = document.getElementById('cancelEditWord');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFileInput = document.getElementById('importFileInput');
const statsSummary = document.getElementById('statsSummary');
const deviceModal = document.getElementById('deviceModal');
const deviceMobileBtn = document.getElementById('deviceMobileBtn');
const deviceDesktopBtn = document.getElementById('deviceDesktopBtn');
const deviceToggleBtn = document.getElementById('deviceToggleBtn');
const closeDeviceModal = document.getElementById('closeDeviceModal');

const statsKey = 'openquizStats';
let vocab = [];
let filteredVocab = [];
let wordStats = {};
let currentFlashcard = null;
let currentIndex = 0;
let isFlipped = false;
let score = 0;
let currentQuestion = null;
let questions = [];
let currentMatchSelection = { english: null, vietnamese: null };
let currentMatchItems = [];
let editingWordIndex = null;
let editingWordId = null;
let isDarkMode = localStorage.getItem('darkMode') === 'true';
let selectedCategories = [];
let selectedTags = [];
let selectedExamples = [];
let editSelectedTags = [];
let selectedNewWordCategories = [];
const dataKey = 'openquizVocab';
const latestExportVersion = 1;

function makeWordId(item) {
  return `${item.english}|${item.vietnamese}|${getCategoryList(item).join(',')}|${item.topic || ''}`;
}

function showNotification(message, duration = 2000) {
  const notification = document.getElementById('notification');
  if (!notification) return;
  
  notification.textContent = message;
  notification.classList.remove('hidden', 'hide');
  
  setTimeout(() => {
    notification.classList.add('hide');
    setTimeout(() => {
      notification.classList.add('hidden');
    }, 300);
  }, duration);
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function displaySelectedTags() {
  tagsDisplay.innerHTML = selectedTags
    .map(tag => `
      <div class="tag-chip">
        <span>${escapeHtml(tag)}</span>
        <button type="button" data-tag="${escapeHtml(tag)}">×</button>
      </div>
    `)
    .join('');

  tagsDisplay.querySelectorAll("button[data-tag]").forEach(button => {
    button.addEventListener("click", () => {
      removeTag(button.dataset.tag);
    });
  });
}

function displaySelectedExamples() {
  if (!examplesDisplay) return;
  examplesDisplay.innerHTML = selectedExamples
    .map(example => `
      <div class="tag-chip">
        <span>${escapeHtml(example)}</span>
        <button type="button" data-example="${escapeHtml(example)}">×</button>
      </div>
    `)
    .join('');
  examplesDisplay.querySelectorAll('button[data-example]').forEach(button => {
    button.addEventListener('click', () => removeExample(button.dataset.example || ''));
  });
}

function addTag(tagText) {
  const normalizedTag = tagText.trim().charAt(0).toUpperCase() + tagText.trim().slice(1).toLowerCase();
  if (!normalizedTag) return;
  if (!selectedTags.includes(normalizedTag)) {
    selectedTags.push(normalizedTag);
    displaySelectedTags();
  }
  newWordTagsInput.value = '';
  refreshNewWordTagsPanel();
}

function removeTag(tag) {
  selectedTags = selectedTags.filter(t => t !== tag);
  displaySelectedTags();
  refreshNewWordTagsPanel();
}

function resetTags() {
  selectedTags = [];
  displaySelectedTags();
  newWordTagsInput.value = '';
  refreshNewWordTagsPanel();
}

function normalizeExampleText(exampleText) {
  return (exampleText || '').trim().replace(/\s+/g, ' ');
}

function addExample(exampleText) {
  const normalizedExample = normalizeExampleText(exampleText);
  if (!normalizedExample) return;
  if (!selectedExamples.some(example => normalizeText(example) === normalizeText(normalizedExample))) {
    selectedExamples.push(normalizedExample);
    displaySelectedExamples();
  }
  if (newWordExamplesInput) {
    newWordExamplesInput.value = '';
  }
  refreshNewWordExamplesPanel();
}

function removeExample(example) {
  selectedExamples = selectedExamples.filter(item => item !== example);
  displaySelectedExamples();
  refreshNewWordExamplesPanel();
}

function resetExamples() {
  selectedExamples = [];
  displaySelectedExamples();
  if (newWordExamplesInput) {
    newWordExamplesInput.value = '';
  }
  refreshNewWordExamplesPanel();
}

function updateNewWordCategoryInput() {
  if (!newWordCategory) return;
  newWordCategory.value = selectedNewWordCategories.length > 0
    ? selectedNewWordCategories.join(', ')
    : '';
}

function toggleNewWordCategory(categoryText) {
  const normalized = normalizeCategory(categoryText);
  if (!normalized) return;
  if (selectedNewWordCategories.includes(normalized)) {
    selectedNewWordCategories = selectedNewWordCategories.filter(item => item !== normalized);
  } else {
    selectedNewWordCategories.push(normalized);
    selectedNewWordCategories = [...new Set(selectedNewWordCategories)].sort((left, right) => left.localeCompare(right));
  }
  updateNewWordCategoryInput();
  refreshNewWordCategoryPanel();
}

function resetNewWordCategories() {
  selectedNewWordCategories = [];
  if (newWordCategory) {
    newWordCategory.value = '';
  }
  refreshNewWordCategoryPanel();
}

function displayEditSelectedTags() {
  editTagsDisplay.innerHTML = editSelectedTags
    .map(tag => `
      <div class="tag-chip">
        <span>${escapeHtml(tag)}</span>
        <button type="button" data-tag="${escapeHtml(tag)}">×</button>
      </div>
    `)
    .join('');

  editTagsDisplay.querySelectorAll("button[data-tag]").forEach(button => {
    button.addEventListener("click", () => {
      removeEditTag(button.dataset.tag);
    });
  });
}

function addEditTag(tagText) {
  const normalizedTag = tagText.trim().charAt(0).toUpperCase() + tagText.trim().slice(1).toLowerCase();
  if (!normalizedTag) return;
  if (!editSelectedTags.includes(normalizedTag)) {
    editSelectedTags.push(normalizedTag);
    displayEditSelectedTags();
  }
  editWordTagsInput.value = '';
}

function removeEditTag(tag) {
  editSelectedTags = editSelectedTags.filter(t => t !== tag);
  displayEditSelectedTags();
}

function resetEditTags() {
  editSelectedTags = [];
  displayEditSelectedTags();
  editWordTagsInput.value = '';
}

function normalizeTags(tagsText) {
  if (!tagsText) return [];

  const values = Array.isArray(tagsText)
    ? tagsText
    : String(tagsText).split(/[;,\n]+/);

  return [...new Set(
    values
      .map(tag => String(tag).trim())
      .filter(Boolean)
      .map(tag => tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase())
  )];
}

function normalizeExamples(examplesValue) {
  if (!examplesValue) return [];

  const values = Array.isArray(examplesValue)
    ? examplesValue
    : String(examplesValue).split(/[\n]+/);

  return [...new Set(
    values
      .map(item => normalizeExampleText(item))
      .filter(Boolean)
  )];
}

function getExamples() {
  const examples = new Set();
  vocab.forEach(item => {
    normalizeExamples(item.examples).forEach(example => examples.add(example));
  });
  return [...examples];
}

function getTagsDisplay(item) {
  return Array.isArray(item.tags) ? item.tags.join(', ') : '';
}

function ensureReviewFields(item) {
  return {
    correct: 0,
    wrong: 0,
    starred: false,
    due: null,
    intervalDays: 1,
    lastReviewed: null,
    ...item,
  };
}

function normalizeText(value) {
  return (value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ');
}

function matchesQuery(text, query) {
  if (!query) return true;
  return normalizeText(text).includes(query);
}

function getEnglishVariants(item) {
  const raw = item.english || '';
  return raw
    .split(/[,;|\/]+/)
    .map(variant => normalizeText(variant))
    .filter(Boolean);
}

function loadStats() {
  const saved = localStorage.getItem(statsKey);
  if (!saved) {
    wordStats = {};
    return;
  }
  try {
    const parsed = JSON.parse(saved) || {};
    wordStats = Object.fromEntries(Object.entries(parsed).map(([key, value]) => [key, ensureReviewFields(value)]));
  } catch {
    wordStats = {};
  }
}

function saveStats() {
  localStorage.setItem(statsKey, JSON.stringify(wordStats));
}

function normalizeCategory(category) {
  if (!category) return 'Tự tạo';
  return category
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function normalizeCategorySelection(categoryValue) {
  if (!categoryValue) return [];
  const values = Array.isArray(categoryValue)
    ? categoryValue
    : String(categoryValue).split(/[;,\n|]+/);
  return [...new Set(values.map(item => normalizeCategory(item)).filter(Boolean))].sort((left, right) => left.localeCompare(right));
}

function getCategoryList(item) {
  return normalizeCategorySelection(item?.category);
}

function getCategoryDisplay(item) {
  const categories = getCategoryList(item);
  return categories.length > 0 ? categories.join(', ') : 'Tự tạo';
}

function itemMatchesCategory(item, category) {
  if (!category || category === 'Tất cả') return true;
  return getCategoryList(item).includes(category);
}

function getSuggestionItems(items, query) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return items;
  return items.filter(item => normalizeText(item).includes(normalizedQuery));
}

function renderOptionPanel(panel, items, onPick, emptyText = 'Không có dữ liệu.') {
  if (!panel) return;
  if (!items.length) {
    panel.innerHTML = `<div class="field-dropdown-empty">${emptyText}</div>`;
    return;
  }
  panel.innerHTML = items
    .map(item => `<button type="button" class="field-dropdown-option" data-value="${item}">${item}</button>`)
    .join('');
  panel.querySelectorAll('.field-dropdown-option').forEach(button => {
    button.addEventListener('click', () => onPick(button.dataset.value));
  });
}

function openFieldPanel(panel) {
  if (!panel) return;
  panel.classList.remove('hidden');
}

function closeFieldPanel(panel) {
  if (!panel) return;
  panel.classList.add('hidden');
}

function refreshNewWordCategoryPanel() {
  if (!newWordCategoryPanel) return;
  const items = getSuggestionItems(getCategories().filter(item => item !== 'Tất cả'), newWordCategory?.value || '');
  if (!items.length) {
    newWordCategoryPanel.innerHTML = '<div class="field-dropdown-empty">Chưa có loại từ nào.</div>';
    return;
  }
  const activeCategories = new Set(selectedNewWordCategories);
  newWordCategoryPanel.innerHTML = items
    .map(category => `
      <button type="button" class="field-dropdown-option${activeCategories.has(category) ? ' active' : ''}" data-value="${category}">
        ${category}
      </button>
    `)
    .join('');
  newWordCategoryPanel.querySelectorAll('.field-dropdown-option').forEach(button => {
    button.addEventListener('click', () => toggleNewWordCategory(button.dataset.value));
  });
}

function refreshNewWordTagsPanel() {
  if (!newWordTagsPanel) return;
  const currentTags = new Set(selectedTags);
  const items = getSuggestionItems(getTags(), newWordTagsInput?.value || '');
  if (!items.length) {
    newWordTagsPanel.innerHTML = '<div class="field-dropdown-empty">Chưa có tag nào.</div>';
    return;
  }
  newWordTagsPanel.innerHTML = items
    .map(tag => `
      <button type="button" class="field-dropdown-option${currentTags.has(tag) ? ' active' : ''}" data-value="${tag}">
        ${tag}
      </button>
    `)
    .join('');
  newWordTagsPanel.querySelectorAll('.field-dropdown-option').forEach(button => {
    button.addEventListener('click', () => {
      const tag = button.dataset.value;
      if (selectedTags.includes(tag)) {
        removeTag(tag);
      } else {
        addTag(tag);
      }
      refreshNewWordTagsPanel();
    });
  });
}

function refreshNewWordExamplesPanel() {
  if (!newWordExamplesPanel) return;
  const currentExamples = new Set(selectedExamples.map(example => normalizeText(example)));
  const items = getSuggestionItems(getExamples(), newWordExamplesInput?.value || '');
  if (!items.length) {
    newWordExamplesPanel.innerHTML = '<div class="field-dropdown-empty">Chưa có ví dụ nào.</div>';
    return;
  }
  newWordExamplesPanel.innerHTML = items
    .map(example => `
      <button type="button" class="field-dropdown-option${currentExamples.has(normalizeText(example)) ? ' active' : ''}" data-value="${escapeHtml(example)}">
        ${escapeHtml(example)}
      </button>
    `)
    .join('');
  newWordExamplesPanel.querySelectorAll('.field-dropdown-option').forEach(button => {
    button.addEventListener('click', () => {
      const example = button.dataset.value;
      if (selectedExamples.includes(example)) {
        removeExample(example);
      } else {
        addExample(example);
      }
      refreshNewWordExamplesPanel();
    });
  });
}

function focusNewWordField(input, panel, refreshPanel) {
  if (!input) return;
  input.focus();
  if (typeof refreshPanel === 'function') {
    refreshPanel();
  }
  openFieldPanel(panel);
}

function normalizeTopic(topic) {
  if (!topic) return 'Tổng hợp';
  return topic
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function toggleDarkMode() {
  isDarkMode = !isDarkMode;
  localStorage.setItem('darkMode', isDarkMode);
  document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  darkModeToggle.textContent = isDarkMode ? '☀️' : '🌙';
}

function applyDevice(device) {
  if (!device) return;
  document.documentElement.setAttribute('data-device', device);
  localStorage.setItem('deviceType', device);
  // small layout adjustments might require rerender
  populateCategoryOptions();
  renderVocabList();
  renderStats();
}

function showDeviceModal() {
  if (!deviceModal) return;
  deviceModal.classList.remove('hidden');
}

function closeDeviceModalWindow() {
  if (!deviceModal) return;
  deviceModal.classList.add('hidden');
}

function initDevicePreference() {
  const pref = localStorage.getItem('deviceType');
  if (pref) {
    applyDevice(pref);
  } else {
    // show modal to ask
    showDeviceModal();
  }
}

function initDarkMode() {
  document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  darkModeToggle.textContent = isDarkMode ? '☀️' : '🌙';
}

function loadVocab() {
  loadStats();
  const saved = localStorage.getItem(dataKey);
  if (saved) {
    try {
      const items = JSON.parse(saved);
      vocab = Array.isArray(items) ? [...defaultVocab, ...items] : defaultVocab;
    } catch {
      vocab = [...defaultVocab];
    }
  } else {
    vocab = [...defaultVocab];
  }
  vocab = vocab.map(item => ({
    ...item,
    category: normalizeCategorySelection(item.category),
    topic: normalizeTopic(item.topic),
    tags: normalizeTags(Array.isArray(item.tags) ? item.tags.join(', ') : item.tags || ''),
    examples: normalizeExamples(item.examples),
  }));
}

function saveVocab() {
  const customWords = vocab.filter(
    word => !defaultVocab.some(
      item =>
        item.english === word.english &&
        item.vietnamese === word.vietnamese
    )
  );

  // Vẫn lưu local để dùng offline
  localStorage.setItem(dataKey, JSON.stringify(customWords));

  // Đồng bộ lên Firebase
  set(vocabRef, customWords)
    .then(() => {
      console.log("Đã đồng bộ Firebase");
    })
    .catch(error => {
      console.error("Lỗi đồng bộ:", error);
    });
}

function syncFirebase() {

    onValue(vocabRef, (snapshot) => {

        const firebaseWords = snapshot.val();

        if (!firebaseWords) return;

        vocab = [
            ...defaultVocab,
            ...firebaseWords
        ];

        populateCategoryOptions();
        renderVocabList();
        renderStats();

        console.log("Đồng bộ Firebase thành công");

    });

}

function exportData() {
  const payload = {
    version: latestExportVersion,
    defaultVocab,
    customVocab: vocab.filter(word => !defaultVocab.some(item => item.english === word.english && item.vietnamese === word.vietnamese)),
    stats: wordStats,
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `vocab-export-${new Date().toISOString().slice(0,10)}.json`;
  link.click();
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = event => {
    try {
      const payload = JSON.parse(event.target.result);
      if (!payload || !payload.customVocab || !payload.stats) {
        throw new Error('File không đúng định dạng');
      }
      const importedWords = Array.isArray(payload.customVocab) ? payload.customVocab : [];
      importedWords.forEach(item => {
        const existed = vocab.some(word =>
          word.english === item.english &&
          word.vietnamese === item.vietnamese &&
          makeWordId(word) === makeWordId({
            english: item.english,
            vietnamese: item.vietnamese,
            category: normalizeCategorySelection(item.category),
            topic: normalizeTopic(item.topic),
          }) &&
          word.topic === normalizeTopic(item.topic)
        );
        if (!existed) {
          vocab.push({
            english: item.english,
            vietnamese: item.vietnamese,
            category: normalizeCategorySelection(item.category),
            topic: normalizeTopic(item.topic),
            tags: normalizeTags(item.tags),
            examples: normalizeExamples(item.examples),
          });
        }
      });
      wordStats = { ...wordStats, ...payload.stats };
      saveVocab();
      saveStats();
      populateCategoryOptions();
      renderVocabList();
      resetLearning();
      renderStats();
      alert('Nhập dữ liệu thành công');
    } catch (error) {
      alert('Không thể nhập dữ liệu: ' + error.message);
    }
  };
  reader.readAsText(file);
}

function getCategories() {
  const categories = new Set(vocab.flatMap(item => getCategoryList(item)));
  return ['Tất cả', ...categories];
}

function getTopics() {
  const topics = new Set(vocab.map(item => item.topic || 'Tổng hợp'));
  return ['Tất cả', ...topics];
}

function updateCategorySelectSummary() {
  if (!categorySelectSummary) return;
  if (selectedCategories.length === 0) {
    categorySelectSummary.textContent = 'Tất cả';
    return;
  }
  if (selectedCategories.length <= 2) {
    categorySelectSummary.textContent = selectedCategories.join(', ');
    return;
  }
  categorySelectSummary.textContent = `${selectedCategories[0]}, ${selectedCategories[1]} +${selectedCategories.length - 2}`;
}

function setCategoryPanelOpen(isOpen) {
  if (!categorySelectPanel || !categorySelectToggle) return;
  categorySelectPanel.classList.toggle('hidden', !isOpen);
  categorySelectToggle.setAttribute('aria-expanded', String(isOpen));
}

function getSelectedCategories() {
  return [...selectedCategories];
}

function setSelectedCategories(categories = []) {
  selectedCategories = [...new Set(categories.filter(Boolean))];
  if (categorySelectPanel) {
    const active = new Set(selectedCategories);
    categorySelectPanel.querySelectorAll('.tag-option').forEach(button => {
      const isActive = active.has(button.dataset.category);
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
  }
  updateCategorySelectSummary();
}

function getTags() {
  const tags = new Set(vocab.flatMap(item => item.tags || []));
  return [...tags];
}

function updateTagSelectSummary() {
  if (!tagSelectSummary) return;
  const selectedTags = getSelectedTags();
  if (selectedTags.length === 0) {
    tagSelectSummary.textContent = 'Tất cả';
    return;
  }
  if (selectedTags.length <= 2) {
    tagSelectSummary.textContent = selectedTags.join(', ');
    return;
  }
  tagSelectSummary.textContent = `${selectedTags[0]}, ${selectedTags[1]} +${selectedTags.length - 2}`;
}

function setTagPanelOpen(isOpen) {
  if (!tagSelect || !tagSelectToggle) return;
  tagSelect.classList.toggle('hidden', !isOpen);
  tagSelectToggle.setAttribute('aria-expanded', String(isOpen));
}

function getSelectedTags() {
  if (!tagSelect) return [];
  return Array.from(tagSelect.querySelectorAll('.tag-option.active'))
    .map(option => option.dataset.tag)
    .filter(Boolean);
}

function setSelectedTags(tags = []) {
  if (!tagSelect) return;
  const normalized = new Set(tags.filter(Boolean));
  tagSelect.querySelectorAll('.tag-option').forEach(button => {
    const isActive = normalized.has(button.dataset.tag);
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
  updateTagSelectSummary();
}

function getReviewStatus(item) {
  const stats = wordStats[makeWordId(item)] || { correct: 0, wrong: 0, starred: false };
  if (stats.due && new Date(stats.due) <= new Date()) {
    return 'due';
  }
  if (stats.correct === 0 && stats.wrong === 0) {
    return 'new';
  }
  if (stats.wrong > 0) {
    return 'incorrect';
  }
  if (stats.starred) {
    return 'starred';
  }
  return 'reviewed';
}

function calculateNextDue(item, correct) {
  const id = makeWordId(item);
  const stats = wordStats[id] || ensureReviewFields({});
  const newStats = { ...stats };
  if (correct) {
    newStats.correct += 1;
    newStats.intervalDays = Math.min(30, Math.max(1, Math.round(newStats.intervalDays * 1.4)));
  } else {
    newStats.wrong += 1;
    newStats.intervalDays = 1;
  }
  const nextDue = new Date();
  nextDue.setDate(nextDue.getDate() + newStats.intervalDays);
  newStats.due = nextDue.toISOString();
  newStats.lastReviewed = new Date().toISOString();
  wordStats[id] = newStats;
  saveStats();
}

function getWordWeight(item) {
  const stats = wordStats[makeWordId(item)] || { correct: 0, wrong: 0, starred: false };
  const score = stats.correct - stats.wrong;
  let weight;
  if (score < 0) {
    weight = Math.min(5, 1 + Math.abs(score) * 1.5);
  } else {
    weight = Math.max(0.2, 1 / (1 + score * 0.6));
  }
  if (stats.starred) {
    weight *= 2.5;
  }
  return weight;
}

function weightedRandomItem(items) {
  const weights = items.map(item => getWordWeight(item));
  const total = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * total;
  for (let i = 0; i < items.length; i += 1) {
    random -= weights[i];
    if (random <= 0) {
      return items[i];
    }
  }
  return items[items.length - 1];
}

function updateWordStats(item, isCorrect) {
  const id = makeWordId(item);
  const current = ensureReviewFields(wordStats[id] || {});
  if (isCorrect) {
    current.correct += 1;
    current.intervalDays = Math.min(30, Math.max(1, Math.round(current.intervalDays * 1.4)));
  } else {
    current.wrong += 1;
    current.intervalDays = 1;
  }
  const nextDue = new Date();
  nextDue.setDate(nextDue.getDate() + current.intervalDays);
  current.due = nextDue.toISOString();
  current.lastReviewed = new Date().toISOString();
  wordStats[id] = current;
  saveStats();
  renderStats();
}

function toggleWordStar(item) {
  const id = makeWordId(item);
  if (!wordStats[id]) {
    wordStats[id] = { correct: 0, wrong: 0, starred: false };
  }
  wordStats[id].starred = !wordStats[id].starred;
  saveStats();
  renderVocabList();
}

function populateCategoryOptions() {
  const categories = getCategories();
  const tags = getTags();
  const previouslySelectedTags = getSelectedTags();
  const previouslySelectedCategories = getSelectedCategories();
  if (categorySelectPanel) {
    const categoryItems = categories.filter(category => category !== 'Tất cả');
    categorySelectPanel.innerHTML = categoryItems.length > 0
      ? categoryItems
        .map(category => `
          <button type="button" class="tag-option" data-category="${category}" aria-pressed="false">
            ${category}
          </button>
        `)
        .join('')
      : '<div class="tag-empty">Chưa có loại từ nào.</div>';

    categorySelectPanel.querySelectorAll('.tag-option').forEach(button => {
      button.addEventListener('click', () => {
        const category = button.dataset.category;
        const current = new Set(getSelectedCategories());
        if (current.has(category)) {
          current.delete(category);
        } else {
          current.add(category);
        }
        setSelectedCategories([...current]);
        resetLearning();
        if (!quizPanel.classList.contains('hidden')) startQuiz();
      });
    });

    if (previouslySelectedCategories.length > 0) {
      setSelectedCategories(previouslySelectedCategories);
    } else {
      updateCategorySelectSummary();
    }
  }
  if (tagSelect) {
    tagSelect.innerHTML = tags.length > 0
      ? tags
        .map(tag => `
          <button type="button" class="tag-option" data-tag="${tag}" aria-pressed="false">
            ${tag}
          </button>
        `)
        .join('')
      : '<div class="tag-empty">Chưa có tag nào.</div>';

    if (previouslySelectedTags.length > 0) {
      setSelectedTags(previouslySelectedTags);
    } else {
      updateTagSelectSummary();
    }

    tagSelect.querySelectorAll('.tag-option').forEach(button => {
      button.addEventListener('click', () => {
        const tag = button.dataset.tag;
        const current = new Set(getSelectedTags());
        if (current.has(tag)) {
          current.delete(tag);
        } else {
          current.add(tag);
        }
        setSelectedTags([...current]);
        resetLearning();
        if (!quizPanel.classList.contains('hidden')) startQuiz();
      });
    });
  }

  refreshNewWordCategoryPanel();
  refreshNewWordTagsPanel();
}

function filterVocab() {
  const categories = getSelectedCategories();
  const selectedTags = getSelectedTags();
  const reviewMode = reviewModeSelect.value;
  let filtered = vocab;
  
  if (categories.length > 0) {
    filtered = filtered.filter(item => categories.some(category => itemMatchesCategory(item, category)));
  }

  if (selectedTags.length > 0) {
    filtered = filtered.filter(item => selectedTags.some(tag => (item.tags || []).includes(tag)));
  }
  
  // Áp dụng review mode
  if (reviewMode !== 'all') {
    filtered = filtered.filter(item => {
      const stats = wordStats[makeWordId(item)] || { correct: 0, wrong: 0, starred: false, due: null };
      if (reviewMode === 'incorrect') {
        return stats.wrong > 0;
      } else if (reviewMode === 'starred') {
        return stats.starred;
      } else if (reviewMode === 'new') {
        return stats.correct === 0 && stats.wrong === 0;
      } else if (reviewMode === 'due') {
        return stats.due && new Date(stats.due) <= new Date();
      }
      return true;
    });
  }
  
  filteredVocab = filtered;
}

function getFilteredVocabItems() {
  const query = normalizeText(searchInput?.value);
  const categories = getSelectedCategories();
  const selectedTags = getSelectedTags();
  return vocab.filter(item => {
    const matchesSearch =
      !query ||
      matchesQuery(item.english, query) ||
      matchesQuery(item.vietnamese, query) ||
      matchesQuery(getCategoryDisplay(item), query) ||
      matchesQuery(item.topic, query) ||
      matchesQuery(getTagsDisplay(item), query) ||
      matchesQuery(item.pronunciation, query);

    if (!matchesSearch) {
      return false;
    }

    if (!query && categories.length > 0 && !categories.some(category => itemMatchesCategory(item, category))) {
      return false;
    }
    if (!query && selectedTags.length > 0 && !selectedTags.some(tag => (item.tags || []).includes(tag))) {
      return false;
    }
    return true;
  });
}

function getTotalWords() {
  return vocab.length;
}

function getCorrectCount() {
  return Object.values(wordStats).reduce((sum, stats) => sum + (stats.correct || 0), 0);
}

function getWrongCount() {
  return Object.values(wordStats).reduce((sum, stats) => sum + (stats.wrong || 0), 0);
}

function getMostDifficultWords(limit = 5) {
  const entries = Object.entries(wordStats)
    .map(([id, stats]) => ({ id, ...stats }))
    .filter(item => item.wrong > 0)
    .sort((a, b) => (b.wrong - b.correct) - (a.wrong - a.correct));
  return entries.slice(0, limit).map(entry => {
    const [english, vietnamese, category, topic] = entry.id.split('|');
    return {
      english,
      vietnamese,
      category: normalizeCategorySelection(category),
      topic,
      correct: entry.correct,
      wrong: entry.wrong,
    };
  });
}

function getStarredCount() {
  return Object.values(wordStats).filter(stats => stats.starred).length;
}

function getDueWordCount() {
  return Object.values(wordStats).filter(stats => stats.due && new Date(stats.due) <= new Date()).length;
}

function getNewWordCount() {
  return vocab.filter(item => {
    const stats = wordStats[makeWordId(item)] || { correct: 0, wrong: 0 };
    return stats.correct === 0 && stats.wrong === 0;
  }).length;
}

function renderStats() {
  if (!statsSummary) return;
  const totalWords = getTotalWords();
  const correctCount = getCorrectCount();
  const wrongCount = getWrongCount();
  const starredCount = getStarredCount();
  const newWordCount = getNewWordCount();
  const difficultWords = getMostDifficultWords(3);

  statsSummary.innerHTML = `
    <div class="stats-row"><strong>Tổng số từ:</strong> ${totalWords}</div>
    <div class="stats-row"><strong>Đã đúng:</strong> ${correctCount}</div>
    <div class="stats-row"><strong>Đã sai:</strong> ${wrongCount}</div>
    <div class="stats-row"><strong>Từ sao:</strong> ${starredCount}</div>
    <div class="stats-row"><strong>Đến hạn:</strong> ${getDueWordCount()}</div>
    <div class="stats-row"><strong>Từ mới:</strong> ${newWordCount}</div>
    <div class="stats-row stats-title">Từ khó nhất:</div>
    ${difficultWords.length > 0 ? difficultWords.map(word => `
      <div class="stats-word">
        ${word.english} - ${word.vietnamese} (${getCategoryDisplay(word)}, ${word.topic})
        <span class="stats-count">Sai: ${word.wrong}, Đúng: ${word.correct}</span>
      </div>
    `).join('') : '<div class="stats-row">Chưa có từ khó.</div>'}
  `;
}

function renderVocabList() {
  if (!vocabList) return;
  const listItems = getFilteredVocabItems();
  if (listItems.length === 0) {
    vocabList.innerHTML = '<div class="vocab-empty">Không tìm thấy từ phù hợp.</div>';
    return;
  }
  vocabList.innerHTML = listItems
    .map((item, index) => {
      const stats = wordStats[makeWordId(item)] || { starred: false };
      const starClass = stats.starred ? 'star-btn starred' : 'star-btn';
      return `
      <div class="vocab-item">
        <div class="vocab-detail">
          <span class="vocab-word">${item.english}</span>
          ${item.pronunciation ? `<span class="vocab-pronunciation">${item.pronunciation}</span>` : '<span class="vocab-pronunciation" style="color: #cbd5e1;">...</span>'}
          <span class="vocab-meaning">${item.vietnamese}</span>
        </div>
        <div class="vocab-meta">
          <button class="speak-btn" data-word="${item.english}" aria-label="Đọc từ">🔊</button>
          <button class="${starClass}" data-index="${index}" aria-label="Gắn sao từ">★</button>
          <span class="vocab-category">${getCategoryDisplay(item)}</span>
          <span class="vocab-tags">${getTagsDisplay(item)}</span>
          <button class="edit-btn" data-index="${index}" aria-label="Chỉnh sửa từ">✏️</button>
          <button class="delete-btn" data-index="${index}" aria-label="Xóa từ">×</button>
        </div>
      </div>
    `;
    })
    .join('');

  vocabList.querySelectorAll('.speak-btn').forEach(btn => {
    btn.addEventListener('click', event => {
      const word = event.currentTarget.dataset.word;
      playListenWord(word);
    });
  });

  vocabList.querySelectorAll('.star-btn').forEach(btn => {
    btn.addEventListener('click', event => {
      const index = Number(event.currentTarget.dataset.index);
      const listItems = getFilteredVocabItems();
      const target = listItems[index];
      toggleWordStar(target);
    });
  });

  vocabList.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', event => {
      const index = Number(event.currentTarget.dataset.index);
      const listItems = getFilteredVocabItems();
      const target = listItems[index];
      openEditModal(target);
    });
  });

  vocabList.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', event => {
      const index = Number(event.currentTarget.dataset.index);
      const listItems = getFilteredVocabItems();
      const target = listItems[index];
      const deleteIndex = vocab.findIndex(item => makeWordId(item) === makeWordId(target));
      if (deleteIndex !== -1) {
        vocab.splice(deleteIndex, 1);
      }
      saveVocab();
      populateCategoryOptions();
      renderVocabList();
      resetLearning();
    });
  });
}

function setMode(mode) {
  const isLearn = mode === 'learn';
  learnModeBtn.classList.toggle('active', isLearn);
  quizModeBtn.classList.toggle('active', !isLearn);
  learnPanel.classList.toggle('hidden', !isLearn);
  quizPanel.classList.toggle('hidden', isLearn);
  if (isLearn) {
    resetLearning();
  } else {
    startQuiz();
  }
}

function resetLearning() {
  filterVocab();
  currentFlashcard = filteredVocab.length > 0 ? weightedRandomItem(filteredVocab) : null;
  isFlipped = false;
  renderFlashcard();
}

function renderFlashcard() {
  if (!currentFlashcard) {
    flashCategory.textContent = 'Loại từ: -';
    flashFront.textContent = 'Không có từ nào';
    flashBack.textContent = '';
    const flashTags = document.getElementById('flashTags');
    if (flashTags) flashTags.innerHTML = '';
    return;
  }
  flashCategory.textContent = `Loại từ: ${currentFlashcard.category || 'Tự tạo'}`;
  const flashTags = document.getElementById('flashTags');
  if (flashTags) {
    flashTags.innerHTML = currentFlashcard.tags ? currentFlashcard.tags.map(tag => `<span class="flash-tag">${tag}</span>`).join('') : '';
  }
  // Chỉ hiển thị một ngôn ngữ tại một thời điểm.
  // Mặc định (chưa lật): hiển thị từ tiếng Anh. Khi lật: hiển thị nghĩa tiếng Việt.
  flashFront.textContent = isFlipped ? currentFlashcard.vietnamese : currentFlashcard.english;
  // Giữ vùng phụ (flashBack) ẩn vì không cần hiển thị song song cả hai ngôn ngữ.
  if (flashBack) {
    flashBack.textContent = isFlipped ? '' : (currentFlashcard.pronunciation || '');
    if (isFlipped) {
      flashBack.classList.add('hidden');
    } else {
      flashBack.classList.remove('hidden');
    }
  }
}

function changeCard(step = null) {
  if (step !== null) {
    currentIndex = (currentIndex + step + filteredVocab.length) % filteredVocab.length;
    currentFlashcard = filteredVocab[currentIndex];
  } else {
    currentFlashcard = filteredVocab.length > 0 ? weightedRandomItem(filteredVocab) : null;
    currentIndex = filteredVocab.indexOf(currentFlashcard);
  }
  isFlipped = false;
  renderFlashcard();
}

function startQuiz() {
  filterVocab();
  score = 0;
  questions = generateQuestions();
  currentIndex = 0;
  updateScore();
  showQuestion();
}

function generateQuestions() {
  const source = filteredVocab.length > 0 ? filteredVocab : vocab;
  const mode = quizTypeSelect.value;
  const maxCount = parseInt(quizCountSelect.value) || 10;
  
  if (mode === 'match') {
    const count = Math.min(Math.floor(source.length / 4), Math.floor(maxCount / 4)) || 1;
    const selected = [];
    const pool = [...source];
    for (let i = 0; i < count; i += 1) {
      const questionSet = [];
      const temp = [...pool];
      while (questionSet.length < 4 && temp.length > 0) {
        const idx = Math.floor(Math.random() * temp.length);
        questionSet.push(temp.splice(idx, 1)[0]);
      }
      selected.push(questionSet);
    }
    return selected;
  }
  const count = Math.min(source.length, maxCount);
  const selected = [];
  const pool = [...source];
  while (selected.length < count && pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length);
    selected.push(pool.splice(idx, 1)[0]);
  }
  return selected;
}

function updateScore() {
  scoreDisplay.textContent = `Điểm: ${score}`;
}

function showQuestion() {
  if (questions.length === 0) {
    questionText.textContent = 'Không có câu hỏi. Vui lòng thêm từ mới.';
    answersContainer.innerHTML = '';
    typingContainer.classList.add('hidden');
    matchContainer.classList.add('hidden');
    listenContainer.classList.add('hidden');
    return;
  }

  currentQuestion = questions[currentIndex];
  questionNumber.textContent = `Câu ${currentIndex + 1}/${questions.length}`;
  const mode = quizTypeSelect.value;
  const direction = directionSelect.value;

  if (mode === 'multiple') {
    typingContainer.classList.add('hidden');
    matchContainer.classList.add('hidden');
    listenContainer.classList.add('hidden');
    answersContainer.classList.remove('hidden');
    answersContainer.innerHTML = '';
    const askField = direction === 'enToVn' ? 'english' : 'vietnamese';
    const answerField = direction === 'enToVn' ? 'vietnamese' : 'english';
    const options = createOptions(currentQuestion, answerField);
    questionText.textContent = direction === 'enToVn'
      ? `Tiếng Anh: ${currentQuestion.english}`
      : `Tiếng Việt: ${currentQuestion.vietnamese}`;
    options.forEach(option => {
      const btn = document.createElement('button');
      btn.className = 'answer-btn';
      btn.textContent = option[answerField];
      btn.addEventListener('click', () => handleAnswer(option[answerField], answerField));
      answersContainer.appendChild(btn);
    });
  } else if (mode === 'typing') {
    answersContainer.innerHTML = '';
    answersContainer.classList.add('hidden');
    matchContainer.classList.add('hidden');
    listenContainer.classList.add('hidden');
    typingContainer.classList.remove('hidden');
    if (direction === 'enToVn') {
      questionText.textContent = `Tiếng Anh: ${currentQuestion.english}`;
    } else {
      questionText.textContent = `Tiếng Việt: ${currentQuestion.vietnamese}`;
    }
    typingInput.value = '';
    typingInput.disabled = false;
    typingInput.focus();
  } else if (mode === 'listen') {
    answersContainer.innerHTML = '';
    answersContainer.classList.add('hidden');
    matchContainer.classList.add('hidden');
    listenContainer.classList.remove('hidden');
    typingContainer.classList.add('hidden');
    questionText.textContent = 'Nghe từ tiếng Anh và viết lại chính xác';
    listenInput.value = '';
    listenInput.disabled = false;
    playListenWord(currentQuestion.english);
  } else if (mode === 'match') {
    answersContainer.innerHTML = '';
    answersContainer.classList.add('hidden');
    matchContainer.classList.remove('hidden');
    listenContainer.classList.add('hidden');
    typingContainer.classList.add('hidden');
    currentMatchItems = questions[currentIndex];
    questionText.textContent = direction === 'enToVn'
      ? 'Nối tiếng Anh với nghĩa tiếng Việt'
      : 'Nối tiếng Việt với từ tiếng Anh';
    buildMatchGame(currentMatchItems, direction);
  }
}

function createOptions(question, field = 'english') {
  const options = [question];
  const others = vocab.filter(item => item.english !== question.english);
  while (options.length < 4 && others.length > 0) {
    const randomIndex = Math.floor(Math.random() * others.length);
    options.push(others.splice(randomIndex, 1)[0]);
  }
  return options.sort(() => Math.random() - 0.5);
}

function isTypingAnswerCorrect(answer, item) {
  const normalized = normalizeText(answer);
  if (directionSelect.value === 'vnToEn') {
    const variants = getEnglishVariants(item);
    return variants.some(variant => normalized === variant);
  }
  return normalized === normalizeText(item.vietnamese);
}

function handleAnswer(answer, answerField = 'english') {
  const buttons = document.querySelectorAll('.answer-btn');
  const correctValue = currentQuestion[answerField];
  buttons.forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === correctValue) {
      btn.classList.add('correct');
    }
    if (btn.textContent === answer && answer !== correctValue) {
      btn.classList.add('wrong');
    }
  });
  const isCorrect = answer === correctValue;
  updateWordStats(currentQuestion, isCorrect);
  if (isCorrect) {
    score += 1;
    updateScore();
  }
}

function playListenWord(text) {
    if (!window.speechSynthesis) return;

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voices = speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith("en"));

    if (englishVoice) {
        utterance.voice = englishVoice;
    }

    speechSynthesis.cancel();

    setTimeout(() => {
        speechSynthesis.speak(utterance);
    }, 100);
}

async function fetchPronunciation(word) {
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
    if (!response.ok) return '';
    const data = await response.json();
    if (data && data[0] && data[0].phonetic) {
      return data[0].phonetic;
    }
    return '';
  } catch (error) {
    console.log('Pronunciation fetch error:', error);
    return '';
  }
}

function buildMatchGame(items, direction = 'enToVn') {
  currentMatchSelection = { left: null, right: null };
  matchMessage.textContent = '';
  matchEnglishColumn.innerHTML = '';
  matchVietnameseColumn.innerHTML = '';
  const leftItems = [...items].sort(() => Math.random() - 0.5);
  const rightItems = [...items].sort(() => Math.random() - 0.5);
  const leftType = direction === 'enToVn' ? 'english' : 'vietnamese';
  const rightType = direction === 'enToVn' ? 'vietnamese' : 'english';

  leftItems.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'match-btn';
    btn.textContent = item[leftType];
    btn.dataset.matchId = makeWordId(item);
    btn.addEventListener('click', () => selectMatchOption('left', item, btn));
    matchEnglishColumn.appendChild(btn);
  });
  rightItems.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'match-btn';
    btn.textContent = item[rightType];
    btn.dataset.matchId = makeWordId(item);
    btn.addEventListener('click', () => selectMatchOption('right', item, btn));
    matchVietnameseColumn.appendChild(btn);
  });

  if (matchEnglishColumn.previousElementSibling) {
    matchEnglishColumn.previousElementSibling.textContent = direction === 'enToVn' ? 'Tiếng Anh' : 'Tiếng Việt';
  }
  if (matchVietnameseColumn.previousElementSibling) {
    matchVietnameseColumn.previousElementSibling.textContent = direction === 'enToVn' ? 'Tiếng Việt' : 'Tiếng Anh';
  }
}

function selectMatchOption(side, item, btn) {
  if (btn.disabled) return;
  if (side === 'left') {
    if (currentMatchSelection.left && currentMatchSelection.left.button) {
      currentMatchSelection.left.button.classList.remove('selected');
    }
    currentMatchSelection.left = { item, button: btn };
    btn.classList.add('selected');
  } else {
    if (currentMatchSelection.right && currentMatchSelection.right.button) {
      currentMatchSelection.right.button.classList.remove('selected');
    }
    currentMatchSelection.right = { item, button: btn };
    btn.classList.add('selected');
  }
  if (currentMatchSelection.left && currentMatchSelection.right) {
    checkMatchPair();
  }
}

function checkMatchPair() {
  const leftItem = currentMatchSelection.left.item;
  const rightItem = currentMatchSelection.right.item;
  const leftBtn = currentMatchSelection.left.button;
  const rightBtn = currentMatchSelection.right.button;
  const isMatch = makeWordId(leftItem) === makeWordId(rightItem);

  if (isMatch) {
    leftBtn.classList.add('correct');
    rightBtn.classList.add('correct');
    leftBtn.disabled = true;
    rightBtn.disabled = true;
    matchMessage.textContent = 'Ghép đúng!';
    updateWordStats(leftItem, true);
    score += 1;
    updateScore();
    currentMatchSelection = { left: null, right: null };
    if (document.querySelectorAll('.match-btn:not(:disabled)').length === 0) {
      matchMessage.textContent = 'Hoàn thành! Nhấn Câu tiếp để tiếp tục.';
    }
  } else {
    const activeButtons = Array.from(document.querySelectorAll('.match-btn:not(:disabled)'));
    leftBtn.classList.add('wrong');
    rightBtn.classList.add('wrong');
    matchMessage.textContent = 'Sai rồi, thử lại.';
    updateWordStats(leftItem, false);
    activeButtons.forEach(button => {
      button.disabled = true;
    });
    setTimeout(() => {
      leftBtn.classList.remove('wrong', 'selected');
      rightBtn.classList.remove('wrong', 'selected');
      activeButtons.forEach(button => {
        if (!button.classList.contains('correct')) {
          button.disabled = false;
        }
      });
      currentMatchSelection = { left: null, right: null };
      matchMessage.textContent = '';
    }, 600);
  }
}

function submitTypingAnswer() {
  const value = typingInput.value.trim();
  if (!value) return;
  const direction = directionSelect.value;
  const isCorrect = isTypingAnswerCorrect(value, currentQuestion);
  updateWordStats(currentQuestion, isCorrect);
  let accepted;
  if (direction === 'vnToEn') {
    accepted = getEnglishVariants(currentQuestion).join(', ');
  } else {
    accepted = currentQuestion.vietnamese;
  }
  if (isCorrect) {
    score += 1;
    updateScore();
    questionText.textContent = direction === 'vnToEn'
      ? `Đúng! Từ: ${currentQuestion.english}`
      : `Đúng! Nghĩa: ${currentQuestion.vietnamese}`;
    playListenWord(currentQuestion.english);
  } else {
    questionText.textContent = `Sai! Đáp án đúng: ${accepted}`;
    playListenWord(currentQuestion.english);
  }
  typingInput.disabled = true;
}

function submitListenAnswer() {
  const value = listenInput.value.trim().toLowerCase();
  if (!value) return;
  const isCorrect = value === currentQuestion.english.toLowerCase();
  updateWordStats(currentQuestion, isCorrect);
  if (isCorrect) {
    score += 1;
    updateScore();
    questionText.textContent = `Đúng! Từ: ${currentQuestion.english}`;
  } else {
    questionText.textContent = `Sai! Từ cần nghe: ${currentQuestion.english}`;
  }
  listenInput.disabled = true;
}

function nextQuizQuestion() {
  if (questions.length === 0) return;
  if (quizTypeSelect.value === 'typing') {
    typingInput.disabled = false;
  }
  currentIndex = (currentIndex + 1) % questions.length;
  showQuestion();
}

function addNewWord() {
  const english = newWordEng.value.trim();
  const vietnamese = newWordVn.value.trim();
  const pendingTags = normalizeTags(newWordTagsInput.value);
  const combinedTags = [...new Set([...selectedTags, ...pendingTags])];
  const pendingExamples = normalizeExamples(newWordExamplesInput?.value || '');
  const combinedExamples = [...new Set([...selectedExamples, ...pendingExamples])];
  const categorySelection = selectedNewWordCategories.length > 0
    ? [...selectedNewWordCategories]
    : normalizeCategorySelection(newWordCategory.value);
  if (!english || !vietnamese) {
    showNotification('⚠️ Vui lòng nhập đủ cả tiếng Anh và tiếng Việt', 2000);
    return;
  }
  
  const newWord = { 
    english, 
    vietnamese, 
    pronunciation: '',
    category: categorySelection.length > 0 ? categorySelection : [normalizeCategory(newWordCategory.value.trim())],
    tags: combinedTags,
    examples: combinedExamples,
  };
  
  vocab.push(newWord);
  saveVocab();
  populateCategoryOptions();
  renderVocabList();
  renderStats();
  newWordEng.value = '';
  newWordVn.value = '';
  newWordCategory.value = '';
  newWordTagsInput.value = '';
  if (newWordExamplesInput) {
    newWordExamplesInput.value = '';
  }
  resetTags();
  resetExamples();
  resetNewWordCategories();
  resetLearning();
  showNotification(`✅ Thêm từ "${english}" thành công!`, 2000);
  
  // Lấy phiên âm ở background
  fetchPronunciation(english).then(pronunciation => {
    if (pronunciation) {
      newWord.pronunciation = pronunciation;
      saveVocab();
      renderVocabList();
    }
  }).catch(error => {
    console.log('Could not fetch pronunciation for:', english);
  });
}

function openEditModal(item) {
  editingWordIndex = vocab.findIndex(w => makeWordId(w) === makeWordId(item));
  editingWordId = makeWordId(item);
  editWordEng.value = item.english;
  editWordVn.value = item.vietnamese;
  editWordCategory.value = getCategoryDisplay(item);
  editSelectedTags = [...(item.tags || [])];
  displayEditSelectedTags();
  
  const stats = wordStats[editingWordId] || { correct: 0, wrong: 0 };
  editWordStats.textContent = `Đúng: ${stats.correct} | Sai: ${stats.wrong}`;
  
  editModal.classList.remove('hidden');
}

function closeEditModalWindow() {
  editModal.classList.add('hidden');
  editingWordIndex = null;
  resetEditTags();
}

function saveEditWordChanges() {
  if (editingWordIndex === null || editingWordIndex === -1) return;
  
  const oldId = editingWordId;
  vocab[editingWordIndex].english = editWordEng.value.trim();
  vocab[editingWordIndex].vietnamese = editWordVn.value.trim();
  vocab[editingWordIndex].category = normalizeCategorySelection(editWordCategory.value);
  vocab[editingWordIndex].tags = [...editSelectedTags];
  const newId = makeWordId(vocab[editingWordIndex]);
  if (oldId && oldId !== newId) {
    wordStats[newId] = wordStats[oldId] || ensureReviewFields({});
    delete wordStats[oldId];
    saveStats();
  }
  
  saveVocab();
  populateCategoryOptions();
  renderVocabList();
  renderStats();
  closeEditModalWindow();
  resetLearning();
}

function addEventListeners() {
  learnModeBtn?.addEventListener('click', () => setMode('learn'));
  quizModeBtn?.addEventListener('click', () => setMode('quiz'));
  darkModeToggle?.addEventListener('click', toggleDarkMode);
  
  categorySelectToggle?.addEventListener('click', () => {
    setCategoryPanelOpen(categorySelectPanel?.classList.contains('hidden'));
  });
  tagSelectToggle?.addEventListener('click', () => {
    setTagPanelOpen(tagSelect?.classList.contains('hidden'));
  });
  clearTagSelectionBtn?.addEventListener('click', () => {
    setSelectedTags([]);
    resetLearning();
    if (!quizPanel.classList.contains('hidden')) startQuiz();
  });
  reviewModeSelect?.addEventListener('change', () => {
    resetLearning();
    if (!quizPanel.classList.contains('hidden')) startQuiz();
  });
  directionSelect?.addEventListener('change', () => {
    if (!quizPanel.classList.contains('hidden')) startQuiz();
  });
  quizCountSelect?.addEventListener('change', () => {
    if (!quizPanel.classList.contains('hidden')) startQuiz();
  });
  
  searchInput?.addEventListener('input', renderVocabList);
  searchInput?.addEventListener('change', renderVocabList);
  searchInput?.addEventListener('search', renderVocabList);
  searchInput?.addEventListener('compositionend', renderVocabList);
  quizTypeSelect?.addEventListener('change', showQuestion);
  flipBtn?.addEventListener('click', () => {
    isFlipped = !isFlipped;
    renderFlashcard();
  });
  flashSpeakBtn?.addEventListener('click', () => {
    if (currentFlashcard) {
      playListenWord(currentFlashcard.english);
    }
  });
  prevBtn?.addEventListener('click', () => changeCard(-1));
  nextBtn?.addEventListener('click', () => changeCard(1));
  submitTyping?.addEventListener('click', submitTypingAnswer);
  listenButton?.addEventListener('click', () => playListenWord(currentQuestion.english));
  submitListen?.addEventListener('click', submitListenAnswer);
  nextQuizBtn?.addEventListener('click', nextQuizQuestion);
  restartBtn?.addEventListener('click', startQuiz);

  newWordCategory?.addEventListener('focus', () => {
    refreshNewWordCategoryPanel();
    openFieldPanel(newWordCategoryPanel);
  });
  newWordCategory?.addEventListener('click', () => {
    refreshNewWordCategoryPanel();
    openFieldPanel(newWordCategoryPanel);
  });
  newWordCategory?.addEventListener('input', () => {
    refreshNewWordCategoryPanel();
    openFieldPanel(newWordCategoryPanel);
  });
  newWordEng?.addEventListener('keydown', event => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    focusNewWordField(newWordVn, null);
  });
  newWordVn?.addEventListener('keydown', event => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    focusNewWordField(newWordCategory, newWordCategoryPanel, refreshNewWordCategoryPanel);
  });
  newWordCategory?.addEventListener('keydown', event => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    focusNewWordField(newWordTagsInput, newWordTagsPanel, refreshNewWordTagsPanel);
  });

  newWordTagsInput?.addEventListener('focus', () => {
    refreshNewWordTagsPanel();
    openFieldPanel(newWordTagsPanel);
  });
  newWordTagsInput?.addEventListener('click', () => {
    refreshNewWordTagsPanel();
    openFieldPanel(newWordTagsPanel);
  });
  newWordTagsInput?.addEventListener('input', () => {
    refreshNewWordTagsPanel();
    openFieldPanel(newWordTagsPanel);
  });
  newWordExamplesInput?.addEventListener('focus', () => {
    refreshNewWordExamplesPanel();
    openFieldPanel(newWordExamplesPanel);
  });
  newWordExamplesInput?.addEventListener('click', () => {
    refreshNewWordExamplesPanel();
    openFieldPanel(newWordExamplesPanel);
  });
  newWordExamplesInput?.addEventListener('input', () => {
    refreshNewWordExamplesPanel();
    openFieldPanel(newWordExamplesPanel);
  });
  
  // Tag input listeners
  addTagBtn?.addEventListener('click', () => {
    if (newWordTagsInput.value.trim()) {
      addTag(newWordTagsInput.value.trim());
    }
  });
  
  newWordTagsInput?.addEventListener('keydown', event => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    if (newWordTagsInput.value.trim()) {
      addTag(newWordTagsInput.value.trim());
    }
  });

  newWordExamplesInput?.addEventListener('keydown', event => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    if (newWordExamplesInput.value.trim()) {
      addExample(newWordExamplesInput.value.trim());
    }
  });
  
  addWordBtn?.addEventListener('click', addNewWord);
  exportBtn?.addEventListener('click', exportData);
  importBtn?.addEventListener('click', () => importFileInput?.click());
  importFileInput?.addEventListener('change', event => {
    const file = event.target.files?.[0];
    if (file) importData(file);
    if (importFileInput) importFileInput.value = '';
  });

  // Device modal events
  deviceToggleBtn?.addEventListener('click', showDeviceModal);
  deviceMobileBtn?.addEventListener('click', () => { applyDevice('mobile'); closeDeviceModalWindow(); });
  deviceDesktopBtn?.addEventListener('click', () => { applyDevice('desktop'); closeDeviceModalWindow(); });
  closeDeviceModal?.addEventListener('click', closeDeviceModalWindow);
  deviceModal?.addEventListener('click', event => { if (event.target === deviceModal) closeDeviceModalWindow(); });
  document.addEventListener('click', event => {
    if (!categorySelectPanel || !categorySelectToggle) return;
    if (categorySelectPanel.classList.contains('hidden')) return;
    const clickedInside = categorySelectPanel.contains(event.target) || categorySelectToggle.contains(event.target);
    if (!clickedInside) {
      setCategoryPanelOpen(false);
    }
  });
  document.addEventListener('click', event => {
    if (!tagSelect || !tagSelectToggle) return;
    if (tagSelect.classList.contains('hidden')) return;
    const clickedInside = tagSelect.contains(event.target) || tagSelectToggle.contains(event.target);
    if (!clickedInside) {
      setTagPanelOpen(false);
    }
  });
  document.addEventListener('click', event => {
    const clickedCategory = newWordCategoryPanel?.contains(event.target) || newWordCategory?.contains(event.target);
    const clickedTags = newWordTagsPanel?.contains(event.target) || newWordTagsInput?.contains(event.target);
    const clickedExamples = newWordExamplesPanel?.contains(event.target) || newWordExamplesInput?.contains(event.target);
    if (!clickedCategory) {
      closeFieldPanel(newWordCategoryPanel);
    }
    if (!clickedTags) {
      closeFieldPanel(newWordTagsPanel);
    }
    if (!clickedExamples) {
      closeFieldPanel(newWordExamplesPanel);
    }
  });
  
  // Modal events
  closeEditModal.addEventListener('click', closeEditModalWindow);
  cancelEditWord.addEventListener('click', closeEditModalWindow);
  
  // Edit tag input listeners
  editAddTagBtn?.addEventListener('click', () => {
    if (editWordTagsInput.value.trim()) {
      addEditTag(editWordTagsInput.value.trim());
    }
  });
  
  editWordTagsInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (editWordTagsInput.value.trim()) {
        addEditTag(editWordTagsInput.value.trim());
      }
    }
  });
  
  saveEditWord.addEventListener('click', saveEditWordChanges);
  editModal.addEventListener('click', event => {
    if (event.target === editModal) closeEditModalWindow();
  });
  
  typingInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') submitTypingAnswer();
  });
  listenInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') submitListenAnswer();
  });
}

function init() {
  initDarkMode();
  initDevicePreference();
  loadVocab();
  syncFirebase();
  console.log("Load Firebase xong");
  populateCategoryOptions();
  renderVocabList();
  renderStats();
  setMode('learn');
  addEventListeners();
}

init();

