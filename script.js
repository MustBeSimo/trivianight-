const teamForm = document.getElementById('team-form');
const teamNameInput = document.getElementById('team-name');
const teamsTableBody = document.getElementById('teams-table-body');
const teamRowTemplate = document.getElementById('team-row-template');
const emptyState = document.getElementById('empty-state');
const resetScoresButton = document.getElementById('reset-scores');
const quickButtons = [...document.querySelectorAll('.score-buttons button')];

let teams = loadTeams();
let selectedTeamId = teams[0]?.id ?? null;

renderTeams();

teamForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const name = teamNameInput.value.trim();
  if (!name) return;

  const team = {
    id: crypto.randomUUID(),
    name,
    score: 0,
  };

  teams.push(team);
  selectedTeamId = team.id;
  teamNameInput.value = '';
  persistAndRender();
});

resetScoresButton.addEventListener('click', () => {
  teams = teams.map((team) => ({ ...team, score: 0 }));
  persistAndRender();
});

quickButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if (!selectedTeamId) return;

    const points = Number(button.dataset.points);
    updateScore(selectedTeamId, points);
  });
});

teamsTableBody.addEventListener('click', (event) => {
  const actionButton = event.target.closest('button[data-action]');
  if (!actionButton) return;

  const row = actionButton.closest('tr');
  const teamId = row?.dataset.teamId;
  if (!teamId) return;

  selectedTeamId = teamId;

  if (actionButton.dataset.action === 'remove') {
    teams = teams.filter((team) => team.id !== teamId);
    if (selectedTeamId === teamId) {
      selectedTeamId = teams[0]?.id ?? null;
    }
    persistAndRender();
    return;
  }

  const pointsInput = row.querySelector('[data-field="custom-points"]');
  const points = Math.abs(Number(pointsInput?.value || 0));
  if (!points) return;

  const delta = actionButton.dataset.action === 'add' ? points : -points;
  updateScore(teamId, delta);
});

teamsTableBody.addEventListener('click', (event) => {
  const row = event.target.closest('tr');
  if (!row?.dataset.teamId) return;
  selectedTeamId = row.dataset.teamId;
  renderTeams();
});

function updateScore(teamId, delta) {
  teams = teams.map((team) =>
    team.id === teamId ? { ...team, score: team.score + delta } : team,
  );
  persistAndRender();
}

function persistAndRender() {
  localStorage.setItem('trivia-night-teams', JSON.stringify(teams));
  renderTeams();
}

function loadTeams() {
  const saved = localStorage.getItem('trivia-night-teams');
  if (!saved) return [];

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed)
      ? parsed.filter((team) => team && team.id && team.name)
      : [];
  } catch {
    return [];
  }
}

function renderTeams() {
  const ranked = [...teams].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  teamsTableBody.innerHTML = '';

  ranked.forEach((team, index) => {
    const fragment = teamRowTemplate.content.cloneNode(true);
    const row = fragment.querySelector('tr');

    row.dataset.teamId = team.id;
    if (team.id === selectedTeamId) {
      row.style.background = '#edf2ff';
    }

    row.querySelector('[data-field="rank"]').textContent = String(index + 1);
    row.querySelector('[data-field="name"]').textContent = team.name;
    row.querySelector('[data-field="score"]').textContent = String(team.score);

    teamsTableBody.appendChild(fragment);
  });

  emptyState.classList.toggle('hidden', ranked.length > 0);
}
