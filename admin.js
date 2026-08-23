const adminSupabase = window.STENA_SUPABASE;

if (!adminSupabase) {
  throw new Error(
    'STENA_SUPABASE не найден. Проверь supabase-config.js'
  );
}


/* =========================================
   ДАННЫЕ ПО УМОЛЧАНИЮ
========================================= */

const defaults = {
  city: 'Астана',

  announcement:
    'Бесплатная доставка по Астане при заказе от 50 000 ₸',

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
      photo: '',
      isNew: false,
      isHit: true,
      isSale: true
    }
  ]
};


let settings = structuredClone(defaults);


/* =========================================
   ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
========================================= */

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}


function normalizeSettings(data) {
  return {
    city:
      data?.city ||
      defaults.city,

    announcement:
      data?.announcement ||
      defaults.announcement,

    whatsapp:
      data?.whatsapp ||
      '',

    products:
      Array.isArray(data?.products)
        ? data.products.map(product => ({
            name:
              product?.name ||
              'Новый товар',

            description:
              product?.description ||
              '',

            price:
              String(product?.price || '0')
                .replace(/\s/g, ''),

            oldPrice:
              String(product?.oldPrice || '')
                .replace(/\s/g, ''),

            kind:
              product?.kind ||
              'calm',

            country:
              product?.country ||
              '',

            material:
              product?.material ||
              'Флизелин',

            size:
              product?.size ||
              '10 × 0,53 м',

            photo:
              product?.photo ||
              '',
              
            isNew:
              product?.isNew ||
              false,
              
            isHit:
              product?.isHit ||
              false,
              
            isSale:
              product?.isSale ||
              false
          }))
        : structuredClone(defaults.products)
  };
}


/* =========================================
   SUPABASE — ЗАГРУЗКА
========================================= */

async function loadSettings() {
  try {
    const response = await fetch(
      `${adminSupabase.url}/rest/v1/site_settings?id=eq.1&select=data`,
      {
        method: 'GET',

        headers: {
          apikey: adminSupabase.key,

          Authorization:
            `Bearer ${adminSupabase.key}`
        },

        cache: 'no-store'
      }
    );

    if (!response.ok) {
      throw new Error(
        await response.text()
      );
    }

    const rows =
      await response.json();

    if (
      rows.length &&
      rows[0].data
    ) {
      settings =
        normalizeSettings(
          rows[0].data
        );
    } else {
      settings =
        structuredClone(
          defaults
        );

      await saveSettings();
    }

    localStorage.setItem(
      'stenaSettings',
      JSON.stringify(settings)
    );

    renderSettings();
    renderProducts();

  } catch (error) {

    console.error(
      'Ошибка загрузки Supabase:',
      error
    );

    let local = null;

    try {
      local =
        JSON.parse(
          localStorage.getItem(
            'stenaSettings'
          ) || 'null'
        );
    } catch {
      local = null;
    }

    settings =
      normalizeSettings(
        local || defaults
      );

    renderSettings();
    renderProducts();

    alert(
      'Не удалось загрузить данные Supabase. Используются локальные данные.'
    );
  }
}


/* =========================================
   SUPABASE — СОХРАНЕНИЕ
========================================= */

async function saveSettings() {

  const response =
    await fetch(
      `${adminSupabase.url}/rest/v1/site_settings?id=eq.1`,
      {
        method: 'PATCH',

        headers: {
          apikey:
            adminSupabase.key,

          Authorization:
            `Bearer ${adminSupabase.key}`,

          'Content-Type':
            'application/json',

          Prefer:
            'return=minimal'
        },

        body:
          JSON.stringify({
            data: settings
          })
      }
    );

  if (!response.ok) {
    throw new Error(
      await response.text()
    );
  }

  localStorage.setItem(
    'stenaSettings',
    JSON.stringify(settings)
  );
}


/* =========================================
   НАСТРОЙКИ МАГАЗИНА
========================================= */

function renderSettings() {

  const form =
    document.querySelector(
      '#settingsForm'
    );

  if (!form) {
    console.warn(
      'STENA: settingsForm не найден'
    );

    return;
  }

  if (form.city) {
    form.city.value =
      settings.city || '';
  }

  if (form.announcement) {
    form.announcement.value =
      settings.announcement || '';
  }

  if (form.whatsapp) {
    form.whatsapp.value =
      settings.whatsapp || '';
  }

  console.log(
    'STENA: настройки загружены',
    settings
  );
}


document
  .querySelector('#settingsForm')
  ?.addEventListener(
    'submit',
    async event => {

      event.preventDefault();

      const form =
        event.currentTarget;

      settings.city =
        form.city.value.trim();

      settings.announcement =
        form.announcement.value.trim();

      settings.whatsapp =
        form.whatsapp.value.trim();

      try {

        await saveSettings();

        alert(
          'Настройки сохранены в Supabase.'
        );

      } catch (error) {

        console.error(error);

        alert(
          'Ошибка сохранения настроек:\n' +
          error.message
        );
      }
    }
  );


/* =========================================
   СОЗДАНИЕ КАРТОЧКИ ТОВАРА
========================================= */

function createProductRow(
  product,
  index
) {

  const row =
    document.createElement(
      'div'
    );

  row.className =
    'product-row';

  row.innerHTML = `

    <div class="product-fields">

      <input
        class="product-name"
        type="text"
        value="${escapeHtml(product.name)}"
        placeholder="Название товара"
      >

      <textarea
        class="product-description"
        placeholder="Описание товара"
        rows="3"
      >${escapeHtml(product.description)}</textarea>

      <input
        class="product-price"
        type="text"
        value="${escapeHtml(product.price)}"
        placeholder="Цена"
      >

      <input
        class="product-oldprice"
        type="text"
        value="${escapeHtml(product.oldPrice || '')}"
        placeholder="Старая цена (для скидки)"
      >

      <select class="product-kind">

        <option
          value="calm"
          ${product.kind === 'calm' ? 'selected' : ''}
        >
          Спокойные
        </option>

        <option
          value="bold"
          ${product.kind === 'bold' ? 'selected' : ''}
        >
          Акцентные
        </option>

      </select>

      <input
        class="product-country"
        type="text"
        value="${escapeHtml(product.country || '')}"
        placeholder="Страна производства"
      >

      <input
        class="product-material"
        type="text"
        value="${escapeHtml(product.material || 'Флизелин')}"
        placeholder="Материал"
      >

      <input
        class="product-size"
        type="text"
        value="${escapeHtml(product.size || '10 × 0,53 м')}"
        placeholder="Размер рулона"
      >

      <div class="product-badges">
        <label class="product-badge-checkbox">
          <input
            type="checkbox"
            class="product-isnew"
            ${product.isNew ? 'checked' : ''}
          >
          <span class="badge-label badge-new">Новинка</span>
        </label>

        <label class="product-badge-checkbox">
          <input
            type="checkbox"
            class="product-ishit"
            ${product.isHit ? 'checked' : ''}
          >
          <span class="badge-label badge-hit">Хит продаж</span>
        </label>

        <label class="product-badge-checkbox">
          <input
            type="checkbox"
            class="product-issale"
            ${product.isSale ? 'checked' : ''}
          >
          <span class="badge-label badge-sale">Скидка</span>
        </label>
      </div>

    </div>


    <div class="product-photo-area">

      <label class="photo-box">

        <div class="product-preview">

          ${
            product.photo

              ? `
                <img
                  class="admin-product-photo"
                  src="${escapeHtml(product.photo)}"
                  alt="Фото товара"
                >
              `

              : `
                <span class="photo-placeholder">
                  +
                  <small>
                    Добавить фото
                  </small>
                </span>
              `
          }

        </div>


        <input
          class="photo-upload"
          type="file"
          accept="image/jpeg,image/png,image/webp"
        >

      </label>


      <button
        class="delete-product"
        type="button"
        data-index="${index}"
      >
        Удалить товар
      </button>

    </div>

  `;

  return row;
}


/* =========================================
   ОТОБРАЖЕНИЕ ТОВАРОВ
========================================= */

function renderProducts() {

  const editor =
    document.querySelector(
      '#productEditor'
    );

  if (!editor) return;

  editor.innerHTML = '';

  settings.products.forEach(
    (product, index) => {

      editor.appendChild(
        createProductRow(
          product,
          index
        )
      );

    }
  );
}


/* =========================================
   ДОБАВИТЬ ТОВАР
========================================= */

document
  .querySelector('#addProduct')
  ?.addEventListener(
    'click',
    () => {

      settings.products.unshift({

        name:
          'Новый товар',

        description:
          '',

        price:
          '0',

        oldPrice:
          '',

        kind:
          'calm',

        country:
          '',

        material:
          'Флизелин',

        size:
          '10 × 0,53 м',

        photo:
          '',
          
        isNew:
          false,
          
        isHit:
          false,
          
        isSale:
          false
      });

      renderProducts();
    }
  );


/* =========================================
   УДАЛИТЬ ТОВАР
========================================= */

document
  .querySelector('#productEditor')
  ?.addEventListener(
    'click',
    event => {

      const button =
        event.target.closest(
          '.delete-product'
        );

      if (!button) return;

      const index =
        Number(
          button.dataset.index
        );

      if (
        !confirm(
          'Удалить этот товар?'
        )
      ) {
        return;
      }

      settings.products.splice(
        index,
        1
      );

      renderProducts();
    }
  );


/* =========================================
   ПРЕДПРОСМОТР ФОТО
========================================= */

document
  .querySelector('#productEditor')
  ?.addEventListener(
    'change',
    event => {

      const input =
        event.target.closest(
          '.photo-upload'
        );

      if (!input) return;

      const row =
        input.closest(
          '.product-row'
        );

      if (!row) return;

      const file =
        input.files?.[0];

      if (!file) return;

      if (
        file.size >
        10 * 1024 * 1024
      ) {

        alert(
          'Фото должно быть меньше 10 МБ.'
        );

        input.value = '';

        return;
      }

      const preview =
        row.querySelector(
          '.product-preview'
        );

      if (!preview) return;

      const reader =
        new FileReader();

      reader.onload =
        () => {

          preview.innerHTML = `

            <img
              class="admin-product-photo"
              src="${reader.result}"
              alt="Предпросмотр"
            >

          `;
        };

      reader.readAsDataURL(
        file
      );
    }
  );


/* =========================================
   ЗАГРУЗКА ФОТО В SUPABASE STORAGE
========================================= */

async function uploadPhoto(
  file,
  index
) {

  if (!file) {

    throw new Error(
      'Файл фотографии не выбран.'
    );
  }

  if (
    file.size >
    10 * 1024 * 1024
  ) {

    throw new Error(
      'Размер фотографии больше 10 МБ.'
    );
  }

  const bucket =
    adminSupabase.bucket ||
    'wallpapers';

  const extension =
    file.name
      .split('.')
      .pop()
      ?.toLowerCase() ||
    'jpg';

  const fileName =
    `product-${Date.now()}-${index}.${extension}`;

  const uploadUrl =
    `${adminSupabase.url}` +
    `/storage/v1/object/` +
    `${bucket}/` +
    `${fileName}`;

  const response =
    await fetch(
      uploadUrl,
      {
        method: 'POST',

        headers: {

          apikey:
            adminSupabase.key,

          Authorization:
            `Bearer ${adminSupabase.key}`,

          'Content-Type':
            file.type ||
            'application/octet-stream',

          'x-upsert':
            'true'
        },

        body:
          file
      }
    );

  if (!response.ok) {

    throw new Error(
      'Ошибка загрузки фотографии:\n' +
      await response.text()
    );
  }

  return (
    `${adminSupabase.url}` +
    `/storage/v1/object/public/` +
    `${bucket}/` +
    `${fileName}`
  );
}


/* =========================================
   СОХРАНИТЬ КАТАЛОГ
========================================= */

document
  .querySelector('#saveProducts')
  ?.addEventListener(
    'click',
    async () => {

      const button =
        document.querySelector(
          '#saveProducts'
        );

      if (!button) return;

      button.disabled =
        true;

      button.textContent =
        'Сохранение...';

      try {

        const rows = [
          ...document.querySelectorAll(
            '#productEditor .product-row'
          )
        ];

        const oldProducts =
          settings.products;

        const newProducts =
          rows.map(
            (row, index) => {

              const old =
                oldProducts[index] ||
                {};

              return {

                name:
                  row.querySelector(
                    '.product-name'
                  )?.value.trim() ||
                  'Новый товар',

                description:
                  row.querySelector(
                    '.product-description'
                  )?.value.trim() ||
                  '',

                price:
                  (
                    row.querySelector(
                      '.product-price'
                    )?.value ||
                    '0'
                  )
                    .replace(/\s/g, '')
                    .trim() ||
                  '0',

                oldPrice:
                  (
                    row.querySelector(
                      '.product-oldprice'
                    )?.value ||
                    ''
                  )
                    .replace(/\s/g, '')
                    .trim(),

                kind:
                  row.querySelector(
                    '.product-kind'
                  )?.value ||
                  'calm',

                country:
                  row.querySelector(
                    '.product-country'
                  )?.value.trim() ||
                  '',

                material:
                  row.querySelector(
                    '.product-material'
                  )?.value.trim() ||
                  'Флизелин',

                size:
                  row.querySelector(
                    '.product-size'
                  )?.value.trim() ||
                  '10 × 0,53 м',

                photo:
                  old.photo ||
                  '',
                  
                isNew:
                  row.querySelector(
                    '.product-isnew'
                  )?.checked ||
                  false,
                  
                isHit:
                  row.querySelector(
                    '.product-ishit'
                  )?.checked ||
                  false,
                  
                isSale:
                  row.querySelector(
                    '.product-issale'
                  )?.checked ||
                  false
              };
            }
          );

        settings.products =
          newProducts;


        /* Загружаем новые фотографии */

        for (
          let i = 0;
          i < rows.length;
          i++
        ) {

          const input =
            rows[i].querySelector(
              '.photo-upload'
            );

          const file =
            input?.files?.[0];

          if (!file) {
            continue;
          }

          button.textContent =
            `Загрузка фото ${i + 1}/${rows.length}...`;

          const photoUrl =
            await uploadPhoto(
              file,
              i
            );

          settings.products[i].photo =
            photoUrl;
        }


        /* Сохраняем каталог */

        button.textContent =
          'Сохранение каталога...';

        await saveSettings();

        renderProducts();

        alert(
          'Каталог и фотографии сохранены в Supabase.'
        );

      } catch (error) {

        console.error(
          'Ошибка сохранения:',
          error
        );

        alert(
          'Ошибка сохранения:\n\n' +
          error.message
        );

      } finally {

        button.disabled =
          false;

        button.textContent =
          'Сохранить каталог →';
      }

    }
  );


/* =========================================
   СБРОС
========================================= */

document
  .querySelector('#reset')
  ?.addEventListener(
    'click',
    async () => {

      if (
        !confirm(
          'Сбросить все товары и настройки?'
        )
      ) {
        return;
      }

      settings =
        structuredClone(
          defaults
        );

      try {

        await saveSettings();

        renderSettings();
        renderProducts();

        alert(
          'Данные сброшены.'
        );

      } catch (error) {

        console.error(error);

        alert(
          'Ошибка сброса:\n' +
          error.message
        );
      }
    }
  );


/* =========================================
   НАВИГАЦИЯ АДМИНКИ
========================================= */

document
  .querySelectorAll('.admin-nav-item')
  .forEach(button => {

    button.addEventListener(
      'click',
      () => {

        const sectionName =
          button.dataset.section;

        document
          .querySelectorAll('.admin-nav-item')
          .forEach(item => {
            item.classList.remove(
              'active'
            );
          });

        button.classList.add(
          'active'
        );

        document
          .querySelectorAll('.admin-section')
          .forEach(section => {
            section.classList.remove(
              'active'
            );
          });

        const section =
          document.querySelector(
            `#section-${sectionName}`
          );

        if (section) {
          section.classList.add(
            'active'
          );
        }

      }
    );

  });


/* =========================================
   ЗАПУСК
========================================= */

loadSettings();
