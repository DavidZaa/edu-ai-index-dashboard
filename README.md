# EduCity AI Index Dashboard

A beginner-friendly MVP dashboard that compares education outcomes and technology readiness across states.

## What this project does

The project uses a simple data pipeline:

```text
CSV → Python cleaning/index calculation → JSON → React dashboard
```

The prototype index formula is:

```text
Index = 0.4 × Math Score + 0.4 × English Score + 0.2 × Tech Score
```

Important methodology note: this project compares proxy indicators. It does **not** prove that AI or technology causes education outcomes.

## Project structure

```text
educity_ai_index_fixed/
  data/
    raw/state_metrics_sample.csv        # input data
    processed/state_index.csv           # generated processed CSV
  scripts/
    build_index.py                      # Python data pipeline
  frontend/
    index.html
    package.json
    public/data/state_index.json        # generated JSON used by React
    src/
      App.jsx
      main.jsx
      styles.css
```

## Setup

### 1. Install Node.js
Install Node.js LTS from https://nodejs.org.

Check:

```bash
node -v
npm -v
```

### 2. Install Python packages
From the project root:

```bash
pip install pandas
```

### 3. Build the data file
From the project root:

```bash
python scripts/build_index.py
```

This writes:

```text
data/processed/state_index.csv
frontend/public/data/state_index.json
```

### 4. Run the React website

```bash
cd frontend
npm install
npm run dev
```

Open the local URL shown in the terminal, usually:

```text
http://localhost:5173
```

## GitHub workflow

After each meaningful edit:

```bash
git add .
git commit -m "Describe what changed"
git push
```
