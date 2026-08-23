const defaults = {
  city: 'Астана',

  announcement:
    'Бесплатная доставка по Астане при заказе от 50 000 ₸',

  products: [
    {
      name: 'Herbier · Olive',
      description: 'Спокойные оливковые обои с растительным рисунком. Подойдут для спальни, гостиной или кабинета.',
      price: '18900',
      oldPrice: '',
      kind: 'calm',
      country: 'Италия',
      material: 'Флизелин',
      size: '10 × 0,53 м',
      art: 'wallpaper-garden',
      photo: '',
      isNew: true,
      isHit: false,
      isSale: false
    },
    {
      name: 'Matisse · Coral',
      description: 'Выразительные коралловые обои с современным художественным рисунком.',
      price: '21500',
      oldPrice: '24500',
      kind: 'bold',
      country: 'Бельгия',
      material: 'Флизелин',
      size: '10 × 0,53 м',
      art: 'wallpaper-coral',
      photo: '',
      isNew: false,
      isHit: true,
      isSale: true
    },
    {
      name: 'Grid · Ink',
      description: 'Минималистичные обои с графическим рисунком. Хорошо смотрятся в современных интерьерах.',
      price: '17200',
      oldPrice: '',
      kind: 'calm',
      country: 'Германия',
      material: 'Флизелин',
      size: '10 × 0,53 м',
      art: 'wallpaper-grid',
      photo: '',
      isNew: true,
      isHit: false,
      isSale: false
    },
    {
      name: 'Aegean · Blue',
      description: 'Глубокий синий оттенок и волнообразный рисунок для создания выразительной стены.',
      price: '20400',
      oldPrice: '22400',
      kind: 'bold',
      country: 'Турция',
      material: 'Флизелин',
      size: '10 × 0,53 м',
      art: 'wallpaper-wave',
      photo: '',
      isNew: false,
      isHit: true,
      isSale: true
    },
    {
      name: 'Nordic · Grey',
      description: 'Скандинавский стиль с серыми оттенками. Идеально для спальни.',
      price: '19800',
      oldPrice: '',
      kind: 'calm',
      country: 'Швеция',
      material: 'Флизелин',
      size: '10 × 0,53 м',
      art: 'wallpaper-grid',
      photo: '',
      isNew: true,
      isHit: false,
      isSale: false
    },
    {
      name: 'Bordeaux · Wine',
      description: 'Глубокий бордовый цвет для создания роскошного интерьера.',
      price: '23400',
      oldPrice: '26900',
      kind: 'bold',
      country: 'Франция',
      material: 'Винил',
      size: '10 × 0,53 м',
      art: 'wallpaper-wave',
      photo: '',
      isNew: false,
      isHit: true,
      isSale: true
    },
    {
      name: 'Sage · Green',
      description: 'Нежный шалфейный оттенок для уютной гостиной.',
      price: '18900',
      oldPrice: '',
      kind: 'calm',
      country: 'Италия',
      material: 'Флизелин',
      size: '10 × 0,53 м',
      art: 'wallpaper-garden',
      photo: '',
      isNew: true,
      isHit: false,
      isSale: false
    },
    {
      name: 'Noir · Black',
      description: 'Черные обои с золотым тиснением для акцентной стены.',
      price: '25600',
      oldPrice: '28900',
      kind: 'bold',
      country: 'Бельгия',
      material: 'Винил',
      size: '10 × 0,53 м',
      art: 'wallpaper-wave',
      photo: '',
      isNew: false,
      isHit: true,
      isSale: true
    },
    {
      name: 'Linen · Beige',
      description: 'Текстильные обои с эффектом льна для эко-интерьера.',
      price: '27800',
      oldPrice: '',
      kind: 'calm',
      country: 'Германия',
      material: 'Текстиль',
      size: '10 × 0,53 м',
      art: 'wallpaper-grid',
      photo: '',
      isNew: true,
      isHit: false,
      isSale: false
    },
    {
      name: 'Cobalt · Blue',
      description: 'Яркий синий цвет для смелого интерьера.',
      price: '21900',
      oldPrice: '24900',
      kind: 'bold',
      country: 'Турция',
      material: 'Флизелин',
      size: '10 × 0,53 м',
      art: 'wallpaper-wave',
      photo: '',
      isNew: false,
      isHit: true,
      isSale: true
    }
  ]
};

function getStore() {
  try {
    const saved = JSON.parse(
      localStorage.getItem('stenaSettings') || 'null'
    );

    return saved || defaults;
  } catch {
    return defaults;
  }
}

function format(n) {
  return (
    new Intl.NumberFormat('ru-RU').format(
      Number(String(n).replace(/\s/g, ''))
    ) + ' ₸'
  );
}

// Состояние для пагинации и фильтров
let currentPage = 1;
let itemsPerPage = 8;
let currentFilter = 'all';
let searchQuery = '';
let sortOrder = 'default';
let currentMaterial = 'all';

function applyStore() {
  const s = getStore();

  const announcement =
    document.querySelector('.announcement');

  if (announcement) {
    announcement.innerHTML =
      `${s.announcement} <span>✦</span> Обратный выкуп остатков!`;
  }

  const footer =
    document.querySelector('footer p');

  if (footer) {
    footer.textContent =
      `Обои с характером · ${s.city}, Казахстан`;
  }

  renderProducts();
}

function getFilteredProducts() {
  const s = getStore();
  let products = [...s.products];

  // Фильтр по категории
  if (currentFilter !== 'all') {
    products = products.filter(p => {
      const kind = Array.isArray(p) ? p[2] : p.kind;
      return kind === currentFilter;
    });
  }

  // Фильтр по материалу
  if (currentMaterial !== 'all') {
    products = products.filter(p => {
      const material = Array.isArray(p) ? p[5] : p.material;
      return material === currentMaterial;
    });
  }

  // Поиск
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    products = products.filter(p => {
      const name = (Array.isArray(p) ? p[0] : p.name || '').toLowerCase();
      const description = (p.description || '').toLowerCase();
      return name.includes(query) || description.includes(query);
    });
  }

  // Сортировка
  if (sortOrder === 'price-asc') {
    products.sort((a, b) => {
      const priceA = parseInt(Array.isArray(a) ? a[1] : a.price) || 0;
      const priceB = parseInt(Array.isArray(b) ? b[1] : b.price) || 0;
      return priceA - priceB;
    });
  } else if (sortOrder === 'price-desc') {
    products.sort((a, b) => {
      const priceA = parseInt(Array.isArray(a) ? a[1] : a.price) || 0;
      const priceB = parseInt(Array.isArray(b) ? b[1] : b.price) || 0;
      return priceB - priceA;
    });
  } else if (sortOrder === 'name') {
    products.sort((a, b) => {
      const nameA = (Array.isArray(a) ? a[0] : a.name || '').toLowerCase();
      const nameB = (Array.isArray(b) ? b[0] : b.name || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }

  return products;
}

function renderProducts() {
  const grid = document.querySelector('.products');
  if (!grid) return;

  const filteredProducts = getFilteredProducts();
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  
  // Ограничиваем текущую страницу
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  if (pageProducts.length === 0) {
    grid.innerHTML = `
      <div class="no-results">
        <p>😔</p>
        <h3>Ничего не найдено</h3>
        <p>Попробуйте изменить поисковый запрос или фильтры</p>
      </div>
    `;
    updatePagination(0);
    return;
  }

  grid.innerHTML = pageProducts
    .map((product, i) => {

      let name;
      let price;
      let oldPrice;
      let kind;
      let photo;
      let material;
      let size;
      let art;
      let isNew;
      let isHit;
      let isSale;

      if (Array.isArray(product)) {
        name = product[0];
        price = product[1];
        kind = product[2];
        photo = product[4] || '';
        material = product[5] || 'Флизелин';
        size = product[6] || '10 × 0,53 м';
        art = product[3] || '';
        isNew = product[7] || false;
        isHit = product[8] || false;
        isSale = product[9] || false;
        oldPrice = product[10] || '';
      } else {
        name = product.name;
        price = product.price;
        oldPrice = product.oldPrice || '';
        kind = product.kind;
        photo = product.photo || '';
        material = product.material || 'Флизелин';
        size = product.size || '10 × 0,53 м';
        art = product.art || '';
        isNew = product.isNew || false;
        isHit = product.isHit || false;
        isSale = product.isSale || false;
      }

      const photoStyle = photo
        ? `
          style="
            background-image:url('${photo}');
            background-size:cover;
            background-position:center;
          "
        `
        : '';

      // Формируем бейджи
      let badges = '';
      
      if (isNew) {
        badges += '<span class="product-badge badge-new">Новинка</span>';
      }
      
      if (isHit) {
        badges += '<span class="product-badge badge-hit">Хит продаж</span>';
      }
      
      if (isSale) {
        badges += '<span class="product-badge badge-sale">Скидка</span>';
      }

      // Формируем цену с учетом скидки
      let priceHTML = '';
      
      if (oldPrice && parseInt(oldPrice) > parseInt(price)) {
        priceHTML = `
          <div class="price-block">
            <span class="old-price">${format(oldPrice)}</span>
            <strong class="new-price">${format(price)}</strong>
          </div>
        `;
      } else {
        priceHTML = `<strong>${format(price)}</strong>`;
      }

      return `
        <article
          class="product"
          data-kind="${kind}"
        >
          <div
            class="product-art ${art}"
            ${photoStyle}
          >
            <span class="product-number">
              ${String(startIndex + i + 1).padStart(2, '0')}
            </span>
            ${badges}

            <button
              class="quick-add"
              data-name="${name}"
              data-price="${String(price).replace(/\s/g, '')}"
            >
              В корзину +
            </button>
          </div>

          <div class="product-info">
            <div>
              <h3>${name}</h3>
              <p>${material} · ${size}</p>
            </div>

            ${priceHTML}
          </div>
        </article>
      `;
    })
    .join('');

  updatePagination(totalPages);
}

function updatePagination(totalPages) {
  let pagination = document.querySelector('.pagination');
  
  if (!pagination) {
    pagination = document.createElement('div');
    pagination.className = 'pagination';
    grid.parentNode.insertBefore(pagination, grid.nextSibling);
  }

  if (totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }

  let paginationHTML = '<div class="pagination-buttons">';
  
  // Кнопка "Назад"
  paginationHTML += `
    <button class="page-btn" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>
      ←
    </button>
  `;

  // Номера страниц
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      paginationHTML += `
        <button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">
          ${i}
        </button>
      `;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      paginationHTML += '<span class="page-dots">...</span>';
    }
  }

  // Кнопка "Вперед"
  paginationHTML += `
    <button class="page-btn" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>
      →
    </button>
  `;

  paginationHTML += '</div>';
  
  // Информация о количестве товаров
  const totalItems = getFilteredProducts().length;
  paginationHTML += `<p class="pagination-info">Показано ${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, totalItems)} из ${totalItems} товаров</p>`;

  pagination.innerHTML = paginationHTML;

  // Добавляем обработчики
  pagination.querySelectorAll('.page-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (btn.disabled) return;
      const page = parseInt(btn.dataset.page);
      if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderProducts();
        // Прокрутка к каталогу
        document.querySelector('#catalog').scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

// Инициализация поиска и фильтров
function initSearchAndFilters() {
  const sectionHead = document.querySelector('.section-head');
  if (!sectionHead) return;

  // Создаем панель поиска и фильтров
  const searchFilterHTML = `
    <div class="search-filter-bar">
      <div class="search-box">
        <input type="text" id="searchInput" placeholder="Поиск товаров..." aria-label="Поиск">
        <span class="search-icon">🔍</span>
      </div>
      
      <div class="filter-group">
        <select id="sortSelect" aria-label="Сортировка">
          <option value="default">По умолчанию</option>
          <option value="price-asc">Сначала дешевле</option>
          <option value="price-desc">Сначала дороже</option>
          <option value="name">По алфавиту</option>
        </select>
      </div>
      
      <div class="filter-group">
        <select id="materialFilter" aria-label="Материал">
          <option value="all">Все материалы</option>
          <option value="Флизелин">Флизелин</option>
          <option value="Винил">Винил</option>
          <option value="Текстиль">Текстиль</option>
        </select>
      </div>
    </div>
  `;

  // Вставляем после section-head
  sectionHead.insertAdjacentHTML('afterend', searchFilterHTML);

  // Обработчики событий
  const searchInput = document.querySelector('#searchInput');
  const sortSelect = document.querySelector('#sortSelect');
  const materialFilter = document.querySelector('#materialFilter');

  // Поиск с debounce
  let searchTimeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      searchQuery = e.target.value;
      currentPage = 1;
      renderProducts();
    }, 300);
  });

  // Сортировка
  sortSelect.addEventListener('change', (e) => {
    sortOrder = e.target.value;
    currentPage = 1;
    renderProducts();
  });

  // Фильтр по материалу
  materialFilter.addEventListener('change', (e) => {
    currentMaterial = e.target.value;
    currentPage = 1;
    renderProducts();
  });
}

// Добавляем стили для новых элементов
function addStyles() {
  const style = document.createElement('style');
  style.textContent = `
    /* Бейджи товаров */
    .product-badge {
      position: absolute;
      top: 16px;
      right: 17px;
      padding: 6px 12px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
      z-index: 4;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      white-space: nowrap;
    }
    
    .product-badge.badge-new {
      background: #e74c3c;
      color: white;
    }
    
    .product-badge.badge-hit {
      background: #f39c12;
      color: white;
    }
    
    .product-badge.badge-sale {
      background: #27ae60;
      color: white;
    }
    
    /* Если несколько бейджей - располагаем их вертикально */
    .product-art .product-badge + .product-badge {
      top: 48px;
    }
    
    .product-art .product-badge + .product-badge + .product-badge {
      top: 80px;
    }
    
    /* Блок цены со скидкой */
    .price-block {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 2px;
    }
    
    .old-price {
      font-size: 11px;
      color: #999;
      text-decoration: line-through;
      text-decoration-color: #e74c3c;
      text-decoration-thickness: 2px;
    }
    
    .new-price {
      font-size: 14px;
      color: #e74c3c;
    }
    
    /* Поиск и фильтры */
    .search-filter-bar {
      display: flex;
      gap: 12px;
      margin-bottom: 30px;
      flex-wrap: wrap;
      align-items: center;
    }

    .search-box {
      position: relative;
      flex: 1;
      min-width: 200px;
    }

    .search-box input {
      width: 100%;
      height: 44px;
      padding: 0 40px 0 15px;
      border: 1px solid #d8d3c9;
      border-radius: 999px;
      background: white;
      font-family: inherit;
      font-size: 13px;
      outline: none;
      transition: border-color 0.2s;
    }

    .search-box input:focus {
      border-color: #171714;
    }

    .search-icon {
      position: absolute;
      right: 15px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 16px;
      opacity: 0.5;
      pointer-events: none;
    }

    .filter-group select {
      height: 44px;
      padding: 0 15px;
      border: 1px solid #d8d3c9;
      border-radius: 999px;
      background: white;
      font-family: inherit;
      font-size: 13px;
      outline: none;
      cursor: pointer;
      transition: border-color 0.2s;
    }

    .filter-group select:focus {
      border-color: #171714;
    }

    /* Пагинация */
    .pagination {
      margin-top: 40px;
      text-align: center;
    }

    .pagination-buttons {
      display: flex;
      justify-content: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .page-btn {
      width: 40px;
      height: 40px;
      border: 1px solid #d8d3c9;
      border-radius: 50%;
      background: white;
      cursor: pointer;
      font-family: inherit;
      font-size: 14px;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .page-btn:hover:not(.disabled):not(.active) {
      background: #f0ede6;
    }

    .page-btn.active {
      background: #171714;
      color: white;
      border-color: #171714;
    }

    .page-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .page-dots {
      display: flex;
      align-items: center;
      padding: 0 5px;
      color: #777;
    }

    .pagination-info {
      margin-top: 15px;
      font-size: 12px;
      color: #777;
    }

    .no-results {
      text-align: center;
      padding: 60px 20px;
      color: #777;
    }

    .no-results p {
      font-size: 48px;
      margin: 0;
    }

    .no-results h3 {
      margin: 15px 0 10px;
      font-size: 24px;
      color: #333;
    }

    .no-results p:last-child {
      font-size: 14px;
    }

    @media (max-width: 768px) {
      .search-filter-bar {
        flex-direction: column;
      }
      
      .search-box,
      .filter-group {
        width: 100%;
      }
      
      .filter-group select {
        width: 100%;
      }
      
      .price-block {
        align-items: flex-start;
      }
    }
  `;
  document.head.appendChild(style);
}

// Запуск
document.addEventListener('DOMContentLoaded', () => {
  addStyles();
  
  // Обновляем обработчики фильтров
  const existingFilters = document.querySelectorAll('.filter');
  existingFilters.forEach(button => {
    button.addEventListener('click', (e) => {
      existingFilters.forEach(item => item.classList.remove('active'));
      button.classList.add('active');
      currentFilter = button.dataset.filter;
      currentPage = 1;
      renderProducts();
    });
  });
  
  initSearchAndFilters();
  applyStore();
});

// Сохраняем ссылку на grid для пагинации
const grid = document.querySelector('.products');
