const STATUS_LABELS = {
  calm: "Спокойно",
  "rocket-danger": "Ракетная опасность",
  "drone-danger": "Беспилотная опасность",
  "rocket-attack": "Ракетная атака",
  "drone-attack": "Беспилотная атака",
};

const cards = new Map(
  [...document.querySelectorAll(".city-card")].map((card) => [
    card.dataset.city,
    card,
  ]),
);
let previousStatuses = new Map();
let wasUnavailable = false;

function renderCities(cities) {
  for (const city of cities) {
    const card = cards.get(city.name);
    if (!card || !STATUS_LABELS[city.status]) {
      continue;
    }

    const previousStatus = previousStatuses.get(city.name);
    card.dataset.status = city.status;
    card.querySelector(".status-label").textContent =
      STATUS_LABELS[city.status];

    if (previousStatus && previousStatus !== city.status) {
      card.classList.remove("is-updated");
      void card.offsetWidth;
      card.classList.add("is-updated");
    }
    previousStatuses.set(city.name, city.status);
  }
}

async function refreshCities() {
  try {
    const response = await fetch(`./city_statuses.json?v=${Date.now()}`, {
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const settings = await response.json();
    const cities = Object.entries(settings).map(([name, statuses]) => {
      const status = Object.entries(statuses).find(([, isActive]) => isActive)?.[0];
      return { name, status };
    });

    renderCities(cities);
    wasUnavailable = false;
  } catch (error) {
    if (!wasUnavailable) {
      console.error("Не удалось получить состояния городов.", error);
    }
    wasUnavailable = true;
  }
}

refreshCities();
window.setInterval(refreshCities, 60_000);
