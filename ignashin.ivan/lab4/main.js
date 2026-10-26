import {Product} from './model.js';

let products = [];

try {
  const saved = localStorage.getItem('products');
  if (saved) {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      products = parsed.map(
        (p) =>
          new Product(
            p.id,
            p.name,
            Array.isArray(p.categories) ? p.categories : [],
            Number(p.price) || 0,
          ),
      );
    }
  }
} catch (e) {
  console.error('Failed to parse localStorage', e);
}

const listElement = document.querySelector('[data-testid="entity-list"]');
const formElement = document.querySelector('form[data-testid="entity-form"]');
const categoryFormElement = document.querySelector('.category-form');

function renderList() {
  listElement.innerHTML = '';
  products.forEach((p) => {
    const card = document.createElement('div');
    card.setAttribute('data-testid', 'entity-card');
    card.className = 'card';

    const title = document.createElement('h3');
    title.textContent = `${p.name || 'Без названия'} (#${p.id ?? '?'})`;
    card.appendChild(title);

    const priceText = document.createElement('p');
    priceText.textContent = `Цена: ${p.price ?? 0}`;
    card.appendChild(priceText);

    const catsTitle = document.createElement('p');
    catsTitle.textContent = `Категории (Всего: ${p.categoryCount}):`;
    card.appendChild(catsTitle);

    const catsContainer = document.createElement('div');
    catsContainer.className = 'categories-container';

    (p.categories || []).forEach((category) => {
      const catBadge = document.createElement('span');
      catBadge.className = 'category-badge';
      catBadge.textContent = category;

      const removeCatBtn = document.createElement('button');
      removeCatBtn.className = 'btn-small btn-danger';
      removeCatBtn.type = 'button';
      removeCatBtn.textContent = '×';
      removeCatBtn.title = 'Удалить категорию';
      removeCatBtn.onclick = () => removeCategoryAsync(p.id, category);

      catBadge.appendChild(removeCatBtn);
      catsContainer.appendChild(catBadge);
    });
    card.appendChild(catsContainer);

    // Основная кнопка удаления карточки по контракту CI
    const deleteBtn = document.createElement('button');
    deleteBtn.setAttribute('data-testid', 'delete-entity');
    deleteBtn.setAttribute('data-id', p.id);
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn-danger';
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

const addCategoryAsync = (productId, category) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const product = products.find((p) => String(p.id) === String(productId));
      if (product) {
        product.addCategory(category);
        saveAndRender();
      }
      resolve();
    }, 150);
  });
};

const removeCategoryAsync = (productId, category) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const product = products.find((p) => String(p.id) === String(productId));
      if (product) {
        product.removeCategory(category);
        saveAndRender();
      }
      resolve();
    }, 150);
  });
};

formElement.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(formElement);

  const rawId = formData.get('id');
  const id =
    rawId !== null && rawId !== '' && !isNaN(Number(rawId))
      ? Number(rawId)
      : rawId;
  const name = formData.get('name') || '';
  const price = Number(formData.get('price')) || 0;

  const categoriesStr = formData.get('categories') || '';
  const categories = categoriesStr
    ? categoriesStr
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean)
    : [];

  addEntityAsync(new Product(id, name, categories, price)).then(() => {
    formElement.reset();
  });
});

if (categoryFormElement) {
  categoryFormElement.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(categoryFormElement);

    const productId = formData.get('productId');
    const category = (formData.get('category') || '').trim();

    if (category) {
      addCategoryAsync(productId, category).then(() => {
        categoryFormElement.reset();
      });
    }
  });
}

listElement.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-testid="delete-entity"]');
  if (btn) {
    const id = btn.getAttribute('data-id');
    deleteEntityAsync(id);
  }
});

renderList();
