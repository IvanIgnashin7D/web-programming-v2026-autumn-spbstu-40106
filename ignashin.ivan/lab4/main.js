import {Product} from './model.js';

let products = [];

try {
  const saved = localStorage.getItem('products');
  if (saved) {
    const parsed = JSON.parse(saved);
    products = parsed.map(
      (p) => new Product(Number(p.id), p.name, p.categories, Number(p.price)),
    );
  }
} catch (e) {
  console.error('Failed to parse localStorage', e);
}

const listElement = document.querySelector('[data-testid="entity-list"]');
const formElement = document.getElementById('product-form');
const categoryFormElement = document.getElementById('category-form');

function renderList() {
  listElement.innerHTML = '';
  products.forEach((p) => {
    const card = document.createElement('div');
    card.setAttribute('data-testid', 'entity-card');
    card.className = 'card';

    const title = document.createElement('h3');
    title.textContent = `${p.name || 'Без названия'} (ID: ${p.id})`;
    card.appendChild(title);

    const priceText = document.createElement('p');
    priceText.textContent = `Цена: ${p.price || 0} руб.`;
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
      removeCatBtn.textContent = 'Удалить категорию';
      removeCatBtn.onclick = () => removeCategoryAsync(p.id, category);

      catBadge.appendChild(removeCatBtn);
      catsContainer.appendChild(catBadge);
    });
    card.appendChild(catsContainer);

    const deleteBtn = document.createElement('button');
    deleteBtn.setAttribute('data-testid', 'delete-entity');
    deleteBtn.className = 'btn-danger';
    deleteBtn.type = 'button';
    deleteBtn.textContent = 'Удалить товар';
    deleteBtn.onclick = () => deleteEntityAsync(p.id);

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
      if (!products.some((p) => p.id === product.id)) {
        products.push(product);
        saveAndRender();
      } else {
        alert('Товар с таким ID уже существует!');
      }
      resolve();
    }, 150);
  });
};

const deleteEntityAsync = (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      products = products.filter((p) => p.id !== id);
      saveAndRender();
      resolve();
    }, 150);
  });
};

const addCategoryAsync = (productId, category) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const product = products.find((p) => p.id === productId);
      if (product) {
        product.addCategory(category);
        saveAndRender();
      } else {
        alert('Товар с указанным ID не найден!');
      }
      resolve();
    }, 150);
  });
};

const removeCategoryAsync = (productId, category) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const product = products.find((p) => p.id === productId);
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

  const id = Number(formData.get('id'));
  const name = formData.get('name');
  const price = Number(formData.get('price')) || 0;

  addEntityAsync(new Product(id, name, [], price)).then(() => {
    formElement.reset();
  });
});

categoryFormElement.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(categoryFormElement);

  const productId = Number(formData.get('productId'));
  const category = formData.get('category').trim();

  if (category) {
    addCategoryAsync(productId, category).then(() => {
      categoryFormElement.reset();
    });
  }
});

renderList();
