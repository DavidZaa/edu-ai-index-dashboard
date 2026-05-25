import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";


function formatNum(x) {
  if (x === null || x === undefined) return "—";
  const n = Number(x);
  return Number.isFinite(n) ? n.toFixed(2) : "—";
}

export default function App() {
  const [data, setData] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState({ loading: true, error: null });
  const [compareA, setCompareA] = useState("California");
  const [compareB, setCompareB] = useState("New York");
  const [chartType, setChartType] = useState("bar");


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
  const selectedState = filtered.length === 1 ? filtered[0] : top[0];
  const stateA = data.find((row) => row.state === compareA);
  const stateB = data.find((row) => row.state === compareB);
  const stateNames = data.map((row) => row.state);

  const comparisonData =
  stateA && stateB
    ? [
        {
          metric: "Math",
          [stateA.state]: stateA.math_score,
          [stateB.state]: stateB.math_score,
        },
        {
          metric: "English",
          [stateA.state]: stateA.english_score,
          [stateB.state]: stateB.english_score,
        },
        {
          metric: "Tech",
          [stateA.state]: stateA.tech_score,
          [stateB.state]: stateB.tech_score,
        },
        {
          metric: "Index",
          [stateA.state]: stateA.index,
          [stateB.state]: stateB.index,
        },
      ]
    : [];

  return (
    <div className="container">
      <div className="header">
        <div>
          <h1>EduCity AI Index</h1>
<p className="subtitle">
  A data dashboard comparing math performance, English performance, and technology readiness across U.S. states.
</p>
        </div>
        <span className="badge">MVP: CSV → Python → JSON → React</span>
      </div>

      <div className="card hero-card">
        <h2>Search a state</h2>
        <p className="small">
          View education outcomes, technology readiness scores, and overall index.
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

            <div className="chartBox">
            <h2>Top States by EduCity Index</h2>

            <div className="chartControls">
              <button
                className={chartType === "bar" ? "activeButton" : ""}
                onClick={() => setChartType("bar")}
              >
                Bar Chart
              </button>

              <button
                className={chartType === "line" ? "activeButton" : ""}
                onClick={() => setChartType("line")}
              >
                Line Chart
              </button>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              {chartType === "bar" ? (
                <BarChart data={top}>
                  <XAxis dataKey="state" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="index" />
                </BarChart>
              ) : (
                <LineChart data={top}>
                  <XAxis dataKey="state" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="index" strokeWidth={2} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>

          {selectedState && (
            <div className="reportBox">
              <h2>AI-Generated Report Preview</h2>
              <h3>{selectedState.state}</h3>

              <p>
                {selectedState.state} has an overall EduCity Index of{" "}
                <b>{formatNum(selectedState.index)}</b>. Its math score is{" "}
                <b>{formatNum(selectedState.math_score)}</b>, English score is{" "}
                <b>{formatNum(selectedState.english_score)}</b>, and technology readiness
                score is <b>{formatNum(selectedState.tech_score)}</b>.
              </p>

            </div>
          )}

          <div className="comparisonBox">
            <h2>Compare Two States</h2>

            <div className="row">
              <select value={compareA} onChange={(e) => setCompareA(e.target.value)}>
                {stateNames.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>

              <select value={compareB} onChange={(e) => setCompareB(e.target.value)}>
                {stateNames.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            {stateA && stateB && (
              <p>
                <b>{stateA.state}</b> has an index of <b>{formatNum(stateA.index)}</b>,
                while <b>{stateB.state}</b> has an index of <b>{formatNum(stateB.index)}</b>.
                The difference is{" "}
                <b>{formatNum(Math.abs(stateA.index - stateB.index))}</b> points.
              </p>
            )}
          </div>

          {stateA && stateB && (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData}>
                <XAxis dataKey="metric" />
                <YAxis />
                <Tooltip />
                <Bar dataKey={stateA.state} />
                <Bar dataKey={stateB.state} />
              </BarChart>
            </ResponsiveContainer>
          )}
          </>
        )}
      </div>

      

    </div>
  );
}
