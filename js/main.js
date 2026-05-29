/* ==========================================
   Glow Era - Main JavaScript v2.0
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* =============================================
     CUSTOM CURSOR
     ============================================= */
  const cursor = document.getElementById('cursor');
  const cursorRing = document.getElementById('cursor-ring');

  if (cursor && cursorRing) {
    let mx = 0, my = 0, rx = 0, ry = 0;

    document.addEventListener('mousemove', e => {
      mx = e.clientX;
      my = e.clientY;
      cursor.style.left = mx + 'px';
      cursor.style.top = my + 'px';
    });

    function animRing() {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      cursorRing.style.left = rx + 'px';
      cursorRing.style.top = ry + 'px';
      requestAnimationFrame(animRing);
    }
    animRing();

    document.querySelectorAll('a, button, .product-card, .filter-btn, .option-btn, .quantity-btn, .remove-btn, .btn, .social-link, .nav-cta').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.style.width = '20px';
        cursor.style.height = '20px';
        cursorRing.style.width = '60px';
        cursorRing.style.height = '60px';
        cursorRing.style.opacity = '0.3';
      });
      el.addEventListener('mouseleave', () => {
        cursor.style.width = '10px';
        cursor.style.height = '10px';
        cursorRing.style.width = '36px';
        cursorRing.style.height = '36px';
        cursorRing.style.opacity = '0.5';
      });
    });
  }

  /* =============================================
     NAVBAR SCROLL EFFECT
     ============================================= */
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    });
  }

  /* =============================================
     REVEAL ON SCROLL
     ============================================= */
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          revealObserver.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });

    reveals.forEach(el => revealObserver.observe(el));
  }

  /* =============================================
     DATA LOADING (from CMS-managed JSON files)
     ============================================= */

  // Load site settings
  loadSettings();

  // Load and render products on product-related pages
  if (document.querySelector('.products-grid') || document.querySelector('.shop-grid')) {
    loadProducts();
  }

  // Load and render blog posts on blog pages
  if (document.querySelector('.blog-grid') || document.querySelector('.blog-post-container')) {
    loadBlogPosts();
  }

  /* ----- Load Settings ----- */
  async function loadSettings() {
    try {
      const res = await fetch('data/settings.json?t=' + Date.now());
      if (!res.ok) return;
      const data = await res.json();
      // Settings loaded for future use (e.g. site-wide text)
    } catch (e) {
      // Settings not found, using defaults
    }
  }

  /* ----- Load Products ----- */
  async function loadProducts() {
    try {
      const res = await fetch('data/products.json?t=' + Date.now());
      if (!res.ok) return;
      const data = await res.json();
      const products = data.products || [];

      // Render featured products (home page)
      const featuredGrid = document.querySelector('.products-grid.featured');
      if (featuredGrid) {
        const featured = products.filter(p => p.featured);
        if (featured.length) {
          featuredGrid.innerHTML = featured.map(p => renderProductCard(p)).join('');
        } else {
          featuredGrid.innerHTML = '<p style="text-align: center; grid-column: 1 / -1; color: var(--muted); padding: 4rem 0;">No featured products yet. Add some in the admin panel.</p>';
        }
      }

      // Render shop grid (shop page)
      const shopGrid = document.querySelector('.shop-grid');
      if (shopGrid) {
        if (products.length) {
          shopGrid.innerHTML = products.map(p => renderProductCard(p)).join('');
        } else {
          shopGrid.innerHTML = '<p style="text-align: center; grid-column: 1 / -1; color: var(--muted); padding: 4rem 0;">No products yet. Add your first product in the <a href="/admin/" style="color: var(--rose);">admin panel</a>.</p>';
        }
      }

      // Render single product detail (product.html?id=X)
      const productDetailGrid = document.getElementById('product-detail-grid');
      if (productDetailGrid) {
        const params = new URLSearchParams(window.location.search);
        const productId = params.get('id');
        if (productId) {
          const product = products.find(p => p.id === productId);
          if (product) {
            renderProductDetail(product, productDetailGrid);
          }
        }
      }

      // Re-bind event listeners for dynamic content
      bindProductButtons();
    } catch (e) {
      console.log('Could not load products');
      const shopGrid = document.querySelector('.shop-grid');
      if (shopGrid && !shopGrid.children.length) {
        shopGrid.innerHTML = '<p style="text-align: center; grid-column: 1 / -1; color: var(--muted); padding: 4rem 0;">Unable to load products. Please check your data files.</p>';
      }
    }
  }

  /* ----- Render single product detail page ----- */
  function renderProductDetail(product, container) {
    const stars = '★'.repeat(Math.floor(product.rating)) + (product.rating % 1 >= 0.5 ? '½' : '');
    const priceHtml = product.originalPrice
      ? `<span style="text-decoration: line-through; color: var(--muted); font-weight: 300;">$${product.originalPrice.toFixed(2)}</span> $${product.price.toFixed(2)}`
      : `$${product.price.toFixed(2)}`;

    document.title = `${product.name} — Glow Era`;
    document.querySelector('meta[name="description"]').content = product.description || `View ${product.name} at Glow Era.`;

    // Update breadcrumb
    const breadcrumbSpan = document.getElementById('breadcrumb-name');
    if (breadcrumbSpan) breadcrumbSpan.textContent = product.name;

    container.innerHTML = `
      <div class="product-gallery">
        <div class="product-main-image">
          <div class="placeholder-img" style="background: ${product.imageBg}; display: flex; align-items: center; justify-content: center; font-size: 5rem; color: #c08080;">${product.image}</div>
        </div>
        <div class="product-thumbnails">
          <div class="product-thumbnail active">
            <div class="placeholder-img" style="background: ${product.imageBg};"></div>
          </div>
          <div class="product-thumbnail">
            <div class="placeholder-img" style="background: linear-gradient(135deg, #e8c4c4, #d4a0a0);"></div>
          </div>
          <div class="product-thumbnail">
            <div class="placeholder-img" style="background: linear-gradient(135deg, #faf3eb, #f5e6d0);"></div>
          </div>
          <div class="product-thumbnail">
            <div class="placeholder-img" style="background: linear-gradient(135deg, #c9a96e, #f5e6d0);"></div>
          </div>
        </div>
      </div>
      <div class="product-info-detail">
        <span class="product-cat">${capitalize(product.category)}</span>
        <h1>${product.name}</h1>
        <div class="rating">${stars} <span>(${product.reviews} reviews)</span></div>
        <p class="price">${priceHtml}</p>
        <p class="product-description">${product.description || 'No description available.'}</p>
        <div class="product-options">
          <span class="option-label">Size</span>
          <div class="option-buttons">
            <button class="option-btn active">30ml</button>
            <button class="option-btn">50ml — $${(product.price * 1.4).toFixed(2)}</button>
          </div>
        </div>

        <div class="quantity-selector detail-qty">
          <span class="option-label">Quantity</span>
          <div style="display: flex; align-items: center; gap: 1rem; margin-top: 0.5rem;">
            <button class="detail-qty-btn" data-detail-qty="minus" style="width: 38px; height: 38px; border-radius: 50%; border: 1px solid var(--nude); background: transparent; cursor: pointer; font-size: 1rem; transition: all 0.3s;">−</button>
            <span class="detail-qty-count" style="font-size: 1rem; font-weight: 500; min-width: 30px; text-align: center;">1</span>
            <button class="detail-qty-btn" data-detail-qty="plus" style="width: 38px; height: 38px; border-radius: 50%; border: 1px solid var(--nude); background: transparent; cursor: pointer; font-size: 1rem; transition: all 0.3s;">+</button>
          </div>
        </div>
        <div class="product-actions-detail">
          <button class="btn btn-primary" data-add-cart
            data-product-id="${product.id}"
            data-product-name="${product.name}"
            data-product-price="${product.price}"
            data-product-image="${product.image}"
            data-product-image-bg="${product.imageBg}"
            data-product-category="${product.category}">Add to Cart — $${product.price.toFixed(2)}</button>
          <button class="btn btn-secondary" style="flex: 0.3;" data-wishlist>🤍</button>
        </div>
        <div class="product-perks">
          <div class="perk"><span class="perk-icon">🚚</span><span class="perk-text">Free shipping on orders over $50</span></div>
          <div class="perk"><span class="perk-icon">🔄</span><span class="perk-text">30-day easy returns</span></div>
          <div class="perk"><span class="perk-icon">🌱</span><span class="perk-text">100% clean & cruelty-free ingredients</span></div>
        </div>
      </div>
    `;
  }

  /* ----- Load Blog Posts ----- */
  async function loadBlogPosts() {
    try {
      const res = await fetch('data/blog-posts.json?t=' + Date.now());
      if (!res.ok) return;
      const data = await res.json();
      const posts = data.posts || [];

      // Render blog listing (blog.html)
      const blogGrid = document.querySelector('.blog-grid');
      if (blogGrid) {
        if (posts.length) {
          blogGrid.innerHTML = posts.map(p => renderBlogCard(p)).join('');
        } else {
          blogGrid.innerHTML = '<p style="text-align: center; grid-column: 1 / -1; color: var(--muted); padding: 4rem 0;">No blog posts yet. Write your first post in the <a href="/admin/" style="color: var(--rose);">admin panel</a>.</p>';
        }
      }

      // Render single blog post (blog-post.html)
      const postContainer = document.querySelector('.blog-post-container');
      if (postContainer) {
        const params = new URLSearchParams(window.location.search);
        const postId = params.get('id');
        if (postId) {
          const post = posts.find(p => p.id === postId);
          if (post) {
            renderSinglePost(post, postContainer);
          } else {
            postContainer.innerHTML = '<p style="text-align: center; padding: 4rem; color: var(--muted);">Post not found.</p>';
          }
        } else if (posts.length) {
          renderSinglePost(posts[0], postContainer);
        }
      }
    } catch (e) {
      console.log('Could not load blog posts');
      const blogGrid = document.querySelector('.blog-grid');
      if (blogGrid && !blogGrid.children.length) {
        blogGrid.innerHTML = '<p style="text-align: center; grid-column: 1 / -1; color: var(--muted); padding: 4rem 0;">Unable to load blog posts. Please check your data files.</p>';
      }
      const postContainer = document.querySelector('.blog-post-container');
      if (postContainer && !postContainer.querySelector('.blog-post-header')) {
        postContainer.innerHTML = '<p style="text-align: center; padding: 4rem; color: var(--muted);">Post not found or unable to load.</p>';
      }
    }
  }

  /* ----- Render a product card (new design) ----- */
  function renderProductCard(p) {
    const badgeHtml = p.badge ? `<span class="product-badge${p.badge === 'Sold Out' ? ' sold-out' : ''}">${p.badge}</span>` : '';
    const priceHtml = p.originalPrice
      ? `$${p.price.toFixed(2)} <span class="original">$${p.originalPrice.toFixed(2)}</span>`
      : `$${p.price.toFixed(2)}`;
    const stars = '★'.repeat(Math.floor(p.rating)) + (p.rating % 1 >= 0.5 ? '½' : '');
    const decoIcon = ['✿', '❋', '✦', '◈', '⟡', '✶'][Math.floor(Math.random() * 6)];

    return `
      <div class="product-card" data-category="${p.category}">
        ${badgeHtml}
        <div class="product-img">
          <a href="product.html?id=${p.id}">
            <div class="product-img-inner">
              <div class="placeholder-img" style="background: ${p.imageBg}; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 4rem; color: #c08080;">${p.image}</div>
            </div>
          </a>
          <div class="product-overlay">
            <button class="product-overlay-btn" data-add-cart
              data-product-id="${p.id}"
              data-product-name="${p.name}"
              data-product-price="${p.price}"
              data-product-image="${p.image}"
              data-product-image-bg="${p.imageBg}"
              data-product-category="${p.category}">Add to Bag</button>
            <button class="wishlist-btn" data-wishlist>♡ Wishlist</button>
          </div>
        </div>
        <div class="product-info">
          <p class="product-cat">${capitalize(p.category)}</p>
          <p class="product-name"><a href="product.html?id=${p.id}">${p.name}</a></p>
          <div class="product-rating">${stars}</div>
          <p class="product-price">${priceHtml}</p>
        </div>
      </div>
    `;
  }

  /* ----- Render a blog card (listing page) ----- */
  function renderBlogCard(post) {
    return `
      <article class="blog-card">
        <a href="blog-post.html?id=${post.id}">
          <div class="blog-card-image">
            <div class="placeholder-img" style="background: ${post.imageBg}; display: flex; align-items: center; justify-content: center; font-size: 3rem; color: #c08080;">${post.image}</div>
          </div>
          <div class="blog-card-content">
            <span class="blog-card-cat">${post.category}</span>
            <h3>${post.title}</h3>
            <p>${post.excerpt}</p>
            <div class="blog-meta">
              <span>📅 ${post.date}</span>
              <span>👁️ ${post.readTime}</span>
            </div>
            <span class="btn-ghost">Read More</span>
          </div>
        </a>
      </article>
    `;
  }

  /* ----- Render a single blog post ----- */
  function renderSinglePost(post, container) {
    const htmlContent = simpleMarkdownToHtml(post.content);

    container.innerHTML = `
      <div class="blog-post-header">
        <span class="blog-card-cat">${post.category}</span>
        <h1>${post.title}</h1>
        <div class="blog-meta">
          <span>📅 ${post.date}</span>
          <span>👁️ ${post.readTime}</span>
          ${post.author ? `<span>✍️ By ${post.author}</span>` : ''}
        </div>
      </div>
      <div class="blog-post-image">
        <div class="placeholder-img" style="background: ${post.imageBg}; display: flex; align-items: center; justify-content: center; font-size: 5rem; color: #c08080;">${post.image}</div>
      </div>
      <div class="blog-post-content">${htmlContent}</div>
      <div class="blog-post-back">
        <a href="blog.html" class="btn-ghost" style="font-size: 0.75rem;">← Back to Blog</a>
      </div>
    `;
  }

  /* ----- Simple Markdown to HTML converter ----- */
  function simpleMarkdownToHtml(md) {
    if (!md) return '';
    let html = md
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');

    const lines = html.split('\n');
    let result = '';
    let inBlockquote = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) { result += '\n'; continue; }
      if (trimmed.startsWith('<h')) { result += trimmed + '\n'; }
      else if (trimmed.startsWith('<blockquote')) { inBlockquote = true; result += trimmed + '\n'; }
      else if (trimmed.startsWith('</blockquote')) { inBlockquote = false; result += trimmed + '\n'; }
      else if (inBlockquote) { result += trimmed + '<br>\n'; }
      else if (trimmed.startsWith('<') && trimmed.endsWith('>')) { result += trimmed + '\n'; }
      else { result += `<p>${trimmed}</p>\n`; }
    }

    result = result.replace(/<\/blockquote>\n<blockquote>/g, '<br>');
    return result;
  }

  /* =============================================
     INTERACTIONS & BEHAVIOR
     ============================================= */

  /* ----- Mobile Navigation Toggle ----- */
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  const navOverlay = document.createElement('div');
  navOverlay.classList.add('nav-overlay');
  document.body.appendChild(navOverlay);

  function toggleNav() {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
    navOverlay.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
  }

  if (hamburger) {
    hamburger.addEventListener('click', toggleNav);
  }

  navOverlay.addEventListener('click', toggleNav);

  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      if (navLinks.classList.contains('active')) toggleNav();
    });
  });

  /* ----- Cart System (localStorage-based) ----- */

  function getCart() {
    try { return JSON.parse(localStorage.getItem('glow-era-cart')) || []; }
    catch { return []; }
  }

  function saveCart(cart) {
    localStorage.setItem('glow-era-cart', JSON.stringify(cart));
    updateCartBadge();
  }

  function addToCart(product) {
    let cart = getCart();
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      existing.quantity += product.quantity || 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image || '🛍️',
        imageBg: product.imageBg || 'linear-gradient(135deg, #f5e6d0, #e8c4c4)',
        category: product.category || '',
        quantity: product.quantity || 1
      });
    }
    saveCart(cart);
  }

  function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
  }

  function updateCartQuantity(productId, delta) {
    let cart = getCart();
    const item = cart.find(i => i.id === productId);
    if (item) {
      item.quantity += delta;
      if (item.quantity <= 0) {
        cart = cart.filter(i => i.id !== productId);
      }
    }
    saveCart(cart);
  }

  function getCartCount() {
    return getCart().reduce((sum, item) => sum + item.quantity, 0);
  }

  function getCartSubtotal() {
    return getCart().reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  function updateCartBadge() {
    document.querySelectorAll('.cart-count').forEach(el => {
      const count = getCartCount();
      el.textContent = count;
    });
  }

  /* ----- Show Demo Confirmation Message ----- */
  function showConfirmation(title, message) {
    const existing = document.querySelector('.cart-confirmation');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'cart-confirmation';

    overlay.innerHTML = `
      <div class="conf-modal">
        <div class="conf-modal-icon">✨</div>
        <h3>${title}</h3>
        <p>${message}</p>
        <button class="btn btn-primary" id="confirm-ok">Continue Shopping</button>
        <a href="cart.html" class="btn btn-secondary" style="margin-top: 0.75rem; display: inline-block;">View Cart</a>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });

    document.getElementById('confirm-ok').addEventListener('click', () => {
      overlay.remove();
    });
  }

  /* ----- Bind product button events (called after dynamic rendering) ----- */
  function bindProductButtons() {
    // Shop filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.shop-grid .product-card');

    if (filterBtns.length && productCards.length) {
      filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          filterBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          const filter = btn.dataset.filter;
          productCards.forEach(card => {
            if (filter === 'all') {
              card.style.display = 'block';
            } else {
              card.style.display = card.dataset.category === filter ? 'block' : 'none';
            }
          });
        });
      });
    }

    // Add to cart buttons
    document.querySelectorAll('[data-add-cart]').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();

        const product = {
          id: this.dataset.productId,
          name: this.dataset.productName,
          price: parseFloat(this.dataset.productPrice) || 0,
          image: this.dataset.productImage || '🛍️',
          imageBg: this.dataset.productImageBg || 'linear-gradient(135deg, #f5e6d0, #e8c4c4)',
          category: this.dataset.productCategory || '',
          quantity: 1
        };

        if (!product.id) return;

        addToCart(product);

        const originalText = this.textContent;
        this.textContent = '✓ Added';
        setTimeout(() => {
          if (this.classList.contains('product-overlay-btn')) {
            this.textContent = 'Add to Bag';
          } else {
            this.textContent = originalText;
          }
        }, 1500);

        showConfirmation('Added to Cart!', `${product.name} has been added to your cart.`);
      });
    });

    // Wishlist buttons
    document.querySelectorAll('[data-wishlist]').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        this.textContent = this.textContent === '❤️' || this.textContent === '♥ Wishlist' ? '♡ Wishlist' : '♥ Wishlist';
      });
    });
  }

  /* ----- Product Quantity Selector (cart page) ----- */
  // Handled by data-qty-minus / data-qty-plus attributes in renderCartPage

  /* ----- Product Detail Quantity Selector ----- */
  document.addEventListener('click', function(e) {
    const btn = e.target.closest('.detail-qty-btn');
    if (!btn) return;
    const container = btn.closest('.detail-qty');
    if (!container) return;
    const countSpan = container.querySelector('.detail-qty-count');
    if (!countSpan) return;
    let count = parseInt(countSpan.textContent) || 1;
    if (btn.dataset.detailQty === 'minus' && count > 1) {
      count--;
    } else if (btn.dataset.detailQty === 'plus' && count < 99) {
      count++;
    }
    countSpan.textContent = count;
  });

  /* ----- Product Options (Size/Color) ----- */
  document.querySelectorAll('.option-buttons').forEach(group => {
    group.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        group.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  });

  /* ----- Product Thumbnails ----- */
  const thumbnails = document.querySelectorAll('.product-thumbnail');
  if (thumbnails.length) {
    thumbnails.forEach(thumb => {
      thumb.addEventListener('click', () => {
        thumbnails.forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
      });
    });
  }

  /* ----- Newsletter Form ----- */
  const newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const input = this.querySelector('input');
      if (input && input.value.trim()) {
        const btn = this.querySelector('button');
        const originalText = btn.textContent;
        btn.textContent = 'Subscribed! ✦';
        input.value = '';
        setTimeout(() => { btn.textContent = originalText; }, 3000);
      }
    });
  }

  /* ----- Contact Form ----- */
  const contactForm = document.querySelector('.contact-form form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const btn = this.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = 'Message Sent ✓';
      btn.style.background = '#27ae60';
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        this.reset();
      }, 3000);
    });
  }

  /* ----- Render Cart Page ----- */
  function renderCartPage() {
    const cart = getCart();
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartSummary = document.querySelector('.cart-summary');
    const pageHeroP = document.querySelector('.page-hero p');
    if (!cartItemsContainer) return;

    if (!cart.length) {
      cartItemsContainer.innerHTML = `
        <div class="empty-cart">
          <div class="empty-cart-icon">🛒</div>
          <h3>Your Cart is Empty</h3>
          <p>Looks like you haven't added any products yet.</p>
          <a href="shop.html" class="btn btn-primary">Start Shopping</a>
        </div>
      `;
      if (pageHeroP) pageHeroP.textContent = 'Your cart is empty';
      if (cartSummary) cartSummary.style.display = 'none';
      return;
    }

    if (pageHeroP) {
      const totalItems = getCartCount();
      pageHeroP.textContent = `You have ${totalItems} item${totalItems !== 1 ? 's' : ''} in your cart`;
    }
    if (cartSummary) cartSummary.style.display = 'block';

    cartItemsContainer.innerHTML = cart.map(item => `
      <div class="cart-item" data-product-id="${item.id}">
        <div class="cart-item-image">
          <div class="placeholder-img" style="background: ${item.imageBg}; display: flex; align-items: center; justify-content: center; font-size: 2rem; color: #c08080;">${item.image}</div>
        </div>
        <div class="cart-item-info">
          <h3>${item.name}</h3>
          <p class="item-price">$${item.price.toFixed(2)}</p>
        </div>
        <div class="cart-item-actions">
          <button class="remove-btn" data-remove="${item.id}">✕ Remove</button>
          <div class="quantity-selector" style="justify-content: flex-end; margin-top: 0.5rem;">
            <button class="quantity-btn" data-qty-minus="${item.id}" style="width: 30px; height: 30px; font-size: 0.8rem;">−</button>
            <span style="font-size: 0.9rem;">${item.quantity}</span>
            <button class="quantity-btn" data-qty-plus="${item.id}" style="width: 30px; height: 30px; font-size: 0.8rem;">+</button>
          </div>
        </div>
      </div>
    `).join('');

    const subtotal = getCartSubtotal();
    const shipping = subtotal >= 50 ? 0 : 5.99;
    const total = subtotal + shipping;

    let dynamicArea = cartSummary.querySelector('.summary-dynamic');
    if (!dynamicArea) {
      dynamicArea = document.createElement('div');
      dynamicArea.className = 'summary-dynamic';
      const h3 = cartSummary.querySelector('h3');
      if (h3) h3.after(dynamicArea);
    }

    dynamicArea.innerHTML = `
      <div class="summary-row"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
      <div class="summary-row"><span>Shipping</span><span style="${shipping === 0 ? 'color: #27ae60;' : ''}">${shipping === 0 ? 'Free' : '$' + shipping.toFixed(2)}</span></div>
      <div class="summary-row total"><span>Total</span><span>$${total.toFixed(2)}</span></div>
    `;

    document.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = this.dataset.remove;
        const item = this.closest('.cart-item');
        if (item) {
          item.style.transition = 'all 0.3s ease';
          item.style.opacity = '0';
          item.style.transform = 'translateX(20px)';
          setTimeout(() => { removeFromCart(id); renderCartPage(); }, 300);
        }
      });
    });

    document.querySelectorAll('[data-qty-minus]').forEach(btn => {
      btn.addEventListener('click', function() {
        updateCartQuantity(this.dataset.qtyMinus, -1);
        renderCartPage();
      });
    });

    document.querySelectorAll('[data-qty-plus]').forEach(btn => {
      btn.addEventListener('click', function() {
        updateCartQuantity(this.dataset.qtyPlus, 1);
        renderCartPage();
      });
    });

    const checkoutBtn = cartSummary.querySelector('.btn-gold');
    if (checkoutBtn && !checkoutBtn.dataset.checkoutBound) {
      checkoutBtn.dataset.checkoutBound = 'true';
      checkoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        showConfirmation(
          'Order Placed! 🎉',
          'Thank you for your order! This is a demo — your order has been recorded. You will receive a confirmation email shortly.'
        );
      });
    }
  }

  /* ----- Cart Page Rendering ----- */
  if (document.querySelector('.cart-page-section')) {
    renderCartPage();
  }

  // Initialize cart badge
  updateCartBadge();

});

/* ----- Helper: Capitalize ----- */
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
