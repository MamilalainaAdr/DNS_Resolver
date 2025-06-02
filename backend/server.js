const express = require('express');
const dns = require('dns');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors()); // Autoriser les requêtes cross-origin (pour le frontend)

// Endpoint DoH (GET)
app.get('/dns-query', (req, res) => {
  const { name, type = 'A' } = req.query;

  // Validation
  if (!name) return res.status(400).json({ error: "Le paramètre 'name' est requis." });

  // Types DNS supportés
  const supportedTypes = ['A', 'AAAA', 'MX', 'TXT', 'CNAME', 'PTR'];
  if (!supportedTypes.includes(type)) {
    return res.status(400).json({ error: `Type '${type}' non supporté.` });
  }

  // Résolution DNS
  if (type === 'PTR') {
    const ip = name;
    dns.reverse(ip, (err, hostnames) => {
      if (err) {
        return res.status(500).json({
          Status: 2,
          Comment: err.message
        });
      }

      res.json({
        Status: 0,
        Answer: hostnames.map(host => ({
          name,
          type: 12, // Code DNS pour PTR
          TTL: 300,
          data: host
        }))
      });
    });
  } else {
    dns.resolve(name, type, (err, records) => {
      if (err) {
        return res.status(500).json({
          Status: 2,
          Comment: err.message
        });
      }
    
      let answer;
    
      if (type === 'MX') {
        answer = records.map(record => ({
          name,
          type: 15,
          TTL: 300,
          data: `${record.priority} ${record.exchange}`
        }));
      } else {
        answer = records.map(data => ({
          name,
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

// Démarrer le serveur
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serveur DoH en écoute sur http://localhost:${PORT}`);
});

// const express = require('express');
// const dns = require('dns');
// const cors = require('cors');
// const app = express();

// // Middleware
// app.use(cors()); // Autoriser les requêtes cross-origin (pour le frontend)

// // Endpoint DoH (GET)
// app.get('/dns-query', (req, res) => {
//   const { name, type = 'A' } = req.query;

//   // Validation
//   if (!name) return res.status(400).json({ error: "Le paramètre 'name' est requis." });

//   // Types DNS supportés
//   const supportedTypes = ['A', 'AAAA', 'MX', 'TXT', 'CNAME'];
//   if (!supportedTypes.includes(type)) {
//     return res.status(400).json({ error: `Type '${type}' non supporté.` });
//   }

//   // Résolution DNS
//   dns.resolve(name, type, (err, records) => {
//     if (err) {
//       return res.status(500).json({ 
//         Status: 2, // Code d'erreur DNS
//         Comment: err.message 
//       });
//     }

//     // Formatage de la réponse (compatible DoH)
//     res.json({
//       Status: 0, // 0 = succès
//       Answer: records.map(data => ({
//         name,
//         type: type === 'A' ? 1 : type === 'AAAA' ? 28 : 15, // Codes DNS
//         TTL: 300,
//         data
//       }))
//     });
//   });
// });

// // Démarrer le serveur
// const PORT = 3000;
// app.listen(PORT, () => {
//   console.log(`Serveur DoH en écoute sur http://localhost:${PORT}`);
// });