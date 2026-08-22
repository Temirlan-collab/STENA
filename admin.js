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

  whatsapp:
    '',

  products: [
    {
      name: 'Herbier · Olive',
      price: '18900',
      kind: 'calm',
      photo: ''
    },
    {
      name: 'Matisse · Coral',
      price: '21500',
      kind: 'bold',
      photo: ''
    },
    {
      name: 'Grid · Ink',
      price: '17200',
      kind: 'calm',
      photo: ''
    },
    {
      name: 'Aegean · Blue',
      price: '20400',
      kind: 'bold',
      photo: ''
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

            price:
              String(product?.price || '0')
                .replace(/\s/g, ''),

            kind:
              product?.kind ||
              'calm',

            photo:
              product?.photo ||
              ''
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


  if (!form) return;


  if (form.city) {
    form.city.value =
      settings.city;
  }


  if (form.announcement) {
    form.announcement.value =
      settings.announcement;
  }


  if (form.whatsapp) {
    form.whatsapp.value =
      settings.whatsapp || '';
  }
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

      <input
        class="product-price"
        type="text"
        value="${escapeHtml(product.price)}"
        placeholder="Цена"
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

      settings.products.push({

        name:
          'Новый товар',

        price:
          '0',

        kind:
          'calm',

        photo:
          ''
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


  /*
     Используем bucket из supabase-config.js,
     а если его там нет — автоматически
     используем wallpapers.
  */

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


                kind:
                  row.querySelector(
                    '.product-kind'
                  )?.value ||
                  'calm',


                photo:
                  old.photo ||
                  ''
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
   СТАРТ
========================================= */

loadSettings();