const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const viewsDir = path.join(root, 'views');
const publicDir = path.join(root, 'public');
const outDir = path.join(root, 'docs');

function ensureDir(d) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

function readView(name) {
  return fs.readFileSync(path.join(viewsDir, name), 'utf8');
}

function readLayout() {
  return fs.readFileSync(path.join(viewsDir, 'layout.html'), 'utf8');
}

function renderContent(contentHtml, data = {}) {
  let html = readLayout().replace('@@CONTENT@@', contentHtml);
  Object.keys(data).forEach((k) => {
    html = html.split(`{{${k}}}`).join(data[k]);
  });
  return html;
}

ensureDir(outDir);

// Copy public assets
ensureDir(path.join(outDir, 'public'));
if (fs.existsSync(publicDir)) {
  fs.readdirSync(publicDir).forEach(file => {
    fs.copyFileSync(path.join(publicDir, file), path.join(outDir, file));
  });
}

// Build index.html with some sample products
const indexView = readView('index.html');
const sampleProducts = [
  { id: 1, name: 'Sample Widget', description: 'A demo widget', price: '9.99' },
  { id: 2, name: 'Example Gizmo', description: 'Great for testing', price: '14.99' },
  { id: 3, name: 'Test Thing', description: 'Not for production', price: '4.99' }
];

let productListHtml = '';
sampleProducts.forEach(p => {
  productListHtml += `\n  <div class="card mb-3">\n    <div class="card-body">\n      <h5 class="card-title">${p.name}</h5>\n      <p class="card-text">${p.description}</p>\n      <p><strong>$${p.price}</strong></p>\n      <a href="/product-${p.id}.html" class="btn btn-primary">View Product</a>\n    </div>\n  </div>`;
});

const indexHtml = renderContent(indexView, { productList: productListHtml });
fs.writeFileSync(path.join(outDir, 'index.html'), indexHtml);

// Build individual product pages (static samples)
const productView = readView('product.html');
sampleProducts.forEach(p => {
  const reviewList = `\n    <li class="list-group-item">Great product!</li>\n    <li class="list-group-item">Would buy again.</li>`;
  const page = renderContent(productView, {
    productName: p.name,
    productDesc: p.description,
    productPrice: p.price,
    productId: p.id,
    reviewList
  });
  fs.writeFileSync(path.join(outDir, `product-${p.id}.html`), page);
});

// Search page
const searchView = readView('search.html');
const searchPage = renderContent(searchView, {
  searchQuery: '',
  searchResults: '<p>Try searching the product list on the index page.</p>'
});
fs.writeFileSync(path.join(outDir, 'search.html'), searchPage);

// Checkout page
const checkoutView = readView('checkout.html');
const checkoutPage = renderContent(checkoutView);
fs.writeFileSync(path.join(outDir, 'checkout.html'), checkoutPage);

console.log('Static export complete. Files written to docs/');
