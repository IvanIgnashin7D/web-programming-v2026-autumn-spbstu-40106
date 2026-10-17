import { Product } from './model.js';

let products = [];

try {
  const saved = localStorage.getItem('products');
  if (saved) {
    const parsed = JSON.parse(saved);
    products = parsed.map(
      (p) => new Product(p.id, p.name, p.categories, p.price)
    );
  }
} catch (e) {
  console.error('Failed to parse localStorage', e);
}

const listElement = document.querySelector('[data-testid="entity-list"]');
const formElement = document.querySelector('form[data-testid="entity-form"]');

function saveAndRender() {
  localStorage.setItem('products', JSON.stringify(products));
  renderList();
}

function renderList() {
  listElement.innerHTML = '';

  products.forEach((p) => {
    const card = document.createElement('div');
    card.dataset.testid = 'entity-card';
    card.className = 'card';

    const title = document.createElement('h3');
    title.textContent = `${p.name || 'Без названия'} (#${p.id || '?'})`;
    card.appendChild(title);

    const priceText = document.createElement('p');
    priceText.textContent = `Цена: ${p.price || 0}`;
    card.appendChild(priceText);

    const catsText = document.createElement('p');
    catsText.textContent = `Категории (${p.categoryCount}): ${
      Array.isArray(p.categories) && p.categories.length > 0
        ? p.categories.join(', ')
        : 'нет'
    }`;
    card.appendChild(catsText);

    const categoryControls = document.createElement('div');
    categoryControls.className = 'category-controls';

    const catInput = document.createElement('input');
    catInput.type = 'text';
    catInput.placeholder = 'Название категории';
    catInput.className = 'category-input';
    catInput.setAttribute('aria-label', 'Название категории');

    const addCatBtn = document.createElement('button');
    addCatBtn.type = 'button';
    addCatBtn.dataset.action = 'add-category';
    addCatBtn.dataset.id = String(p.id);
    addCatBtn.textContent = 'Добавить категорию';

    const removeCatBtn = document.createElement('button');
    removeCatBtn.type = 'button';
    removeCatBtn.dataset.action = 'remove-category';
    removeCatBtn.dataset.id = String(p.id);
    removeCatBtn.className = 'btn-secondary';
    removeCatBtn.textContent = 'Удалить категорию';

    categoryControls.appendChild(catInput);
    categoryControls.appendChild(addCatBtn);
    categoryControls.appendChild(removeCatBtn);
    card.appendChild(categoryControls);

    const deleteBtn = document.createElement('button');
    deleteBtn.dataset.testid = 'delete-entity';
    deleteBtn.dataset.id = String(p.id);
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn-danger';
    deleteBtn.textContent = 'Удалить товар';
    card.appendChild(deleteBtn);

    listElement.appendChild(card);
  });
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

const addCategoryAsync = (id, category) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const product = products.find((p) => String(p.id) === String(id));
      if (product && category) {
        product.addCategory(category);
        saveAndRender();
      }
      resolve();
    }, 150);
  });
};

const removeCategoryAsync = (id, category) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const product = products.find((p) => String(p.id) === String(id));
      if (product && category) {
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

  const id = formData.get('id');
  const name = formData.get('name');
  const price = Number(formData.get('price')) || 0;

  const categoriesStr = formData.get('categories');
  const categories = categoriesStr
    ? categoriesStr
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean)
    : [];

  addEntityAsync(new Product(id, name, categories, price))
    .then(() => {
      formElement.reset();
    })
    .catch((err) => {
      console.error(err);
    });
});

listElement.addEventListener('click', (e) => {
  const target = e.target;
  if (!(target instanceof HTMLElement)) return;

  if (target.dataset.testid === 'delete-entity') {
    const id = target.dataset.id;
    void deleteEntityAsync(id);
    return;
  }

  if (target.dataset.action === 'add-category') {
    const id = target.dataset.id;
    const card = target.closest('.card');
    const input = card?.querySelector('.category-input');
    const category = input?.value.trim();
    if (category) {
      void addCategoryAsync(id, category);
    }
    return;
  }

  if (target.dataset.action === 'remove-category') {
    const id = target.dataset.id;
    const card = target.closest('.card');
    const input = card?.querySelector('.category-input');
    const category = input?.value.trim();
    if (category) {
      void removeCategoryAsync(id, category);
    }
  }
});

renderList();