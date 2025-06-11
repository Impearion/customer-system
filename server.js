import express from 'express'; // Express-Framework 
import pg from 'pg'; // PostgreSQL-Client 
import bodyParser from 'body-parser'; // Middleware für das Parsen von JSON-Daten 
import path from 'path'; // Modul für den Zugriff auf den Dateipfad
import { fileURLToPath } from 'url'; // Modul für den Zugriff auf die aktuelle Datei-URL 
const { Pool } = pg; // PostgreSQL-Pool für die Verbindung zur Datenbank 
const app = express(); // Express-Anwendung initialisieren
const __filename = fileURLToPath(import.meta.url); // gibt die aktuelle Datei-URL zurück 
const __dirname = path.dirname(__filename); // gibt das Verzeichnis der aktuellen Datei zurück 


// PostgreSQL-Datenbankverbindung 
const pool = new Pool({ 
    user: 'postgres',       // anpassen 
    host: 'localhost', 
    database: 'customer_app',  // anpassen 
    password: 'Passw0rd', // anpassen 
    port: 5432, 
}); 

app.use(bodyParser.json()); // Middleware für das Parsen von JSON-Daten
app.use(bodyParser.urlencoded({ extended: true })); // Middleware für das Parsen von URL-kodierten Daten 
app.use(express.static(path.join(__dirname, 'public'))); // Middleware für statische Dateien 

// Route für das Speichern von Kundendaten 
app.post('/api/kunden', async (req, res) => { 
    const { nachname, vorname, email, strasse, plz, telefonnummer, land, hausnummer, geburtsdatum } = req.body; // Daten aus dem Request-Body mit Destructuring extrahieren. Es werden drei Variablen erstellt: nachname, vorname und email 

    // Check for input
    if (!nachname || !vorname || !email || !strasse || !plz || !telefonnummer || !land || !hausnummer || !geburtsdatum) {
        return res.status(400).send('Alle Felder sind erforderlich.');
    }

    // E-Mail validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).send('Ungültige E-Mail-Adresse.');
    }

    // Tel validation
    if (!/^\+?[0-9\s\-]{7,20}$/.test(telefonnummer)) {
        return res.status(400).send('Ungültige Telefonnummer.');
    }

    // check PLZ
    if (!/^\d{4,10}$/.test(plz)) {
        return res.status(400).send('Ungültige Postleitzahl.');
    }

    try { await pool.query( 
        'INSERT INTO kunden (nachname, vorname, email, strasse, plz, telefonnummer, land, hausnummer, geburtsdatum) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',       
        [nachname, vorname, email, strasse, plz, telefonnummer, land, hausnummer, geburtsdatum ] // Daten aus dem Request-Body in die Datenbank einfügen     
    );     
    res.status(201).send('Kunde gespeichert'); // Erfolgreiche Antwort mit Status 201 (Created)   
    } catch (error) { 
        console.error(error);     
        res.status(500).send('Fehler beim Speichern');   
    } 
}); 

// Route Kundendaten abrufen + optionaler Suchbegriff 
app.get('/api/kunden', async (req, res) => { 
    const search = req.query.search || ''; // Suchbegriff aus der URL abfragen 
    // Wenn kein Suchbegriff angegeben ist, wird ein leerer String verwendet 
    try {
        let result;

if (!search) {
    result = await pool.query('SELECT * FROM kunden');
} else {
    const like = `%${search}%`;
    result = await pool.query( 
        `SELECT * FROM kunden WHERE  
        CAST(id AS TEXT) ILIKE $1 OR        
        nachname ILIKE $1 OR
        vorname ILIKE $1 OR
        email ILIKE $1 OR
        CAST(geburtsdatum AS TEXT) ILIKE $1 OR
        telefonnummer ILIKE $1 OR
        land ILIKE $1 OR
        plz ILIKE $1 OR
        strasse ILIKE $1 OR
        hausnummer ILIKE $1`,
        [like]
    );
}

    
    res.json(result.rows); // Ergebnis als JSON zurückgeben 
    }   catch (error) { 
        console.error(error);     
        res.status(500).send('Fehler beim Abrufen');
    }
});

// Get Route wenn auf / zugegriffen wird, es wird ein String zurückgegeben 
app.get('/', (req, res) => {   
    res.send('Willkommen zur Kundenverwaltung!'); 
});


// TEST

// function formatDatum(isoDatum) {
//     const datum = new Date(isoDatum);
//     const tag = String(datum.getDate()).padStart(2, '0');
//     const monat = String(datum.getMonth() + 1).padStart(2, '0');
//     const jahr = datum.getFullYear();
//     return `${tag}.${monat}.${jahr}`;
// }

// app.get("/about",async (req, res) => {  
    

//      const search = req.query.search || ''; // Suchbegriff aus der URL abfragen 
//     // Wenn kein Suchbegriff angegeben ist, wird ein leerer String verwendet 
//     let result;
//     try {

//         if(!search) {
//             result = await pool.query('SELECT * FROM kunden');
//         } else {
//             const like = `%${search}%`;
//             const result = await pool.query( 
//                 `SELECT * FROM kunden WHERE  
//                 id = $1 OR        
//                 nachname ILIKE $1 OR
//                 vorname ILIKE $1 OR
//                 email ILIKE $1 OR
//                 geburtsdatum ILIKE $1 OR
//                 telefonnummer ILIKE $1 OR
//                 land ILIKE $1 OR
//                 plz ILIKE $1 OR
//                 strasse ILIKE $1 OR
//                 hausnummer ILIKE $1`,
//                 [like]
//             );
//         }
    
//     }   catch (error) { 
//         console.error(error);     
//         res.status(500).send('Fehler beim Abrufen');
//     }

//     res.send(

//         `<!DOCTYPE html>
// <html lang="de">
//     <head>
//         <meta charset="UTF-8" />
//         <title>Kundendaten Verwaltung</title>
//         <link rel="stylesheet" href="style.css" />
//     </head>
//     <body>
//         <h1>Kundendaten eingeben</h1>
//         <form id="kundenForm">
//             <input type="text" name="nachname" placeholder="Nachname" required />
//             <input type="text" name="vorname" placeholder="Vorname" required /> 
//             <input type="email" name="email" placeholder="E-Mail" /> 
//             <input type="date" name="geburtsdatum" placeholder="Geburtsdatum" /> 
//             <input type="tel" name="telefonnummer" pattern="^\+?[0-9\s\-]{7,15}$" placeholder="+4301234567890" /> 
//             <input type="text" name="land" placeholder="Land" /> 
//             <input type="text" name="plz" pattern="^\d{1,10}(-\d{1,10})?$" placeholder="Postleitzahl" /> 
//             <input type="text" name="strasse" placeholder="Straße" /> 
//             <input type="text" name="hausnummer" placeholder="Hausnummer" /> 

//             <button type="submit">Speichern</button>
//         </form>
//         <!-- https://developer.mozilla.org/de/docs/Learn_web_development/Extensions/Forms/Form_ validation -->
//         <h2>Kundensuche</h2>
//         <input type="text" id="sucheInput" placeholder="Suchen..." /> <button onclick="ladeKunden()">Suchen</button> <button onclick="showEntireList()">Zeige gesamte Liste</button>
//         <h2>Kundenliste</h2>
//         <table>
//             <thead>
//                 <tr>
//                     <th>ID</th>
//                     <th>Nachname</th>
//                     <th>Vorname</th>
//                     <th>E-Mail</th>
//                     <th>Geburtsdatum</th>
//                     <th>Telefonnummer</th>
//                     <th>Land</th>
//                     <th>PLZ</th>
//                     <th>Straße</th>
//                     <th>Hausnummer</th>
//                 </tr>
//             </thead>
//             <tbody id="kundenTabelle">
//             ${result.rows.map(k => `          
//         <tr>           
//             <td>${k.id}</td>
//             <td>${k.nachname}</td>
//             <td>${k.vorname}</td>
//             <td>${k.email}</td>
//             <td>${formatDatum(k.geburtsdatum)}</td>
//             <td>${k.telefonnummer}</td>
//             <td>${k.land}</td>
//             <td>${k.plz}</td>
//             <td>${k.strasse}</td>
//             <td>${k.hausnummer}</td>
//             <td><button onclick="kundeLoeschen(${k.id})">🗑️ Löschen</button></td>
//         </tr>       
//     `).join('')     }
//             </tbody>
//         </table>
//     </body>
// </html>
// `
// ); 
// })

// TEST


// deletes customers

app.delete('/api/kunden/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM kunden WHERE id = $1', [id]);
    res.sendStatus(204); // No Content (erfolgreich gelöscht)
  } catch (err) {
    console.error(err);
    res.status(500).send('Fehler beim Löschen');
  }
});

// Route für das Abrufen von Kundendaten nach ID 
const PORT = 3000; app.listen(PORT, () => { 
    console.log(`Server läuft auf http://localhost:${PORT}`); 
}); 
    