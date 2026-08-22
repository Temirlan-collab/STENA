const cloudBox = document.createElement('div');

cloudBox.className = 'admin-card';

cloudBox.innerHTML = `
    <h2>Синхронизация</h2>

    <p class="admin-note">
        Войдите как администратор, чтобы публиковать изменения для всех устройств.
    </p>

    <form id="cloudLogin">
        <input
            name="email"
            type="email"
            required
            placeholder="Email администратора"
        >

        <input
            name="password"
            type="password"
            required
            placeholder="Пароль"
        >

        <button class="button dark" type="submit">
            Войти в Supabase →
        </button>
    </form>

    <div id="cloudStatus"></div>

    <button
        id="cloudLogout"
        class="button line"
        type="button"
        style="display:none;margin-top:12px"
    >
        Выйти
    </button>
`;

document
    .querySelector('.admin-grid')
    .append(cloudBox);


const cloud = window.STENA_SUPABASE;

const loginForm = document.querySelector('#cloudLogin');
const status = document.querySelector('#cloudStatus');
const logoutButton = document.querySelector('#cloudLogout');

let token = sessionStorage.getItem('stenaAdminToken');


/* =====================================================
   Запрос к Supabase
===================================================== */

async function cloudRequest(path, options = {}) {

    if (!token) {
        throw new Error('NO_TOKEN');
    }

    return fetch(`${cloud.url}${path}`, {

        ...options,

        headers: {
            apikey: cloud.key,

            Authorization: `Bearer ${token}`,

            'Content-Type': 'application/json',

            ...(options.headers || {})
        }
    });
}


/* =====================================================
   Проверка текущего пользователя
===================================================== */

async function checkAdmin() {

    if (!token) {
        return false;
    }

    try {

        const response = await cloudRequest(
            '/auth/v1/user'
        );

        if (!response.ok) {

            sessionStorage.removeItem(
                'stenaAdminToken'
            );

            token = null;

            return false;
        }

        const user = await response.json();

        if (!user || !user.id) {
            return false;
        }


        /* Получаем профиль */

        const profileResponse = await cloudRequest(
            `/rest/v1/profiles?id=eq.${user.id}&select=id,email,role`
        );


        if (!profileResponse.ok) {

            console.error(
                'Ошибка получения профиля'
            );

            return false;
        }


        const profiles =
            await profileResponse.json();


        if (
            !profiles.length ||
            profiles[0].role !== 'admin'
        ) {

            status.textContent =
                'У вас нет прав администратора.';

            logout();

            return false;
        }


        status.textContent =
            `Вы вошли как администратор: ${user.email}`;

        loginForm.style.display = 'none';

        logoutButton.style.display = 'inline-block';

        return true;

    } catch (error) {

        console.error(error);

        return false;
    }
}


/* =====================================================
   Вход
===================================================== */

loginForm.onsubmit = async (event) => {

    event.preventDefault();

    const formData =
        new FormData(loginForm);

    const email =
        formData.get('email');

    const password =
        formData.get('password');


    status.textContent =
        'Выполняется вход...';


    try {

        const response = await fetch(
            `${cloud.url}/auth/v1/token?grant_type=password`,
            {
                method: 'POST',

                headers: {
                    apikey: cloud.key,
                    'Content-Type':
                        'application/json'
                },

                body: JSON.stringify({
                    email,
                    password
                })
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            status.textContent =
                data.error_description ||
                data.msg ||
                'Неверный email или пароль';

            return;
        }


        token = data.access_token;


        sessionStorage.setItem(
            'stenaAdminToken',
            token
        );


        /* Проверяем роль */

        const isAdmin =
            await checkAdmin();


        if (!isAdmin) {

            sessionStorage.removeItem(
                'stenaAdminToken'
            );

            token = null;

            status.textContent =
                'Вход выполнен, но у этого аккаунта нет прав администратора.';

            return;
        }


        status.textContent =
            'Вы вошли как администратор.';

    } catch (error) {

        console.error(error);

        status.textContent =
            'Ошибка подключения к Supabase.';
    }
};


/* =====================================================
   Выход
===================================================== */

function logout() {

    token = null;

    sessionStorage.removeItem(
        'stenaAdminToken'
    );

    loginForm.style.display = 'block';

    logoutButton.style.display = 'none';

    status.textContent =
        'Вы вышли из аккаунта.';
}


logoutButton.onclick = logout;


/* =====================================================
   Публикация изменений
===================================================== */

async function publish() {

    const isAdmin =
        await checkAdmin();


    if (!isAdmin) {

        status.textContent =
            'Только администратор может публиковать изменения.';

        return;
    }


    const raw =
        localStorage.getItem(
            'stenaSettings'
        );


    if (!raw) {

        status.textContent =
            'Нет данных для сохранения.';

        return;
    }


    const data =
        JSON.parse(raw);


    try {

        const response =
            await cloudRequest(
                '/rest/v1/site_settings?on_conflict=id',
                {
                    method: 'POST',

                    headers: {
                        Prefer:
                            'resolution=merge-duplicates'
                    },

                    body: JSON.stringify({
                        id: 1,
                        data
                    })
                }
            );


        if (response.ok) {

            status.textContent =
                'Изменения опубликованы для всех устройств.';

        } else {

            const error =
                await response.text();

            console.error(error);

            status.textContent =
                'Не удалось сохранить изменения. Проверьте права Supabase.';
        }

    } catch (error) {

        console.error(error);

        status.textContent =
            'Ошибка при сохранении.';
    }
}


/* =====================================================
   Сохранение настроек
===================================================== */

document
    .querySelector('#settingsForm')
    .addEventListener(
        'submit',
        () => {

            setTimeout(
                publish,
                100
            );

        }
    );


/* =====================================================
   Сохранение каталога
===================================================== */

document
    .querySelector('#saveProducts')
    .addEventListener(
        'click',
        () => {

            setTimeout(
                publish,
                100
            );

        }
    );


/* =====================================================
   Проверяем сохранённую сессию
===================================================== */

if (token) {

    checkAdmin();

}
