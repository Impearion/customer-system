const form = document.getElementById('kundenForm'); // Das Formular mit der ID "kundenForm" wird ausgewählt 
// und in der Konstante "form" gespeichert.  
const tabelle = document.getElementById('kundenTabelle'); // Die Tabelle mit der ID "kundenTabelle" wird ausgewählt 
// und in der Konstante "tabelle" gespeichert.     
form.addEventListener('submit', async (e) => {       
    e.preventDefault(); // Verhindert die Standardaktion des Formulars (SeitenNeuladung) 
    const formData = new FormData(form); // FormData ist ein Web-API, das es ermöglicht, Formulardaten zu sammeln und zu verarbeiten. 
    const data = Object.fromEntries(formData.entries()); // Die Formulardaten werden in ein Objekt umgewandelt, das die Eingabewerte enthält. 
    try {
    const res = await fetch('/api/kunden', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const errorText = await res.text();
      alert(`Fehler: ${errorText}`);
      return false;
    }
    form.reset();
    ladeKunden();

    return true;
  } catch (err) {
    alert('Verbindungsfehler: ' + err.message);
    return false;
  }  
}); 


async function ladeKunden() {
    const suchbegriff = document.getElementById('sucheInput').value; // Der Suchbegriff wird aus dem Eingabefeld mit der ID "sucheInput" gelesen. 
    console.log(suchbegriff);
    const res = await fetch(`/api/kunden?search=${encodeURIComponent(suchbegriff)}`); // Sendet eine GET-Anfrage an den Server, um die Kundenliste zu laden. 
    const kunden = await res.json(); // console.log(kunden);    
    tabelle.innerHTML = kunden.map(k => `          
        <tr>           
            <td>${k.id}</td>
            <td>${k.nachname}</td>
            <td>${k.vorname}</td>
            <td>${k.email}</td>
            <td>${formatDatum(k.geburtsdatum)}</td>
            <td>${k.telefonnummer}</td>
            <td>${k.land}</td>
            <td>${k.plz}</td>
            <td>${k.strasse}</td>
            <td>${k.hausnummer}</td>
            <td><button onclick="kundeLoeschen(${k.id})"> Löschen</button></td>
        </tr>       
    `).join('');     
} // Die Kundenliste wird in die Tabelle eingefügt. kunden.map() ist eine Methode, die ein neues Array erstellt, indem sie eine Funktion auf jedes Element des Arrays anwendet. join('') verbindet die Elemente des Arrays zu einem String. 

// deletes customer and reloads the page
async function kundeLoeschen(id) {
    // const res = await fetch(`/api/kunden/:${encodeURIComponent(suchbegriff)}`, {method:"delete"});
     await fetch(`/api/kunden/${id}`, {
            method: 'DELETE'
        }); 
    ladeKunden();
}

function formatDatum(isoDatum) {
    const datum = new Date(isoDatum);
    const tag = String(datum.getDate()).padStart(2, '0');
    const monat = String(datum.getMonth() + 1).padStart(2, '0');
    const jahr = datum.getFullYear();
    return `${tag}.${monat}.${jahr}`;
}

function showEntireList() { 
    document.getElementById('sucheInput').value = ''; // Setzt das Eingabefeld für die Suche zurück.       
ladeKunden(); // Lädt die gesamte Kundenliste neu.     
}

ladeKunden();