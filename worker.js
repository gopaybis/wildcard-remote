const BAD_WORDS_LIST = "https://raw.githubusercontent.com/coffee-and-fun/google-profanity-words/main/list.txt";

class CloudflareApi {
  constructor({ apiKey, apiEmail, accountID, zoneID, serviceName, rootDomain, appDomain }) {
    this.apiKey = apiKey;
    this.apiEmail = apiEmail;
    this.accountID = accountID;
    this.zoneID = zoneID;
    this.serviceName = serviceName;
    this.rootDomain = rootDomain;
    this.appDomain = appDomain;
    this.headers = {
      "X-Auth-Email": this.apiEmail,
      "X-Auth-Key": this.apiKey,
      "Content-Type": "application/json",
    };
  }

  async getDomainList() {
    const url = `https://api.cloudflare.com/client/v4/accounts/${this.accountID}/workers/domains`;
    const res = await fetch(url, { headers: this.headers });
    if (res.status === 200) {
      const json = await res.json();
      return json.result
        .filter((item) => item.service === this.serviceName)
        .map((item) => item.hostname);
    }
    return [];
  }

  async registerDomain(domain) {
    domain = domain.toLowerCase();
    const registered = await this.getDomainList();
    if (!domain.endsWith(this.rootDomain)) return 400;
    if (registered.includes(domain)) return 409;

    try {
      const badList = await fetch(BAD_WORDS_LIST);
      if (badList.status === 200) {
        const text = await badList.text();
        const badWords = text.split("\n").map(w => w.trim().toLowerCase());
        for (const word of badWords) {
          if (word && domain.includes(word)) return 403;
        }
      }
    } catch {
      return 403;
    }

    const url = `https://api.cloudflare.com/client/v4/accounts/${this.accountID}/workers/domains`;
    const res = await fetch(url, {
      method: "PUT",
      headers: this.headers,
      body: JSON.stringify({
        environment: "production",
        hostname: domain,
        service: this.serviceName,
        zone_id: this.zoneID,
      }),
    });

    return res.status;
  }
}

const htmlPage = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <title>🌐 Daftar Subdomain Wildcard</title>
  <style>
    body { background: #121212; color: #fff; font-family: sans-serif; text-align: center; padding: 2rem; }
    input, button { padding: 0.6rem; font-size: 1rem; margin: 0.5rem; border-radius: 6px; border: none; }
    input { width: 320px; background: #1e1e1e; color: white; border: 1px solid #333; }
    button { background: #00e676; color: black; cursor: pointer; font-weight: bold; }
    .result { margin-top: 1rem; font-size: 1.3rem; font-weight: bold; }
    .note { font-size: 0.9rem; color: #ccc; margin-top: 1.5rem; text-align: left; display: inline-block; }
    .subdomain-list { margin-top: 2rem; max-width: 480px; margin-left: auto; margin-right: auto; }
    .subdomain-item {
      display: flex; justify-content: space-between; align-items: center;
      background: #1c1c1c; padding: 0.5rem 0.8rem;
      margin-bottom: 0.4rem; border-radius: 6px; font-size: 1rem;
    }
    .subdomain-item a {
      text-decoration: none; color: #64b5f6; display: flex; align-items: center;
    }
    .actions button {
      background: transparent; border: none; color: #ccc;
      font-size: 1.2rem; margin-left: 0.4rem; cursor: pointer;
    }
  </style>
</head>
<body>
  <h1>🌐 Daftar Subdomain <span style="color:#00e676">Wildcard</span></h1>
  <p>Contoh input: <code>tokopedia.com</code></p>
  <input type="text" id="wildcard" placeholder="contoh: tokopedia.com" />
  <button onclick="submit()">🧩 Daftarkan</button>
  <div class="result" id="result"></div>

  <div class="note">
    <strong>Status Kode:</strong><br>
    ✅ 200 → Berhasil<br>
    ⚠️ 409 → Sudah terdaftar<br>
    ❌ 400 → Format domain tidak valid<br>
    ⛔ 403 → Kata dilarang
  </div>

  <div class="subdomain-list" id="list"></div>

  <script>
    async function submit() {
      const wildcard = document.getElementById("wildcard").value.trim();
      const full = wildcard + ".sub.domain.org";
      const result = document.getElementById("result");
      result.textContent = "⏳ Mendaftarkan " + full + " ...";

      try {
        const res = await fetch("?subdomain=" + encodeURIComponent(full));
        const text = await res.text();
        result.textContent = text.includes("200") ? "✅ Berhasil daftar!" : text;
        loadSubdomains();
      } catch (err) {
        result.textContent = "❌ Gagal menghubungi Worker. Error: " + err;
      }
    }

    async function loadSubdomains() {
      const res = await fetch("?list=1");
      const data = await res.json();
      const container = document.getElementById("list");
      container.innerHTML = "<h2 style='margin-bottom:0.8rem;'>📋 Subdomain Terdaftar</h2>";
      if (data.length === 0) {
        container.innerHTML += "<p>Tidak ada subdomain terdaftar.</p>";
        return;
      }
      for (const d of data) {
        const div = document.createElement("div");
        div.className = "subdomain-item";
        div.innerHTML = \`
          <a href="https://\${d}" target="_blank">🔗 \${d}</a>
          <span class="actions">
            <button onclick="window.open('https://\${d}', '_blank')">🌍</button>
            <button onclick="navigator.clipboard.writeText('\${d}').then(()=>alert('📋 Disalin!'))">📋</button>
          </span>
        \`;
        container.appendChild(div);
      }
    }

    loadSubdomains();
  </script>
</body>
</html>`;

export default {
  async fetch(request) {
    try {
      const { searchParams } = new URL(request.url);
      const subdomain = searchParams.get("subdomain");
      const isList = searchParams.get("list");

      const cf = new CloudflareApi({
        apiKey: "0e0d008a2fffb71ef2ka40abice7b77d32116",  //global api key
        apiEmail: "emailakun@gmail.com",
        accountID: "33b36e191faaf3caa3520l3dc9bb9a48",
        zoneID: "2549576b91cc7u2231c648064f744346",
        serviceName: "v1",
        rootDomain: "domain.org",
        appDomain: "sub.domain.org",
      });

      if (isList) {
        const list = await cf.getDomainList();
        return new Response(JSON.stringify(list), {
          headers: { "Content-Type": "application/json" }
        });
      }

      if (!subdomain) {
        return new Response(htmlPage, {
          headers: { "Content-Type": "text/html; charset=UTF-8" },
        });
      }

      const status = await cf.registerDomain(subdomain);
      return new Response(`${status}`);
    } catch (err) {
      return new Response("❌ Worker Error: " + err.message, {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      });
    }
  }
};
