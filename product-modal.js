const shopDefaults = {
  city: 'Астана',
  announcement: 'Бесплатная доставка по Астане при заказе от 50 000 ₸',
  whatsapp: '',
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
    // ... (остальные товары как в public-admin.js)
  ]
};

const shopSettings = () => JSON.parse(localStorage.getItem('stenaSettings') || 'null') || shopDefaults;

let selectedProduct = null;

// Создаем модальное окно
document.body.insertAdjacentHTML('beforeend', `
  <div class="product-modal-backdrop" id="productModal">
    <section class="product-modal" role="dialog" aria-modal="true">
      <button class="modal-close" aria-label="Закрыть">×</button>
      
      <div class="product-modal-image" id="modalImage"></div>
      
      <p class="eyebrow">Обои для вашего интерьера</p>
      
      <h2 id="modalName"></h2>
      
      <div class="modal-price-row">
        <p class="modal-price" id="modalPrice"></p>
        <span class="modal-old-price" id="modalOldPrice"></span>
        <span class="modal-kind" id="modalKind"></span>
        <span class="modal-new-badge" id="modalNewBadge" style="display:none">Новинка</span>
        <span class="modal-hit-badge" id="modalHitBadge" style="display:none">Хит продаж</span>
        <span class="modal-sale-badge" id="modalSaleBadge" style="display:none">Скидка</span>
      </div>
      
      <div class="modal-details">
        <div class="modal-detail-item">
          <span class="detail-label">Страна производства</span>
          <span class="detail-value" id="modalCountry"></span>
        </div>
        <div class="modal-detail-item">
          <span class="detail-label">Материал</span>
          <span class="detail-value" id="modalMaterial"></span>
        </div>
        <div class="modal-detail-item">
          <span class="detail-label">Размер рулона</span>
          <span class="detail-value" id="modalSize"></span>
        </div>
      </div>
      
      <p class="modal-description" id="modalDescription"></p>
      
      <form id="orderForm">
        <input name="customer" required placeholder="Ваше имя">
        <input name="phone" required placeholder="Телефон для связи">
        <input name="quantity" type="number" min="1" value="1" aria-label="Количество рулонов">
        <button class="button dark full" type="submit">Заказать в WhatsApp <span>→</span></button>
      </form>
    </section>
  </div>
`);

const modal = document.querySelector('#productModal');

// Функция закрытия
function closeModal() {
  modal.classList.remove('show');
}

// Обработчик клика на товар
document.querySelector('.products')?.addEventListener('click', (e) => {
  if (e.target.closest('.quick-add')) return;
  
  const card = e.target.closest('.product');
  if (!card) return;
  
  const settings = shopSettings();
  
  // Находим товар по данным из карточки
  const productName = card.querySelector('h3')?.textContent;
  const product = settings.products.find(p => {
    const name = Array.isArray(p) ? p[0] : p.name;
    return name === productName;
  });
  
  if (!product) return;
  
  selectedProduct = product;
  
  // Заполняем модальное окно
  const name = product.name || product[0] || '';
  const price = product.price || product[1] || '';
  const oldPrice = product.oldPrice || '';
  const kind = product.kind || product[2] || '';
  const description = product.description || '';
  const country = product.country || '';
  const material = product.material || 'Флизелин';
  const size = product.size || '10 × 0,53 м';
  const photo = product.photo || '';
  const art = product.art || '';
  const isNew = product.isNew || false;
  const isHit = product.isHit || false;
  const isSale = product.isSale || false;
  
  // Заполняем текстовые поля
  document.querySelector('#modalName').textContent = name;
  document.querySelector('#modalPrice').textContent = `${price} ₸`;
  document.querySelector('#modalDescription').textContent = description;
  document.querySelector('#modalCountry').textContent = country;
  document.querySelector('#modalMaterial').textContent = material;
  document.querySelector('#modalSize').textContent = size;
  
  // Отображаем старую цену (перечеркнутую) если есть скидка
  const modalOldPrice = document.querySelector('#modalOldPrice');
  if (oldPrice && parseInt(oldPrice) > parseInt(price)) {
    modalOldPrice.textContent = `${oldPrice} ₸`;
    modalOldPrice.style.display = 'inline-block';
  } else {
    modalOldPrice.style.display = 'none';
  }
  
  // Определяем категорию
  const kindLabel = kind === 'bold' ? 'Акцентные' : 'Спокойные';
  document.querySelector('#modalKind').textContent = kindLabel;
  
  // Показываем бейджи
  const newBadge = document.querySelector('#modalNewBadge');
  const hitBadge = document.querySelector('#modalHitBadge');
  const saleBadge = document.querySelector('#modalSaleBadge');
  
  if (isNew) {
    newBadge.style.display = 'inline-block';
  } else {
    newBadge.style.display = 'none';
  }
  
  if (isHit) {
    hitBadge.style.display = 'inline-block';
  } else {
    hitBadge.style.display = 'none';
  }
  
  if (isSale) {
    saleBadge.style.display = 'inline-block';
  } else {
    saleBadge.style.display = 'none';
  }
  
  // Отображаем фото
  const modalImage = document.querySelector('#modalImage');
  
  if (photo) {
    modalImage.style.backgroundImage = `url('${photo}')`;
    modalImage.style.backgroundSize = 'cover';
    modalImage.style.backgroundPosition = 'center';
    modalImage.innerHTML = '';
  } else if (art) {
    modalImage.style.backgroundImage = '';
    modalImage.style.backgroundSize = '';
    modalImage.style.backgroundPosition = '';
    modalImage.className = 'product-modal-image ' + art;
  } else {
    modalImage.style.backgroundImage = '';
    modalImage.style.backgroundSize = '';
    modalImage.style.backgroundPosition = '';
    modalImage.className = 'product-modal-image';
    modalImage.innerHTML = '<span style="display:flex;align-items:center;justify-content:center;height:100%;color:#777;font-size:14px">Нет фото</span>';
  }
  
  // Показываем модальное окно
  modal.classList.add('show');
});

// Закрытие по крестику
document.querySelector('.modal-close').onclick = closeModal;

// Закрытие по клику на фон
modal.onclick = (e) => {
  if (e.target === modal) closeModal();
};

// Закрытие по Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// Обработка отправки заказа
document.querySelector('#orderForm').onsubmit = (e) => {
  e.preventDefault();
  
  const data = new FormData(e.target);
  const whatsapp = String(shopSettings().whatsapp || '').replace(/\D/g, '');
  
  if (!whatsapp) {
    alert('Укажите номер WhatsApp в админ-панели.');
    return;
  }
  
  const msg = `Здравствуйте! Хочу заказать обои: ${selectedProduct.name}. Количество: ${data.get('quantity')} рул. Имя: ${data.get('customer')}. Телефон: ${data.get('phone')}.`;
  
  window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
};
