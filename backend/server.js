const express = require('express');
const dns = require('dns');
const cors = require('cors');
const app = express();

app.use(cors());

// 🔎 Validation IP (IPv4)
function isValidIP(ip) {
  const ipRegex = /^(25[0-5]|2[0-4]\d|[01]?\d\d?)(\.(25[0-5]|2[0-4]\d|[01]?\d\d?)){3}$/;
  return ipRegex.test(ip);
}

// 🔎 Validation nom de domaine
function isValidDomain(domain) {
  const domainRegex = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,}$/;
  return domainRegex.test(domain);
}

app.get('/dns-query', (req, res) => {
  const { name, type = 'A' } = req.query;

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: "Veuillez entrer un nom de domaine ou une adresse IP." });
  }

  const supportedTypes = ['A', 'AAAA', 'MX', 'TXT', 'CNAME', 'PTR'];
  if (!supportedTypes.includes(type)) {
    return res.status(400).json({ error: `Type '${type}' non supporté.` });
  }

  const cleanedName = name.trim();

  // ✅ Validation spécifique pour PTR
  if (type === 'PTR' && !isValidIP(cleanedName)) {
    return res.status(400).json({ error: "Veuillez entrer une adresse IP valide pour une requête PTR." });
  }

  // ✅ Validation générale (domaine ou IP) pour les autres types
  if (type !== 'PTR' && !isValidDomain(cleanedName) && !isValidIP(cleanedName)) {
    return res.status(400).json({ error: "Veuillez entrer un nom de domaine ou une adresse IP valide." });
  }

  // ✅ Résolution DNS
  if (type === 'PTR') {
    dns.reverse(cleanedName, (err, hostnames) => {
      if (err) {
        return res.status(400).json({
          error: "Nom de domaine ou IP invalide ou introuvable."
        });
      }

      res.json({
        Status: 0,
        Answer: hostnames.map(host => ({
          name: cleanedName,
          type: 12, // PTR
          TTL: 300,
          data: host
        }))
      });
    });
  } else {
    dns.resolve(cleanedName, type, (err, records) => {
      if (err) {
        return res.status(400).json({
          error: "Nom de domaine ou IP invalide ou introuvable."
        });
      }

      let answer;

      if (type === 'MX') {
        answer = records.map(record => ({
          name: cleanedName,
          type: 15, // MX
          TTL: 300,
          data: `${record.priority} ${record.exchange}`
        }));
      } else {
        answer = records.map(data => ({
          name: cleanedName,
          type: type === 'A' ? 1 :
            type === 'AAAA' ? 28 :
              type === 'TXT' ? 16 :
                type === 'CNAME' ? 5 : 0,
          TTL: 300,
          data
        }));
      }

      res.json({
        Status: 0,
        Answer: answer
      });
    });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serveur DNS en écoute sur http://localhost:${PORT}`);
});
