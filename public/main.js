const loginSection = document.querySelector('#login-section');
const attackSection = document.querySelector('#attack-section');
const loginForm = document.querySelector('#login-form');
const loginMessage = document.querySelector('#login-message');
const roleOutput = document.querySelector('#role-output');
const hpCountOutput = document.querySelector('#hp-count-output');
const attackButton = document.querySelector('#attack-button');
const flagOutput = document.querySelector('#flag-output');

let role = 'guest';
let currentCount = 99999;
let hasFlag = false;

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? 'Request failed');
  }

  return data;
}

function updateAttackState() {
  roleOutput.textContent = role;
  hpCountOutput.textContent = String(currentCount);
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(loginForm);
  loginMessage.textContent = '';

  try {
    const data = await postJson('/api/login', {
      username: formData.get('username'),
      password: formData.get('password'),
    });

    role = data.role;
    currentCount = data.clickCountRequired;
    hasFlag = false;
    updateAttackState();

    loginSection.hidden = true;
    attackSection.hidden = false;
  } catch (error) {
    loginMessage.textContent = error.message;
  }
});

attackButton.addEventListener('click', async () => {
  if (hasFlag) {
    return;
  }

  currentCount -= 1;
  updateAttackState();
  flagOutput.textContent = '';

  if (currentCount > 0) {
    return;
  }

  if (role !== 'admin') {
    flagOutput.textContent = 'admin 권한과 HP 0 이하 조건이 필요합니다.';
    return;
  }

  try {
    const data = await postJson('/api/flag', {
      currentCount,
      role,
    });

    flagOutput.textContent = data.flag;
    hasFlag = true;
  } catch (error) {
    flagOutput.textContent = error.message;
  }
});
