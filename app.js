let collegesByState = {};

function courseString(arr) {
  if (!Array.isArray(arr)) return "";
  return arr.join(", ");
}

function showColleges(colleges) {
  const container = document.getElementById('college-list');
  container.innerHTML = '';
  if (!colleges || colleges.length === 0) {
    container.innerHTML = '<div style="text-align:center;">No colleges found.</div>';
    return;
  }
  colleges.forEach((college, i) => {
    const card = document.createElement('div');
    card.className = 'college-card';

    // NIRF badge
    const nirfBadge = (college.nirf_rank_2025 && college.nirf_rank_2025 !== "none")
      ? `<span class="college-nirf-rank${college.nirf_rank_2025 <= 100 ? '' : ' none'}">NIRF: ${college.nirf_rank_2025}</span>`
      : `<span class="college-nirf-rank none">NIRF: None</span>`;

    // Category badge
    const cat = (college.category)
      ? `<span class="college-cat ${college.category.replace(/\s/g, '')}">${college.category}</span>`
      : '';

    // Affiliation/info
    const aff = college.affiliation ? `<span class="college-aff">${college.affiliation}</span>` : '';
    const contact = college.contact ? `<span class="college-contact">📞 ${college.contact}</span>` : '';
    const email = college.email ? `<span class="college-email">📧 ${college.email}</span>` : '';

    // Links
    const website = college.website ? `<a href="${college.website}" class="website-link" target="_blank" rel="noopener">Website</a>` : "";
    const map = college.map_link ? `<a href="${college.map_link}" class="map-link" target="_blank" rel="noopener">Map</a>` : "";

    // Placement
    const placement = college.placement_percent ? `<div class="placement">Placements: ${college.placement_percent}%</div>` : "";

    // Courses toggle functionality
    const coursesBtnID = `coursesBtn${i}`;
    const coursesBlockID = `coursesList${i}`;
    const coursesHtml = (college.courses && college.courses.length)
      ? `<button class="college-courses-toggle" id="${coursesBtnID}" onclick="toggleCourses('${coursesBlockID}')">Show Courses</button>
         <div class="college-courses" id="${coursesBlockID}" style="display:none;">${courseString(college.courses)}</div>`
      : "";

    card.innerHTML = `
      <div class="college-header">
        <div class="college-rank">#${college.rank}</div>
        ${nirfBadge}
        ${cat}
      </div>
      <div class="college-name">${college.name}</div>
      <div class="college-location">${college.location} ${map}</div>
      ${aff}
      ${website}
      <br>
      ${contact}
      ${email}
      ${placement}
      ${coursesHtml}
    `;
    container.appendChild(card);
  });
}

// Toggle courses display
window.toggleCourses = function(divId) {
  const coursesDiv = document.getElementById(divId);
  if (!coursesDiv) return;
  coursesDiv.style.display = coursesDiv.style.display === 'block' ? 'none' : 'block';
};

function getSelectedStateColleges() {
  const state = document.getElementById('stateSelect').value;
  let colleges = [];
  if (state === 'All') {
    Object.values(collegesByState).forEach(arr => colleges = colleges.concat(arr));
  } else {
    colleges = collegesByState[state] || [];
  }
  return colleges;
}

function reloadColleges() {
  showColleges(getSelectedStateColleges());
}

function searchColleges() {
  const text = document.getElementById('searchBar').value.trim().toLowerCase();
  let colleges = getSelectedStateColleges();

  if (!text) {
    showColleges(colleges);
    return;
  }
  const filtered = colleges.filter(c =>
    (c.name && c.name.toLowerCase().includes(text)) ||
    (c.location && c.location.toLowerCase().includes(text)) ||
    (c.rank && c.rank.toString() === text) ||
    (c.nirf_rank_2025 && c.nirf_rank_2025.toString() === text) ||
    (c.category && c.category.toLowerCase().includes(text)) ||
    (c.affiliation && c.affiliation.toLowerCase().includes(text)) ||
    (c.website && c.website.toLowerCase().includes(text)) ||
    (c.courses && c.courses.join(' ').toLowerCase().includes(text))
  );
  showColleges(filtered);
}

fetch('colleges.json')
  .then(response => response.json())
  .then(data => {
    collegesByState = data.colleges_by_state;

    // Fill dropdown
    const stateSelect = document.getElementById('stateSelect');
    const states = Object.keys(collegesByState);
    states.forEach(state => {
      let opt = document.createElement('option');
      opt.value = state;
      opt.text = state;
      stateSelect.appendChild(opt);
    });

    reloadColleges();

    document.getElementById('searchBtn').onclick = searchColleges;
    stateSelect.onchange = reloadColleges;
    document.getElementById('searchBar').addEventListener('keyup', function (event) {
      if (event.key === 'Enter') searchColleges();
    });
  })
  .catch(err => {
    document.getElementById('college-list').innerHTML = 'Failed to load college data.';
    console.error('Failed to load college data', err);
  });

