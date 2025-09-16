// CSV formating: handles converting rows of data into a CSV file.
function csvEscape(s){ s = s == null ? "" : String(s); return /[",\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s; }
function rowsToCSV(rows) {
  const csv = rows.map(r => r.map(csvEscape).join(",")).join("\n");
  return new Blob([new Uint8Array([0xEF,0xBB,0xBF]), csv], { type: "text/csv;charset=utf-8" });
}
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// API Data Fetching: Asks Canvas API for enrollment & course data.
async function fetchAll(url) {
  const out = [];
  let nextUrl = url;
  while (nextUrl) {
    const res = await fetch(nextUrl, { credentials: "same-origin" });
    if (!res.ok) throw new Error(`API ${res.status} ${res.statusText}`);
    out.push(...await res.json());
    const link = res.headers.get("Link");
    if (!link) break;
    const next = link.split(",").map(s => s.trim()).find(s => s.endsWith('rel="next"'));
    nextUrl = next ? (next.match(/<([^>]+)>/)?.[1] ?? null) : null;
  }
  return out;
}

// Fetches Enrollment Data
async function getEnrollments() {
  const url = "/api/v1/users/self/enrollments"
    + "?type[]=StudentEnrollment"
    + "&state[]=active"
    + "&include[]=total_scores"
    + "&per_page=100";
  return await fetchAll(url);
}

// Feteches Course Names
async function getCourseName(courseId) {
  const res = await fetch(`/api/v1/courses/${courseId}`, { credentials: "same-origin" });
  if (!res.ok) return `Course ${courseId}`;
  const data = await res.json();
  return data?.name ?? `Course ${courseId}`;
}

// Prepares CSV for Export: Uses Enrollments, Populates Rows, and Triggers CSV Download.
async function exportCanvasCoursesToCSV() {
  try {
    const enrollments = await getEnrollments();

    // Populates Course Name 
    const nameCache = new Map();
    for (const e of enrollments) if (e.course?.name) nameCache.set(e.course_id, e.course.name); // some enrollments include course.name; if not, fetch
    const missing = [...new Set(enrollments.filter(e => !nameCache.has(e.course_id)).map(e => e.course_id))];
    await Promise.all(missing.map(async id => nameCache.set(id, await getCourseName(id))));

    const header = ["Course ID", "Course Name", "Current Grade", "Current Letter Grade", "Date"]; //CSV Headers
    const rows = [header];

    const today = new Date().toISOString().split("T")[0]; // Adds Date of Extraction: formatted as YYYY-MM-DD

    for (const e of enrollments) {
      rows.push([
        String(e.course_id),
        nameCache.get(e.course_id) ?? `Course ${e.course_id}`,
        e.grades?.current_score ?? "",
        e.grades?.current_grade ?? "",
        today
      ].map(v => v == null ? "" : String(v)));
    }

    const blob = rowsToCSV(rows);
    downloadBlob(blob, `current_canvas_grades.csv`);
  } catch (err) {
    console.error("Export failed:", err);
    alert(`Export failed: ${err.message || err}`);
  }
}

// UI injection: Adds Export Button To Bottom Right Hand Side of Screen.
function injectButtonStyles() {
  if (document.getElementById("cgx-btn-styles")) return;
  const style = document.createElement("style");
  style.id = "cgx-btn-styles";
  style.textContent = `
  .cgx-btn {
  width: 100px;
  height: 48px;
  border: 2px solid #e21a00ff;
  border-radius: 25px;
  transition: all 0.3s;
  cursor: pointer;
  background: #e13f2a;
  font-size: 0.9em;
  font-weight: 600;
  font-family: "Lato", "Helvetica Neue", Helvetica, Arial, sans-serif;
  color: #ffffffff;
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 2147483647;
  box-shadow: 0 4px 10px rgba(0,0,0,.15);
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  }

  .cgx-btn:hover {
  background: #e24d3a;
  border: 4px solid #e1351eff;
  font-size: 1em;
  }`;
  document.head.appendChild(style);
}

function makeButton() {
  const existing = document.getElementById("cgx-export-btn");
  if (existing) return existing;

  injectButtonStyles();

  const btn = document.createElement("button");
  btn.id = "cgx-export-btn";
  btn.className = "cgx-btn";
  btn.textContent = "Export Grades";
  btn.title = "Download a CSV of your current course grades";

  // Checks for Button Activation
  btn.addEventListener("click", () => {
    btn.disabled = true;
    const oldText = btn.textContent;
    btn.textContent = "Exporting…";
    exportCanvasCoursesToCSV()
      .finally(() => {
        btn.disabled = false;
        btn.textContent = oldText;
      });
  });

  document.body.appendChild(btn);
  return btn;
}

// Only inject on top window when DOM is ready
function ready(fn) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn, { once: true });
  } else {
    fn();
  }
}

function onDashboard() {
  return !!document.querySelector(".ic-DashboardCard"); // Checks if Canvas card grid exists
}

function ensureButton() {
  if (!onDashboard()) return;
  makeButton();
}

// Observes basic navigations / DOM changes
const observer = new MutationObserver(() => ensureButton());
ready(() => {
  ensureButton();
  observer.observe(document.documentElement, { childList: true, subtree: true });
});

// Also re-runs after history changes
(function (history) {
  const pushState = history.pushState;
  history.pushState = function () {
    const ret = pushState.apply(this, arguments);
    setTimeout(ensureButton, 0);
    return ret;
  };
  window.addEventListener("popstate", () => setTimeout(ensureButton, 0));
})(window.history);
