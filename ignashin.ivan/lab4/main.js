import {Product} from './model.js';

let products = [];

try {
  const saved = localStorage.getItem('products');
  if (saved) {
    const parsed = JSON.parse(saved);
    products = parsed.map(
      (p) => new Product(p.id, p.name, p.categories, p.price),
    );
  }
} catch (e) {
  console.error('Failed to parse localStorage', e);
}

const listElement = document.querySelector('[data-testid="entity-list"]');
const formElement = document.querySelector('form[data-testid="entity-form"]');

function renderList() {
  listElement.innerHTML = '';
  products.forEach((p) => {
    const card = document.createElement('div');
    card.setAttribute('data-testid', 'entity-card');
    card.className = 'card';

    const title = document.createElement('h3');
    title.textContent = `${p.name || 'Без названия'} (#${p.id || '?'})`;
    card.appendChild(title);

    const priceText = document.createElement('p');
    priceText.textContent = `Цена: ${p.price || 0}`;
    card.appendChild(priceText);

    const catsText = document.createElement('p');
    catsText.textContent = `Категории: ${
      Array.isArray(p.categories) ? p.categories.join(', ') : ''
    }`;
    card.appendChild(catsText);

    const deleteBtn = document.createElement('button');
    deleteBtn.setAttribute('data-testid', 'delete-entity');
    deleteBtn.setAttribute('data-id', p.id);
    deleteBtn.type = 'button';
    deleteBtn.textContent = 'Удалить';
    card.appendChild(deleteBtn);

    listElement.appendChild(card);
  });
}

function saveAndRender() {
  localStorage.setItem('products', JSON.stringify(products));
  renderList();
}

const addEntityAsync = (product) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      products.push(product);
      saveAndRender();
      resolve();
    }, 150);
  });
};

const deleteEntityAsync = (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      products = products.filter((p) => String(p.id) !== String(id));
      saveAndRender();
      resolve();
    }, 150);
  });
};

formElement.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(formElement);

  const id = formData.get('id');
  const name = formData.get('name');
  const price = Number(formData.get('price')) || 0;

  const categoriesStr = formData.get('categories');
  const categories = categoriesStr
    ? categoriesStr.split(',').map((c) => c.trim())
    : [];

  addEntityAsync(new Product(id, name, categories, price)).then(() => {
    formElement.reset();
  });
});

listElement.addEventListener('click', (e) => {
  if (
    e.target.hasAttribute('data-testid') &&
    e.target.getAttribute('data-testid') === 'delete-entity'
  ) {
    const id = e.target.getAttribute('data-id');
    deleteEntityAsync(id);
  }
});

renderList();
