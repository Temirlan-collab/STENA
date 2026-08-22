const stenaSupabase = window.STENA_SUPABASE;

if (!stenaSupabase) {
  throw new Error(
    'STENA_SUPABASE не найден. Проверь supabase-config.js'
  );
}


/* =========================
   SUPABASE AUTH API
========================= */

async function supabaseAuth(endpoint, body) {

  const response = await fetch(
    `${stenaSupabase.url}/auth/v1/${endpoint}`,
    {
      method: 'POST',

      headers: {
        apikey: stenaSupabase.key,
        'Content-Type': 'application/json'
      },

      body: JSON.stringify(body)
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error_description ||
      data?.msg ||
      data?.message ||
      'Ошибка авторизации'
    );
  }

  return data;
}


/* =========================
   ЭЛЕМЕНТЫ LOGIN
========================= */

const loginForm =
  document.querySelector('#loginForm');

const loginError =
  document.querySelector('#loginError');


/* =========================
   ПОКАЗ ОШИБКИ
========================= */

function showLoginError(message) {

  if (!loginError) return;

  loginError.textContent = message;

  loginError.hidden = false;
}


/* =========================
   ВХОД
========================= */

loginForm?.addEventListener(
  'submit',
  async event => {

    event.preventDefault();

    loginError.hidden = true;

    const email =
      document
        .querySelector('#loginEmail')
        .value
        .trim();

    const password =
      document
        .querySelector('#loginPassword')
        .value;


    const button =
      loginForm.querySelector(
        'button[type="submit"]'
      );


    button.disabled = true;
    button.textContent = 'Вход...';


    try {

      const data =
        await supabaseAuth(
          'token?grant_type=password',
          {
            email,
            password
          }
        );


      if (
        !data.access_token ||
        !data.refresh_token
      ) {
        throw new Error(
          'Supabase не вернул данные сессии.'
        );
      }


      /*
        Сохраняем сессию.

        Она понадобится admin.js
        для проверки доступа.
      */

      localStorage.setItem(
        'stenaAuth',
        JSON.stringify({
          access_token:
            data.access_token,

          refresh_token:
            data.refresh_token,

          expires_at:
            Date.now() +
            ((data.expires_in || 3600) * 1000)
        })
      );


      /*
        Переходим в админку
      */

      window.location.href =
        'admin.html';


    } catch (error) {

      console.error(
        'Ошибка входа:',
        error
      );


      showLoginError(
        getAuthErrorMessage(
          error.message
        )
      );


      button.disabled = false;

      button.textContent =
        'Войти →';
    }

  }
);


/* =========================
   ПОНЯТНЫЕ ОШИБКИ
========================= */

function getAuthErrorMessage(message) {

  const text =
    String(message || '')
      .toLowerCase();


  if (
    text.includes('invalid login') ||
    text.includes('invalid credentials')
  ) {

    return 'Неверная почта или пароль.';
  }


  if (
    text.includes('email not confirmed')
  ) {

    return 'Email ещё не подтверждён.';
  }


  if (
    text.includes('too many requests')
  ) {

    return 'Слишком много попыток. Попробуйте позже.';
  }


  return (
    message ||
    'Не удалось выполнить вход.'
  );
}