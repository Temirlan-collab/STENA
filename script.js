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

renderCart();
initAddButtons();
