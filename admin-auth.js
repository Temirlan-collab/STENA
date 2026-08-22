const stenaSupabase = window.STENA_SUPABASE;

(function () {

  const auth =
    JSON.parse(
      localStorage.getItem('stenaAuth') || 'null'
    );

  if (!auth || !auth.access_token) {
    window.location.replace('login.html');
    return;
  }

  fetch(
    `${window.STENA_SUPABASE.url}/auth/v1/user`,
    {
      method: 'GET',
      headers: {
        apikey: window.STENA_SUPABASE.key,
        Authorization: `Bearer ${auth.access_token}`
      },
      cache: 'no-store'
    }
  )
  .then(response => {

    if (!response.ok) {
      throw new Error('Недействительная сессия');
    }

    return response.json();
  })
  .then(user => {

    if (!user || !user.id) {
      throw new Error('Пользователь не найден');
    }

    console.log(
      'STENA: авторизация подтверждена',
      user.email
    );

  })
  .catch(error => {

    console.error(
      'STENA: доступ запрещён',
      error
    );

    localStorage.removeItem('stenaAuth');

    window.location.replace('login.html');
  });

})();

if (!stenaSupabase) {
  throw new Error(
    'STENA_SUPABASE не найден. Проверь supabase-config.js'
  );
}

async function checkAdminAuth() {
  try {
    const auth =
      JSON.parse(
        localStorage.getItem('stenaAuth') || 'null'
      );

    if (!auth?.access_token) {
      window.location.replace('login.html');
      return;
    }

    /*
      Проверяем токен непосредственно
      через Supabase.
    */

    const response = await fetch(
      `${stenaSupabase.url}/auth/v1/user`,
      {
        method: 'GET',

        headers: {
          apikey: stenaSupabase.key,

          Authorization:
            `Bearer ${auth.access_token}`
        },

        cache: 'no-store'
      }
    );

    if (!response.ok) {
      throw new Error('Сессия недействительна');
    }

    const user = await response.json();

    if (!user?.id) {
      throw new Error('Пользователь не найден');
    }

    /*
      Сохраняем информацию о пользователе,
      чтобы потом использовать её в админке.
    */

    localStorage.setItem(
      'stenaAdminUser',
      JSON.stringify({
        id: user.id,
        email: user.email
      })
    );

    document.documentElement.classList.add(
      'admin-authenticated'
    );

  } catch (error) {

    console.error(
      'Ошибка проверки авторизации:',
      error
    );

    localStorage.removeItem('stenaAuth');
    localStorage.removeItem('stenaAdminUser');

    window.location.replace('login.html');
  }
}

checkAdminAuth();

document
  .querySelector('#logoutButton')
  ?.addEventListener('click', () => {

    localStorage.removeItem('stenaAuth');
    localStorage.removeItem('stenaAdminUser');

    window.location.replace('login.html');
  });