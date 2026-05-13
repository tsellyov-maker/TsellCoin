import http from "http";
import { execFile } from "child_process";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const CLI = process.env.TSELLCOIN_CLI || path.join(ROOT, "build/bin/tsellcoin-cli");
const DATADIR = process.env.TSELLCOIN_DATADIR || path.join(os.homedir(), ".tsellcoin-node1");
const RPCPORT = process.env.TSELLCOIN_RPCPORT || "18389";
const PORT = Number(process.env.EXPLORER_PORT || 4000);

function runCli(args, parseJson = true) {
  return new Promise((resolve, reject) => {
    const fullArgs = [`-datadir=${DATADIR}`, `-rpcport=${RPCPORT}`, ...args];

    execFile(CLI, fullArgs, { timeout: 15000 }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr.trim() || error.message));
        return;
      }

      const text = stdout.trim();

      if (!parseJson) {
        resolve(text);
        return;
      }

      try {
        resolve(JSON.parse(text));
      } catch {
        resolve(text);
      }
    });
  });
}

async function getRecentBlocks(limit = 10) {
  const height = await runCli(["getblockcount"]);
  const blocks = [];

  for (let h = height; h >= Math.max(0, height - limit + 1); h--) {
    const hash = await runCli(["getblockhash", String(h)]);
    const block = await runCli(["getblock", hash, "2"]);

    blocks.push({
      height: block.height,
      hash: block.hash,
      previousblockhash: block.previousblockhash || null,
      time: block.time,
      txCount: block.tx?.length || 0,
      size: block.size,
      weight: block.weight,
      confirmations: block.confirmations,
      tx: (block.tx || []).map((tx) => ({
        txid: tx.txid,
        size: tx.size,
        vsize: tx.vsize,
        fee: tx.fee ?? null,
        vin: tx.vin?.length || 0,
        vout: tx.vout?.length || 0,
      })),
    });
  }

  return blocks;
}

function json(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data, null, 2));
}

function html(res, body) {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(body);
}

function page() {
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>TsellCoin Explorer</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    :root {
      color-scheme: dark;
      font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #050505;
      color: #f2f2f2;
    }

    body {
      margin: 0;
      padding: 32px;
      background:
        radial-gradient(circle at top left, rgba(255,255,255,0.08), transparent 35%),
        #050505;
    }

    .container {
      max-width: 1180px;
      margin: 0 auto;
    }

    header {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: center;
      margin-bottom: 28px;
    }

    h1 {
      font-size: 32px;
      margin: 0;
      letter-spacing: -0.04em;
    }

    .muted {
      color: #aaa;
      font-size: 14px;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 14px;
      margin-bottom: 22px;
    }

    .card {
      background: rgba(255,255,255,0.055);
      border: 1px solid rgba(255,255,255,0.10);
      border-radius: 18px;
      padding: 18px;
      box-shadow: 0 16px 50px rgba(0,0,0,0.25);
    }

    .label {
      color: #aaa;
      font-size: 13px;
      margin-bottom: 8px;
    }

    .value {
      font-size: 22px;
      font-weight: 700;
      word-break: break-all;
    }

    .hash {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 13px;
      word-break: break-all;
    }

    .section-title {
      font-size: 20px;
      margin: 26px 0 12px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      overflow: hidden;
      border-radius: 16px;
    }

    th, td {
      padding: 12px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      text-align: left;
      font-size: 14px;
    }

    th {
      color: #aaa;
      font-weight: 500;
      background: rgba(255,255,255,0.04);
    }

    tr:hover td {
      background: rgba(255,255,255,0.035);
    }

    button {
      border: 0;
      background: #f2f2f2;
      color: #050505;
      border-radius: 999px;
      padding: 10px 16px;
      font-weight: 700;
      cursor: pointer;
    }

    .error {
      color: #ff7b7b;
      white-space: pre-wrap;
    }

    .pill {
      display: inline-flex;
      border: 1px solid rgba(255,255,255,0.14);
      border-radius: 999px;
      padding: 5px 10px;
      color: #ddd;
      font-size: 12px;
    }

    @media (max-width: 900px) {
      body { padding: 18px; }
      .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }

    @media (max-width: 560px) {
      .grid { grid-template-columns: 1fr; }
      header { align-items: flex-start; flex-direction: column; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div>
        <h1>TsellCoin Explorer</h1>
        <div class="muted">Local explorer conectado ao node1 via tsellcoin-cli</div>
      </div>
      <button onclick="load()">Atualizar</button>
    </header>

    <div id="app">
      <div class="muted">Carregando...</div>
    </div>
  </div>

  <script>
    function fmtTime(ts) {
      return new Date(ts * 1000).toLocaleString("pt-BR");
    }

    function shortHash(hash) {
      if (!hash) return "-";
      return hash.slice(0, 16) + "..." + hash.slice(-16);
    }

    async function load() {
      const app = document.getElementById("app");
      app.innerHTML = '<div class="muted">Carregando...</div>';

      try {
        const res = await fetch("/api/status");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Erro desconhecido");
        }

        const peers = data.peers || [];
        const blocks = data.recentBlocks || [];
        const vpsPeer = peers.find(p => (p.addr || "").includes("109.199.100.175"));

        app.innerHTML = \`
          <div class="grid">
            <div class="card">
              <div class="label">Chain</div>
              <div class="value">\${data.blockchain.chain}</div>
            </div>
            <div class="card">
              <div class="label">Blocos</div>
              <div class="value">\${data.blockchain.blocks}</div>
            </div>
            <div class="card">
              <div class="label">Peers</div>
              <div class="value">\${data.connectionCount}</div>
            </div>
            <div class="card">
              <div class="label">Mempool</div>
              <div class="value">\${data.mempool.size} tx</div>
            </div>
          </div>

          <div class="card">
            <div class="label">Best block</div>
            <div class="hash">\${data.blockchain.bestblockhash}</div>
            <br>
            <span class="pill">VPS: \${vpsPeer ? "conectada" : "não conectada"}</span>
            <span class="pill">IBD: \${data.blockchain.initialblockdownload ? "sim" : "não"}</span>
            <span class="pill">Dificuldade: \${data.blockchain.difficulty}</span>
          </div>

          <div class="section-title">Peers</div>
          <div class="card">
            <table>
              <thead>
                <tr>
                  <th>Endereço</th>
                  <th>Tipo</th>
                  <th>Ping</th>
                  <th>Blocos sync</th>
                </tr>
              </thead>
              <tbody>
                \${peers.map(p => \`
                  <tr>
                    <td class="hash">\${p.addr}</td>
                    <td>\${p.connection_type || "-"}</td>
                    <td>\${p.pingtime ? p.pingtime.toFixed(3) + "s" : "-"}</td>
                    <td>\${p.synced_blocks}</td>
                  </tr>
                \`).join("") || '<tr><td colspan="4">Nenhum peer conectado</td></tr>'}
              </tbody>
            </table>
          </div>

          <div class="section-title">Últimos blocos</div>
          <div class="card">
            <table>
              <thead>
                <tr>
                  <th>Altura</th>
                  <th>Hash</th>
                  <th>Transações</th>
                  <th>Hora</th>
                </tr>
              </thead>
              <tbody>
                \${blocks.map(b => \`
                  <tr>
                    <td>\${b.height}</td>
                    <td class="hash">\${shortHash(b.hash)}</td>
                    <td>\${b.txCount}</td>
                    <td>\${fmtTime(b.time)}</td>
                  </tr>
                \`).join("")}
              </tbody>
            </table>
          </div>
        \`;
      } catch (err) {
        app.innerHTML = '<div class="card error">' + err.message + '</div>';
      }
    }

    load();
    setInterval(load, 10000);
  </script>
</body>
</html>`;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  try {
    if (url.pathname === "/") {
      html(res, page());
      return;
    }

    if (url.pathname === "/api/status") {
      const [blockchain, network, connectionCount, peers, mempool, recentBlocks] = await Promise.all([
        runCli(["getblockchaininfo"]),
        runCli(["getnetworkinfo"]),
        runCli(["getconnectioncount"]),
        runCli(["getpeerinfo"]),
        runCli(["getmempoolinfo"]),
        getRecentBlocks(10),
      ]);

      json(res, 200, {
        blockchain,
        network,
        connectionCount,
        peers,
        mempool,
        recentBlocks,
      });
      return;
    }

    if (url.pathname.startsWith("/api/block/")) {
      const id = decodeURIComponent(url.pathname.replace("/api/block/", ""));
      const hash = /^\\d+$/.test(id) ? await runCli(["getblockhash", id]) : id;
      const block = await runCli(["getblock", hash, "2"]);
      json(res, 200, block);
      return;
    }

    if (url.pathname.startsWith("/api/tx/")) {
      const txid = decodeURIComponent(url.pathname.replace("/api/tx/", ""));
      const tx = await runCli(["getrawtransaction", txid, "true"]);
      json(res, 200, tx);
      return;
    }

    json(res, 404, { error: "Not found" });
  } catch (err) {
    json(res, 500, { error: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`TsellCoin Explorer rodando em http://localhost:${PORT}`);
  console.log(`CLI: ${CLI}`);
  console.log(`DATADIR: ${DATADIR}`);
  console.log(`RPCPORT: ${RPCPORT}`);
});
