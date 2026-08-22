const defaults = {
  city: 'Астана',

  announcement:
    'Бесплатная доставка по Астане при заказе от 50 000 ₸',

  products: [
    {
      name: 'Herbier · Olive',
      price: '18900',
      kind: 'calm',
      art: 'wallpaper-garden',
      photo: ''
    },
    {
      name: 'Matisse · Coral',
      price: '21500',
      kind: 'bold',
      art: 'wallpaper-coral',
      photo: ''
    },
    {
      name: 'Grid · Ink',
      price: '17200',
      kind: 'calm',
      art: 'wallpaper-grid',
      photo: ''
    },
    {
      name: 'Aegean · Blue',
      price: '20400',
      kind: 'bold',
      art: 'wallpaper-wave',
      photo: ''
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

  const grid =
    document.querySelector('.products');

  if (!grid) return;

  if (!Array.isArray(s.products)) return;

  grid.innerHTML = s.products
    .map((product, i) => {

      // Поддержка нового формата объектов
      // и старого формата массивов
      let name;
      let price;
      let kind;
      let art;
      let photo;

      if (Array.isArray(product)) {
        name = product[0];
        price = product[1];
        kind = product[2];
        art = product[3];
        photo = product[4] || '';
      } else {
        name = product.name;
        price = product.price;
        kind = product.kind;
        art = product.art;
        photo = product.photo || '';
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

      return `
        <article
          class="product"
          data-kind="${kind}"
        >
          <div
            class="product-art ${art}"
            ${photoStyle}
          >
            <span>
              ${String(i + 1).padStart(2, '0')}
            </span>

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
              <p>Флизелин · 10 × 0,53 м</p>
            </div>

            <strong>
              ${format(price)}
            </strong>
          </div>
        </article>
      `;
    })
    .join('');
}

applyStore();

document
  .querySelector('.products')
  ?.addEventListener('click', event => {

    const button =
      event.target.closest('.quick-add');

    if (!button) return;

    const cartCount =
      document.querySelector('#cartCount');

    const current =
      Number(cartCount?.textContent) || 0;

    if (cartCount) {
      cartCount.textContent =
        current + 1;
    }

    alert(
      `${button.dataset.name} добавлен в корзину`
    );
  });