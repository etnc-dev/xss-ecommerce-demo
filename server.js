const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql2/promise');

const app = express();
const PORT = 3000;

// MySQL connection pool - adjust user/password if needed
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',       // change if your MySQL user is different
  password: '',       // put your MySQL password here if set
  database: 'xss_shop'
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Simple template helper (no escaping -> XSS-friendly)
function render(view, data = {}) {
  const fs = require('fs');
  const layout = fs.readFileSync(path.join(__dirname, 'views', 'layout.html'), 'utf8');
  const content = fs.readFileSync(path.join(__dirname, 'views', view), 'utf8');
  let html = layout.replace('@@CONTENT@@', content);

  // Very naive variable replace: {{key}}
  Object.keys(data).forEach((key) => {
    // NOTE: no HTML escaping here → still vulnerable
    const value = String(data[key]);
    html = html.split(`{{${key}}}`).join(value);
  });

  return html;
}

// Home page: list products from DB
app.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products');
    let productListHtml = '';

    rows.forEach(p => {
      productListHtml += `
        <div class="card mb-3">
          <div class="card-body">
            <h5 class="card-title">${p.name}</h5>
            <p class="card-text">${p.description}</p>
            <p><strong>$${p.price}</strong></p>
            <a href="/product/${p.id}" class="btn btn-primary">View Product</a>
          </div>
        </div>
      `;
    });

    res.send(render('index.html', { productList: productListHtml }));
  } catch (err) {
    console.error(err);
    res.status(500).send('DB error');
  }
});

// Product page with STORED XSS in reviews
app.get('/product/:id', async (req, res) => {
  const id = Number(req.params.id);

  try {
    const [[product]] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    if (!product) return res.status(404).send('Product not found');

    const [reviewRows] = await pool.query(
      'SELECT content FROM reviews WHERE product_id = ? ORDER BY created_at DESC',
      [id]
    );

    // Build review HTML – directly inserting review text (vulnerable)
    let reviewHtml = '';
    if (reviewRows.length > 0) {
      reviewRows.forEach(r => {
        reviewHtml += `<li class="list-group-item">${r.content}</li>`;
      });
    } else {
      reviewHtml = '<li class="list-group-item">No reviews yet.</li>';
    }

    const pageHtml = render('product.html', {
      productName: product.name,
      productDesc: product.description,
      productPrice: product.price,
      productId: product.id,
      reviewList: reviewHtml
    });

    res.send(pageHtml);
  } catch (err) {
    console.error(err);
    res.status(500).send('DB error');
  }
});

// POST review – STORED XSS: we save raw HTML/script in DB
app.post('/product/:id/review', async (req, res) => {
  const id = Number(req.params.id);
  const text = req.body.review || '';

  try {
    // VULNERABLE: store unsanitized content
    await pool.query(
      'INSERT INTO reviews (product_id, content) VALUES (?, ?)',
      [id, text]
    );

    res.redirect(`/product/${id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('DB error');
  }
});

// Reflected XSS in search – search in DB
app.get('/search', async (req, res) => {
  const q = req.query.q || '';

  try {
    // Using LIKE for simple search
    const [rows] = await pool.query(
      'SELECT * FROM products WHERE name LIKE ?',
      [`%${q}%`]
    );

    let resultHtml = '';
    if (rows.length > 0) {
      rows.forEach(p => {
        resultHtml += `
          <div class="card mb-2">
            <div class="card-body">
              <h5>${p.name}</h5>
              <a href="/product/${p.id}" class="btn btn-sm btn-secondary">View</a>
            </div>
          </div>
        `;
      });
    } else {
      resultHtml = '<p>No products found.</p>';
    }

    const pageHtml = render('search.html', {
      searchQuery: q,      // still reflected unsafely
      searchResults: resultHtml
    });

    res.send(pageHtml);
  } catch (err) {
    console.error(err);
    res.status(500).send('DB error');
  }
});

// Checkout page – DOM-based XSS (unchanged)
app.get('/checkout', (req, res) => {
  const pageHtml = render('checkout.html');
  res.send(pageHtml);
});

app.listen(PORT, () => {
  console.log(`Vulnerable XSS demo (with MySQL) running on http://localhost:${PORT}`);
});
