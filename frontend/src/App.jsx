import { useEffect, useMemo, useState } from "react";

function formatNum(x) {
  if (x === null || x === undefined) return "—";
  const n = Number(x);
  return Number.isFinite(n) ? n.toFixed(2) : "—";
}

export default function App() {
  const [data, setData] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState({ loading: true, error: null });

  useEffect(() => {
    async function load() {
      try {
        setStatus({ loading: true, error: null });
        const res = await fetch("/data/state_index.json");
        if (!res.ok) {
          throw new Error(`Failed to load JSON: ${res.status} ${res.statusText}`);
        }
        const json = await res.json();
        if (!Array.isArray(json)) {
          throw new Error("state_index.json must contain an array of records.");
        }
        setData(json);
        setStatus({ loading: false, error: null });
      } catch (e) {
        setStatus({ loading: false, error: e.message || String(e) });
      }
    }

    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter((row) =>
      String(row.state ?? "").toLowerCase().includes(q)
    );
  }, [data, query]);

  const top = filtered.slice(0, 10);

  return (
    <div className="container">
      <div className="header">
        <div>
          <h1>EduCity AI Index</h1>
          <p className="subtitle">
            Prototype dashboard comparing <b>education outcomes</b> and{" "}
            <b>technology readiness</b> across states.
          </p>
        </div>
        <span className="badge">MVP: CSV → Python → JSON → React</span>
      </div>

      <div className="card hero-card">
        <h2>Search a state</h2>
        <p className="small">
          This MVP uses sample state-level data. Later, the project can replace the
          sample file with real public datasets.
        </p>

        <div className="row">
          <input
            className="search"
            placeholder="Search state (e.g., California)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="small formula">
            Index formula: <b>0.4</b> Math + <b>0.4</b> English + <b>0.2</b> Tech
          </div>
        </div>

        {status.loading && <p className="small">Loading data…</p>}

        {status.error && (
          <p className="small error">
            Error: {status.error}
            <br />
            Tip: from the project root, run <code>python scripts/build_index.py</code> to
            generate <code>frontend/public/data/state_index.json</code>.
          </p>
        )}

        {!status.loading && !status.error && (
          <>
            <p className="small">
              Showing <b>{filtered.length}</b> result(s). Top 10 by index shown below.
            </p>

            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>State</th>
                    <th>Math</th>
                    <th>English</th>
                    <th>Tech</th>
                    <th>Index</th>
                    <th>Year</th>
                  </tr>
                </thead>
                <tbody>
                  {top.map((row) => (
                    <tr key={row.state}>
                      <td>
                        <b>{row.state}</b>
                      </td>
                      <td>{formatNum(row.math_score)}</td>
                      <td>{formatNum(row.english_score)}</td>
                      <td>{formatNum(row.tech_score)}</td>
                      <td>
                        <b>{formatNum(row.index)}</b>
                      </td>
                      <td>{row.year ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="small methodology-note">
              Methodology note: this prototype provides comparisons using proxy
              indicators; it does not prove causal impact.
            </p>
          </>
        )}
      </div>

      <div className="card grid-card">
        <div>
          <h2>What to add next</h2>
          <p className="small">
            Suggested visuals for later milestones: a bar chart ranking states by
            index, score breakdown charts for Math vs English vs Tech, and a
            Methodology page explaining datasets and limitations.
          </p>
        </div>
        <div>
          <h2>Why this is credible</h2>
          <p className="small">
            The AI should explain results only after the data pipeline calculates
            them. The numbers come from structured data, not from AI guesses.
          </p>
        </div>
      </div>
    </div>
  );
}
