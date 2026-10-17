export class Product {
  constructor(id, name, categories = [], price) {
    this.id = id;
    this.name = name;
    this.categories = categories;
    this.price = price;
  }

  addCategory(category) {
    if (!this.categories.includes(category)) {
      this.categories.push(category);
    }
  }

  removeCategory(category) {
    this.categories = this.categories.filter((c) => c !== category);
  }

  get categoryCount() {
    return this.categories.length;
  }
}

export function groupProductsByCategory(products) {
  return products.reduce((acc, product) => {
    const cats = product.categories || [];
    cats.forEach((category) => {
      acc[category] = acc[category] || [];
      acc[category].push(product);
    });
    return acc;
  }, {});
}

export function getUniqueCategories(products) {
  return [...new Set(products.flatMap((p) => p.categories || []))];
}

export function groupProductsByPriceRange(products) {
  return products.reduce((acc, product) => {
    const step = 1000;
    const price = product.price || 0;
    const rangeStart = Math.floor(price / step) * step;
    const key = `${rangeStart}-${rangeStart + step}`;
    acc[key] = acc[key] || [];
    acc[key].push(product);
    return acc;
  }, {});
}

export function findProductsByCategory(products, category) {
  return products.filter((p) => (p.categories || []).includes(category));
}

export function findProductsAbovePrice(products, minPrice) {
  return products.filter((p) => (p.price || 0) > minPrice);
}
