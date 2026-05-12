import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json());

const RETELL_API_KEY = process.env.RETELL_API_KEY;
const AGENT_ID       = process.env.RETELL_AGENT_ID;

// ── STATIC ────────────────────────────────────────────────────────────────

app.get('/', (req, res) => res.sendFile(join(__dirname, 'index.html')));

// Bundled Retell SDK (built by postinstall via build.mjs)
app.get('/retell-sdk.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(join(__dirname, 'retell-sdk.js'));
});

// ── START VOICE CALL ──────────────────────────────────────────────────────

app.post('/start-call', async (req, res) => {
  const { user_name } = req.body;
  if (!user_name?.trim()) {
    return res.status(400).json({ error: 'user_name is required' });
  }

  try {
    const response = await fetch('https://api.retellai.com/v2/create-web-call', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RETELL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agent_id: AGENT_ID,
        retell_llm_dynamic_variables: {
          user_name:     user_name.trim(),
          name:          user_name.trim(),
          employee_name: user_name.trim(),
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Retell create-web-call error:', response.status, err);
      return res.status(response.status).json({ error: 'Failed to create call', detail: err });
    }

    const data = await response.json();
    return res.json({ access_token: data.access_token, call_id: data.call_id });

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── HEALTH ────────────────────────────────────────────────────────────────

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`AI Fluency Agent server running on http://localhost:${PORT}`));
