# Neuro-XAI Frontend

Clinical-grade brain tumor classification platform UI.

## Stack

- Next.js 14 (App Router)
- TypeScript, Tailwind CSS
- Framer Motion, Recharts, React Query, Axios

## Run

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Flask API

Start the backend from the project root:

```bash
pip install flask flask-cors
python api.py
```

API runs at `http://localhost:5000`. Set `NEXT_PUBLIC_API_URL` in `.env.local` if needed.
