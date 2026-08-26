/* =========================================
   STENA — КОРЗИНА И ОСНОВНОЙ СКРИПТ
========================================= */

const cart = [];

/* =========================================
   ЦЕНА
========================================= */

function parsePrice(value) {
  return Number(
    String(value ?? '')
      .replace(/\s/g, '')
      .replace(/[^\d.,-]/g, '')
      .replace(',', '.')
  ) || 0;
}

function money(value) {
  return new Intl.NumberFormat('ru-RU').format(
    parsePrice(value)
  ) + ' ₸';
}

/* =========================================
   ЭЛЕМЕНТЫ
========================================= */

const panel = document.querySelector('#cartPanel');
const overlay = document.querySelector('#overlay');
const cartItems = document.querySelector('#cartItems');
const cartCount = document.querySelector('#cartCount');
const cartTotal = document.querySelector('#cartTotal');
const cartButton = document.querySelector('#cartButton');
const closeCart = document.querySelector('#closeCart');
const checkoutButton = document.querySelector('#checkoutWhatsApp');

/* =========================================
   КОРЗИНА
========================================= */

function toggleCart(open) {
  if (!panel) return;

  panel.classList.toggle('open', open);

  if (overlay) {
    overlay.classList.toggle('show', open);
  }

  panel.setAttribute(
    'aria-hidden',
    String(!open)
  );
}

/* =========================================
   ЭКРАНИРОВАНИЕ
========================================= */

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

/* =========================================
   ПОЛУЧИТЬ НАСТРОЙКИ
========================================= */

function getSettings() {
  try {
    const saved = localStorage.getItem('stenaSettings');

    if (!saved) {
      return {};
    }

    return JSON.parse(saved) || {};

  } catch (error) {
    console.error(
      'Ошибка чтения настроек:',
      error
    );

    return {};
  }
}

/* =========================================
   WHATSAPP
========================================= */

function getWhatsAppNumber() {
  const settings = getSettings();

  return String(
    settings.whatsapp || ''
  ).replace(/\D/g, '');
}

/* =========================================
   ОТОБРАЖЕНИЕ КОРЗИНЫ
========================================= */

function renderCart() {

  if (cartCount) {
    cartCount.textContent = cart.length;
  }

  const total = cart.reduce(
    (sum, item) =>
      sum + parsePrice(item.price),
    0
  );

  if (cartTotal) {
    cartTotal.textContent =
      money(total);
  }

  if (!cartItems) {
    return;
  }

  if (!cart.length) {

    cartItems.innerHTML = `
      <p class="empty">
        Здесь пока пусто.<br>
        Выберите обои из коллекции.
      </p>
    `;

    return;
  }

  cartItems.innerHTML = cart
    .map((item, index) => {

      const name =
        item.name || 'Товар';

      const price =
        parsePrice(item.price);

      return `
        <div class="cart-item">

          <div class="cart-item-info">

            <strong>
              ${escapeHtml(name)}
            </strong>

            <span>
              ${money(price)}
            </span>

          </div>

          <button
            class="cart-remove"
            type="button"
            data-remove="${index}"
            aria-label="Удалить товар"
          >
            ×
          </button>

        </div>
      `;

    })
    .join('');

  cartItems
    .querySelectorAll('[data-remove]')
    .forEach(button => {

      button.addEventListener(
        'click',
        () => {

          const index =
            Number(
              button.dataset.remove
            );

          if (
            Number.isInteger(index) &&
            index >= 0 &&
            index < cart.length
          ) {

            cart.splice(index, 1);

            renderCart();
          }

        }
      );

    });
}

/* =========================================
   ДОБАВИТЬ ТОВАР
========================================= */

function addToCart(button) {

  if (!button) {
    return;
  }

  const name =
    button.dataset.name ||
    button.closest('.product')
      ?.querySelector('h3')
      ?.textContent
      ?.trim() ||
    'Товар';

  const price =
    parsePrice(
      button.dataset.price ||
      button.closest('.product')
        ?.querySelector('strong')
        ?.textContent ||
      0
    );

  cart.push({
    name: name,
    price: price
  });

  renderCart();

  toggleCart(true);
}

/* =========================================
   КНОПКИ В КОРЗИНУ
========================================= */

function initAddButtons() {

  document
    .querySelectorAll('.quick-add')
    .forEach(button => {

      button.addEventListener(
        'click',
        event => {

          event.preventDefault();
          event.stopPropagation();

          addToCart(button);

        }
      );

    });
}

/* =========================================
   WHATSAPP — ОФОРМЛЕНИЕ
========================================= */

function checkoutWhatsApp() {

  if (!cart.length) {

    alert(
      'Корзина пуста.'
    );

    return;
  }

  const phone =
    getWhatsAppNumber();

  if (!phone) {

    alert(
      'Номер WhatsApp не указан в настройках магазина.'
    );

    return;
  }

  const total =
    cart.reduce(
      (sum, item) =>
        sum + parsePrice(item.price),
      0
    );

  let message =
    'Здравствуйте! Хочу оформить заказ в STENA.\n\n';

  cart.forEach(
    (item, index) => {

      const name =
        item.name || 'Товар';

      const price =
        parsePrice(item.price);

      message +=
        `${index + 1}. ${name} — ${money(price)}\n`;

    }
  );

  message +=
    `\nИтого: ${money(total)}`;

  const url =
    `https://wa.me/${phone}?text=` +
    encodeURIComponent(message);

  window.open(
    url,
    '_blank'
  );
}

/* =========================================
   СОБЫТИЯ КОРЗИНЫ
========================================= */

if (cartButton) {

  cartButton.addEventListener(
    'click',
    () => toggleCart(true)
  );

}

if (closeCart) {

  closeCart.addEventListener(
    'click',
    () => toggleCart(false)
  );

}

if (overlay) {

  overlay.addEventListener(
    'click',
    () => toggleCart(false)
  );

}

if (checkoutButton) {

  checkoutButton.addEventListener(
    'click',
    checkoutWhatsApp
  );

}

/* =========================================
   ФИЛЬТРЫ
========================================= */

document
  .querySelectorAll('.filter')
  .forEach(button => {

    button.addEventListener(
      'click',
      () => {

        document
          .querySelectorAll('.filter')
          .forEach(item => {

            item.classList.remove(
              'active'
            );

          });

        button.classList.add(
          'active'
        );

        const filter =
          button.dataset.filter;

        document
          .querySelectorAll('.product')
          .forEach(product => {

            const show =
              filter === 'all' ||
              product.dataset.kind === filter;

            product.style.display =
              show ? '' : 'none';

          });

      }
    );

  });

/* =========================================
   КАЛЬКУЛЯТОР
========================================= */

const calculator =
  document.querySelector('#calculator');

if (calculator) {

  calculator.addEventListener(
    'submit',
    event => {

      event.preventDefault();

      const form =
        new FormData(calculator);

      const width =
        Number(
          form.get('width')
        ) || 0;

      const height =
        Number(
          form.get('height')
        ) || 0;

      const area =
        width * height;

      const rolls =
        Math.ceil(
          area / 4.5
        );

      const result =
        document.querySelector(
          '#calcResult'
        );

      if (result) {

        result.textContent =
          `Вам понадобится примерно ${rolls} ${
            rolls === 1
              ? 'рулон'
              : 'рулонов'
          } (с запасом 10%).`;

      }

    }
  );

}

/* =========================================
   ОБРАБОТЧИКИ КНОПОК РЕКЛАМЫ
========================================= */

// Глобальная функция для обработки кликов на кнопку "Заказать" в рекламе
function handleAdOrderClick(button) {
  const adTitle = button.dataset.adTitle || 'Акция';
  const adDiscount = button.dataset.adDiscount || '';
  
  openAdOrderModal({
    type: 'default',
    title: adTitle,
    discount: adDiscount
  });
}

// Делегирование событий для всех кнопок рекламы
document.addEventListener('click', function(e) {
  
  // Кнопка "Заказать" в рекламе
  const adOrderBtn = e.target.closest('.ad-order-btn');
  if (adOrderBtn) {
    e.preventDefault();
    handleAdOrderClick(adOrderBtn);
    return;
  }
  
  // Кнопка "Смотреть коллекцию" / "Перейти к каталогу"
  const adCatalogBtn = e.target.closest('.ad-catalog-btn');
  if (adCatalogBtn) {
    e.preventDefault();
    
    const catalog = document.querySelector('#catalog');
    if (catalog) {
      catalog.scrollIntoView({ behavior: 'smooth' });
    }
    
    return;
  }
  
  // Кнопка "Подробнее"
  const adMoreBtn = e.target.closest('.ad-more-btn');
  if (adMoreBtn) {
    e.preventDefault();
    
    const catalog = document.querySelector('#catalog');
    if (catalog) {
      catalog.scrollIntoView({ behavior: 'smooth' });
    }
    
    return;
  }
  
  // Закрытие баннера
  const adCloseBtn = e.target.closest('.ad-close');
  if (adCloseBtn) {
    const ad = adCloseBtn.closest('.ad-banner');
    if (ad) {
      ad.style.display = 'none';
    }
    return;
  }
});

/* =========================================
   МОДАЛЬНОЕ ОКНО ЗАКАЗА РЕКЛАМЫ
========================================= */

function openAdOrderModal(adData) {
  
  // Удаляем предыдущее модальное окно, если есть
  const existingModal = document.querySelector('#adOrderModal');
  if (existingModal) {
    existingModal.remove();
  }
  
  // Создаем модальное окно
  const modalHTML = `
    <div class="ad-order-modal-backdrop" id="adOrderModal">
      <div class="ad-order-modal">
        <button class="ad-order-modal-close" aria-label="Закрыть">×</button>
        
        <div class="ad-order-modal-content">
          <p class="eyebrow">Реклама</p>
          <h2>${adData.title}</h2>
          
          ${adData.discount ? `<div class="ad-order-discount">${adData.discount}</div>` : ''}
          
          <p class="ad-order-description">
            Оставьте заявку, и мы свяжемся с вами для уточнения деталей.
          </p>
          
          <form id="adOrderForm">
            <input type="text" name="name" placeholder="Ваше имя" required>
            <input type="tel" name="phone" placeholder="Телефон" required>
            <input type="text" name="comment" placeholder="Комментарий (необязательно)">
            
            <button type="submit" class="button dark full">Отправить заявку →</button>
          </form>
        </div>
      </div>
    </div>
  `;
  
  // Добавляем модальное окно на страницу
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Получаем элементы
  const modal = document.querySelector('#adOrderModal');
  const closeBtn = modal.querySelector('.ad-order-modal-close');
  const form = modal.querySelector('#adOrderForm');
  
  // Показываем модальное окно
  setTimeout(() => {
    modal.classList.add('show');
  }, 10);
  
  // Закрытие по крестику
  closeBtn.addEventListener('click', () => {
    modal.classList.remove('show');
    setTimeout(() => {
      modal.remove();
    }, 300);
  });
  
  // Закрытие по клику на фон
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('show');
      setTimeout(() => {
        modal.remove();
      }, 300);
    }
  });
  
  // Закрытие по Escape
  document.addEventListener('keydown', function closeOnEscape(e) {
    if (e.key === 'Escape') {
      modal.classList.remove('show');
      setTimeout(() => {
        modal.remove();
      }, 300);
      document.removeEventListener('keydown', closeOnEscape);
    }
  });
  
  // Обработка отправки формы
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const name = formData.get('name');
    const phone = formData.get('phone');
    const comment = formData.get('comment');
    
    // Получаем номер WhatsApp
    const whatsapp = getWhatsAppNumber();
    
    if (!whatsapp) {
      alert('Укажите номер WhatsApp в настройках магазина.');
      return;
    }
    
    // Формируем сообщение
    let message = `Здравствуйте! Хочу воспользоваться акцией: ${adData.title}.\n\n`;
    message += `Имя: ${name}\n`;
    message += `Телефон: ${phone}\n`;
    
    if (comment) {
      message += `Комментарий: ${comment}\n`;
    }
    
    if (adData.discount) {
      message += `\nСкидка: ${adData.discount}\n`;
    }
    
    // Отправляем в WhatsApp
    const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    
    // Закрываем модальное окно
    modal.classList.remove('show');
    setTimeout(() => {
      modal.remove();
    }, 300);
    
    // Показываем уведомление
    alert('Заявка отправлена! Мы свяжемся с вами в ближайшее время.');
  });
}

/* =========================================
   ЗАКРЫТИЕ РЕКЛАМЫ
========================================= */

// Плавающая реклама
const floatingAd = document.querySelector('#floatingAd');

if (floatingAd) {
  setTimeout(() => {
    floatingAd.classList.add('show');
  }, 3000);
  
  const floatingAdClose = floatingAd.querySelector('.floating-ad-close');
  
  if (floatingAdClose) {
    floatingAdClose.addEventListener('click', () => {
      floatingAd.style.display = 'none';
    });
  }
}

// Полноэкранная реклама (раз в сессию)
const fullscreenAd = document.querySelector('#fullscreenAd');

if (fullscreenAd && !sessionStorage.getItem('adShown')) {
  setTimeout(() => {
    fullscreenAd.classList.add('show');
  }, 1500);
}

// Закрытие полноэкранной рекламы
const fullscreenAdClose = document.querySelector('.fullscreen-ad-close');

if (fullscreenAdClose) {
  fullscreenAdClose.addEventListener('click', () => {
    fullscreenAd.classList.remove('show');
    sessionStorage.setItem('adShown', 'true');
  });
}

// Закрытие по клику на фон
if (fullscreenAd) {
  fullscreenAd.addEventListener('click', (e) => {
    if (e.target === fullscreenAd) {
      fullscreenAd.classList.remove('show');
      sessionStorage.setItem('adShown', 'true');
    }
  });
}

/* =========================================
   СКРЫТЫЙ ВХОД В АДМИНКУ
   Нажмите Ctrl + Shift + A (или Cmd + Shift + A на Mac)
========================================= */

document.addEventListener('keydown', (e) => {
  // Ctrl + Shift + A
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
    e.preventDefault();
    window.location.href = 'admin.html';
  }
  
  // Cmd + Shift + A (для Mac)
  if (e.metaKey && e.shiftKey && e.key.toLowerCase() === 'a') {
    e.preventDefault();
    window.location.href = 'admin.html';
  }
});

/* =========================================
   СКРЫТЫЙ ВХОД В АДМИНКУ (запасной вариант)
   Тройной клик по логотипу в шапке
========================================= */

const headerBrand = document.querySelector('header .brand');

if (headerBrand) {
  let brandClicks = 0;
  let brandTimer;

  headerBrand.addEventListener('click', (e) => {
    // Не мешаем обычному переходу по якорю
    e.preventDefault();

    brandClicks++;

    clearTimeout(brandTimer);

    brandTimer = setTimeout(() => {
      brandClicks = 0;
    }, 2000);

    if (brandClicks >= 3) {
      window.location.href = 'admin.html';
    }
  });
}

/* =========================================
   ПЕРЕМЕЩЕНИЕ КНОПКИ КОРЗИНЫ
========================================= */

const headerActions =
  document.querySelector(
    '.header-actions'
  );

const floatingCartSlot =
  document.querySelector(
    '#floatingCartSlot'
  );

const catalog =
  document.querySelector(
    '#catalog'
  );

if (
  cartButton &&
  headerActions &&
  floatingCartSlot &&
  catalog
) {

  const originalParent =
    headerActions;

  const originalNextSibling =
    cartButton.nextSibling;

  function updateCartButton() {

    const catalogRect =
      catalog.getBoundingClientRect();

    if (window.scrollY <= 80) {

      if (
        cartButton.parentElement !==
        originalParent
      ) {

        originalParent.insertBefore(
          cartButton,
          originalNextSibling
        );

      }

      return;
    }

    if (
      catalogRect.top <= window.innerHeight &&
      catalogRect.bottom > 0
    ) {

      if (
        cartButton.parentElement !==
        floatingCartSlot
      ) {

        floatingCartSlot.appendChild(
          cartButton
        );

      }

      return;
    }

    if (
      catalogRect.bottom <= 0
    ) {

      if (
        cartButton.parentElement !==
        originalParent
      ) {

        originalParent.insertBefore(
          cartButton,
          originalNextSibling
        );

      }

    }

  }

  window.addEventListener(
    'scroll',
    updateCartButton,
    { passive: true }
  );

  window.addEventListener(
    'resize',
    updateCartButton
  );

  updateCartButton();
}

/* =========================================
   ЗАПУСК
========================================= */

// Инициализация после полной загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  initAddButtons();
});
