const teamForm = document.getElementById('team-form');
const teamNameInput = document.getElementById('team-name');
const teamsGrid = document.getElementById('teams-grid');
const teamCardTemplate = document.getElementById('team-card-template');
const emptyState = document.getElementById('empty-state');
const resetScoresButton = document.getElementById('reset-scores');
const teamCountEl = document.getElementById('team-count');

const STORAGE_KEY = 'trivia-night-teams';
const MEDALS = ['🥇', '🥈', '🥉'];

let teams = loadTeams();
const customPointsByTeam = new Map();

renderTeams();

teamForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = teamNameInput.value.trim();
  if (!name) return;

  teams.push({
    id: crypto.randomUUID(),
    name,
    score: 0,
  });
  teamNameInput.value = '';
  persistAndRender();
});

resetScoresButton.addEventListener('click', () => {
  if (teams.length === 0) return;
  if (!confirm('Reset every team to 0 points?')) return;
  teams = teams.map((team) => ({ ...team, score: 0 }));
  persistAndRender();
});

teamsGrid.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const card = button.closest('.team-card');
  const teamId = card?.dataset.teamId;
  if (!teamId) return;

  const action = button.dataset.action;

  if (action === 'remove') {
    const team = teams.find((t) => t.id === teamId);
    if (team && !confirm(`Remove "${team.name}"?`)) return;
    teams = teams.filter((t) => t.id !== teamId);
    customPointsByTeam.delete(teamId);
    persistAndRender();
    return;
  }

  if (action === 'quick') {
    const points = Number(button.dataset.points);
    updateScore(teamId, points, card);
    return;
  }

  if (action === 'add' || action === 'subtract') {
    const input = card.querySelector('[data-field="custom-points"]');
    const raw = Math.abs(Number(input?.value || 0));
    if (!raw) return;
    const delta = action === 'add' ? raw : -raw;
    updateScore(teamId, delta, card);
  }
});

teamsGrid.addEventListener('input', (event) => {
  const input = event.target.closest('[data-field="custom-points"]');
  if (!input) return;
  const card = input.closest('.team-card');
  const teamId = card?.dataset.teamId;
  if (!teamId) return;
  customPointsByTeam.set(teamId, input.value);
});

function updateScore(teamId, delta, card) {
  const team = teams.find((t) => t.id === teamId);
  if (!team) return;
  team.score += delta;
  pulseCard(card, delta);
  persistAndRender();
}

function pulseCard(card, delta) {
  if (!card) return;
  card.classList.remove('pulse-up', 'pulse-down');
  void card.offsetWidth;
  card.classList.add(delta >= 0 ? 'pulse-up' : 'pulse-down');
}

function persistAndRender() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
  renderTeams();
}

function loadTeams() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return [];
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed)
      ? parsed.filter((t) => t && t.id && t.name && typeof t.score === 'number')
      : [];
  } catch {
    return [];
  }
}

function renderTeams() {
  const ranked = [...teams].sort(
    (a, b) => b.score - a.score || a.name.localeCompare(b.name),
  );

  teamCountEl.textContent = String(teams.length);
  emptyState.classList.toggle('hidden', ranked.length > 0);

  teamsGrid.innerHTML = '';
  const topScore = ranked[0]?.score ?? 0;

  ranked.forEach((team, index) => {
    const fragment = teamCardTemplate.content.cloneNode(true);
    const card = fragment.querySelector('.team-card');

    card.dataset.teamId = team.id;
    card.dataset.rank = String(index + 1);
    if (index < 3) card.classList.add(`rank-${index + 1}`);
    if (team.score === topScore && team.score > 0) card.classList.add('is-leader');

    card.querySelector('[data-field="rank"]').textContent = `#${index + 1}`;
    card.querySelector('[data-field="medal"]').textContent = MEDALS[index] ?? '';
    card.querySelector('[data-field="name"]').textContent = team.name;
    card.querySelector('[data-field="score"]').textContent = String(team.score);

    const customInput = card.querySelector('[data-field="custom-points"]');
    if (customPointsByTeam.has(team.id)) {
      customInput.value = customPointsByTeam.get(team.id);
    }

    teamsGrid.appendChild(fragment);
  });
}
