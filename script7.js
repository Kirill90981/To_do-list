const form = document.getElementById('card-form');
const input = document.getElementById('card-input');
const addBtn = document.getElementById('add-btn');
const clearBtn= document.getElementById('clear-btn');
const cardsRoot= document.getElementById('cards');

let cards = [];
let lastSnapshot = null;

init();


function init() {

try{
	const raw = localStorage.getItem('cards');
	cards = raw ? JSON.parse(raw) : [];	
}   catch (e) {
	console.warn('Не удалось прочитать localStorage, начнём с пустого набора', e);
    cards = [];

}
 render();
 form.addEventListener('submit', onAdd);
 clearBtn.addEventListener('click', onClearAll);

cardsRoot.addEventListener('click', onCardsClick);
cardsRoot.addEventListener('keydown',onCardsKeydown);
cardsRoot.addEventListener('blur',onCardsBlur, true);

}
function persist() {
  try {
    localStorage.setItem('cards', JSON.stringify(cards));
     }  catch (e) { 
     console.warn('Не удалось сохранить в localStorage');
  }
}


function render() {
cardsRoot.innerHTML = '';



 if (!cards.length) {
const empty = document.createElement('div');
empty.className = 'badge';
empty.innerHTML = 'Пока пусто. Добавьте первую карточку';
cardsRoot.appendChild(empty);
return;
 }

for (const card of cards) {
	cardsRoot.appendChild(createCardElement(card));

  }
}

function createCardElement(card) {
 const wrapper = document.createElement('aticle');
 wrapper.classname = 'card';
 wrapper.setAttribute('role', 'listitem');
 wrapper.dataset.id = card.id;

const text = document.createElement('div');
text.className = 'card-text';
text.setAttribute('contenteditable', 'true');
text.setAttribute('spellcheck', 'false');
text.setAttribute('aria-label', 'Текст карточки (редактируемый)');
text.textContent = card.text;


const actions = document.createElement('div');
actions.className = 'card-actions';


const editBtn = document.createElement('button');
editBtn.className = 'icons-btn';
editBtn.type = 'button';
editBtn.title = 'Редактировать';
editBtn.setAttribute('aria-label', 'Редактировать');
editBtn.dataset.action = 'edit';
editBtn.innerHTML = '<span class="icon">✏️</span>';

const delBtn = document.createElement('button');
delBtn.className = 'icon-btn';
delBtn.type = 'button';
delBtn.title = 'Удалить';
delBtn.setAttribute('aria-label', 'Удалить');
delBtn.dataset.action = 'delete';
delBtn.innerHTML = '<span class="icon">🚮💩</span>';

actions.append(editBtn, delBtn);

const badge = document.createElement('div');
badge.className = 'babge';
badge.innerHTML = 'Двойной клик по тексту - начать Редактирование. Enter-редактировать, delete-удалить';


wrapper.append(text, actions, badge);
return wrapper;
}

function onAdd(e) {
e.preventDefault();
const val = (input.value || '').trim();
if (!val) {
  input.focus()
  return;
}
const card = { id: genId(), text: val };
cards.unshift(card);
persist();
render();
input.value = '';
input.focus();
}
 function onClearAll() {
  if(!cards.length) return;
  if(!confirm('Удалить все карточки')) return;
  cards = [];
  persist();
  render();
 }


 function onCardsClick(e) {
 const actionBtn = e.target.closest('[data-action]');
 const cardEl = e.target.closest('.card');
 if (!cardEl) return;
 const id = cardEl.dataset.id;
 if(actionBtn) {
 	const action = actionBtn.dataset.action;
 	if (action === 'delete') {
 		removeCard(id);
 	} else if (action === 'edit') {
 		startEdit(cardEl);
 	}
 	return;
 }
   const textEl = e.target.closest('.card-text');
   if (textEl && e.detail === 2) {
   	startEdit(cardEl);

   }
 }
 function onCardsKeydown(e) {
  const textEl = e.target.closest('.card-text');
  const cardEl = e.target.closest('.card');
  if (!textEl || !cardEl) return;

  if (e.key === 'Enter') {
   e.preventDefault();
   finishEdit(cardEl,/* cancel - */ false);
  }

 if (e.key === 'Escape') {
   e.preventDefault();
   finishEdit(cardEl,/* cancel - */ true);
   }
 }

function onCardsBlur(e) {
  const textEl = e.target.closest('.card-text');
  if (!textEl) return;
  const cardEl = textEl.closest('.card');
  if (!cardEl) return;
  finishEdit(cardEl,/* cancel - */ false);
}


function removeCard(id) {
 const i = cards.findIndex(c => c.id === id);
 if (i === -1) return;
 cards.splice(i, 1);
 persist();
 render();
}
function startEdit(cardEl) {
 const id = cardEl.dataset.id;
 const textEl = cardEl.querySelector('.card-text');
 if (!textEl) return;

lastSnapshot = textEl.textContent;


textEl.focus();
placeCaretAtEnd(textEl);

cardEl.setAttribute('aria-busy', 'true');

}
function finishEdit(cardEl, cancel = false) {
const id = cardEl.dataset.id;
const textEl = cardEl.querySelector('card-text');
if(!textEl) return;

if(cancel && lastSnapshot !== null) {

textEl.textContent = lastSnapshot;
} else {
const next = (textEl.textContent || '').trim();
const idx = cards.findIndex(c => c.id === id);
if (idx !== -1) {
 if(!next) {
cards.splice(idx, 1);
} else {
cards[idx].text = next;
 }
persist();
  }
}
lastSnapshot = null;
cardEl.removeAttribute('aria-busy');
render();
}

function genId() {
	return 'c_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function placeCaretAtEnd(el) {
el.focus();
const range = document.createRange();
range.SelectNodeContents(el);
range.collapse(false);
const sel = window.getSelection();
sel.removeAllRanges();
sel.addRange(range);
}

