import { useState } from 'react';
import { Clipboard, RefreshCw } from 'lucide-react';

function App() {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const dnsTypeDescriptions = {
    A: 'Adresse IPv4 associée au nom de domaine.',
    AAAA: 'Adresse IPv6 associée au nom de domaine.',
    MX: 'Serveurs de messagerie pour ce domaine.',
    TXT: 'Enregistrements textuels, souvent utilisés pour SPF/DKIM.',
    CNAME: 'Alias vers un autre nom de domaine.',
    PTR: 'Résolution inverse (IP vers nom de domaine).'
  };

  const convertToPTR = (ip) => {
    const reversed = ip.split('.').reverse().join('.');
    return `${reversed}.in-addr.arpa`;
  };

  const extractDomain = (input) => {
    try {
      const url = new URL(input.startsWith('http') ? input : `https://${input}`);
      return url.hostname;
    } catch {
      return input;
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setName(text);
    } catch (err) {
      alert("Impossible de coller depuis le presse-papiers.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResults(null);
    setLoading(true);

    let queryName = extractDomain(name);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/dns-query?name=${queryName}&type=${type}`);
      const data = await res.json();
      if (data.Status !== 0) {
        setError(data.Comment || 'Erreur DNS');
      } else {
        setResults(data.Answer);
      }
    } catch (err) {
      setError('Erreur de connexion au serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100 p-20">
      <div className="w-full max-w-lg bg-white shadow-2xl rounded-2xl p-8 animate-fade-in">
        <h1 className="text-4xl font-bold text-center text-indigo-700 mb-6">
          DNS Resolver 🔍
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <label className="block text-sm font-medium text-black mb-1">Nom de domaine ou IP</label>
            <input
              type="text"
              placeholder="..."
              className="text-sm text-gray-700 font-medium m-1 w-full border border-gray-300 px-4 py-3 rounded-lg pr-28 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div className="absolute right-2 top-8 flex gap-2 m-1">
              <button
                type="button"
                onClick={handlePaste}
                className="bg-gray-300 hover:bg-blue-400 text-blue-700 p-2 rounded transition"
                title="Coller depuis le presse-papiers"
              >
                <Clipboard className="w-4 h-4 text-gray-700" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setName('');
                  setResults(null);
                  setError('');
                  setType('');
                }}
                className="bg-gray-300 hover:bg-green-400 text-green-700 p-2 rounded transition"
                title="Recharger"
              >
                <RefreshCw className="w-4 h-4 text-gray-700" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">Type de requête DNS</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="text-sm text-gray-600 font-medium m-1 w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            >
              <option value="" disabled hidden>Choisir un type de requête</option>
              {Object.keys(dnsTypeDescriptions).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {type && (
              <p className="text-xs text-gray-700 ml-2 mt-1 mb-10">{dnsTypeDescriptions[type]}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!name || !type || loading}
            className={`w-full m-1 mb-10 text-white py-2 rounded-lg font-medium transition-colors duration-200 ${
              loading || !name || !type
                ? 'bg-indigo-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {loading ? (
              <div className="flex justify-center items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Recherche...
              </div>
            ) : (
              'Résoudre'
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 text-red-600 text-center font-semibold">Erreur: "{error}"</div>
        )}

        {results && name.trim() !== '' && (
          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">Résultats :</h2>
            {results.map((r, index) => (
              <div key={index} className="bg-indigo-50 rounded-lg p-4 shadow-sm">
                <p><strong>Nom :</strong> {r.name}</p>
                <p><strong>Type :</strong> {r.type}</p>
                <p><strong>TTL :</strong> {r.TTL}</p>
                <p><strong>Données :</strong> {r.data}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

// import { useState } from 'react';
// import { Clipboard, RefreshCw } from 'lucide-react';

// function App() {
//   const [name, setName] = useState('');
//   const [type, setType] = useState('A');
//   const [results, setResults] = useState(null);
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const convertToPTR = (ip) => {
//     const reversed = ip.split('.').reverse().join('.');
//     return `${reversed}.in-addr.arpa`;
//   };

//   const extractDomain = (input) => {
//     try {
//       const url = new URL(input.startsWith('http') ? input : `https://${input}`);
//       return url.hostname;
//     } catch {
//       return input; // Pas une URL valide, on retourne tel quel
//     }
//   };

//   const handlePaste = async () => {
//     try {
//       const text = await navigator.clipboard.readText();
//       setName(text);
//     } catch (err) {
//       alert("Impossible de coller depuis le presse-papiers.");
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setResults(null);
//     setLoading(true);

//     let queryName = extractDomain(name);

//     try {
//       const res = await fetch(`${import.meta.env.VITE_API_URL}/dns-query?name=${queryName}&type=${type}`);
//       const data = await res.json();
//       if (data.Status !== 0) {
//         setError(data.Comment || 'Erreur DNS');
//       } else {
//         setResults(data.Answer);
//       }
//     } catch (err) {
//       setError('Erreur de connexion au serveur.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100 p-4">
//       <div className="w-full max-w-lg bg-white shadow-2xl rounded-2xl p-8 animate-fade-in">
//         <h1 className="text-4xl font-bold text-center text-indigo-700 mb-6">
//           🔍DNS Resolver
//         </h1>

//         <form onSubmit={handleSubmit} className="space-y-4">
//         <div className="relative">
//           <input
//             type="text"
//             placeholder='Ex: example.com ou https://...'
//             className="w-full border border-gray-300 px-4 py-3 rounded-lg pr-28 focus:outline-none focus:ring-2 focus:ring-indigo-400"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             required
//           />
          
//           <div className="absolute right-2 top-2 flex gap-2">
//             <button
//               type="button"
//               onClick={handlePaste}
//               className="bg-blue-300 hover:bg-blue-400 text-blue-700 p-2 rounded transition"
//               title="Coller depuis le presse-papiers"
//             >
//               <Clipboard className="w-4 h-4 text-gray-700" />
//             </button>

//             <button
//               type="button"
//               onClick={() => {
//                 setName('');
//                 setResults(null);
//                 setError('');
//               }}
//               className="bg-green-300 hover:bg-green-400 text-green-700 p-2 rounded transition"
//               title="Recharger"
//             >
//               <RefreshCw className="w-4 h-4 text-gray-700" />
//             </button>
//           </div>
//         </div>


//           <select
//             value={type}
//             onChange={(e) => setType(e.target.value)}
//             className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
//           >
//             {['A', 'AAAA', 'MX', 'TXT', 'CNAME', 'PTR'].map((t) => (
//               <option key={t} value={t}>{t}</option>
//             ))}
//           </select>

//           <button
//             type="submit"
//             disabled={!name || loading}
//             className={`w-full text-white py-3 rounded-lg font-medium transition-colors duration-200 ${
//               loading || !name
//                 ? 'bg-indigo-300 cursor-not-allowed'
//                 : 'bg-indigo-600 hover:bg-indigo-700'
//             }`}
//           >
//             {loading ? (
//               <div className="flex justify-center items-center gap-2">
//                 <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                 Recherche...
//               </div>
//             ) : (
//               'Résoudre'
//             )}
//           </button>
//         </form>

//         {error && (
//           <div className="mt-4 text-red-600 text-center font-semibold">{error}</div>
//         )}

//         {/* Affichage des résultats seulement si présent ET champ non vide */}
//         {results && name.trim() !== '' && (
//           <div className="mt-8 space-y-4">
//             <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">Résultats :</h2>
//             {results.map((r, index) => (
//               <div key={index} className="bg-indigo-50 rounded-lg p-4 shadow-sm">
//                 <p><strong>Nom :</strong> {r.name}</p>
//                 <p><strong>Type :</strong> {r.type}</p>
//                 <p><strong>TTL :</strong> {r.TTL}</p>
//                 <p><strong>Données :</strong> {r.data}</p>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default App;
