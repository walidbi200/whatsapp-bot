const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const userStates = {};

app.get('/', (req, res) => {
  res.send('WhatsApp Bot is running! 🤖');
});

app.post('/api/twilio/webhook', (req, res) => {
  const incomingMsg = req.body.Body ? req.body.Body.trim().toLowerCase() : '';
  const from = req.body.From;
  const twiml = new twilio.twiml.MessagingResponse();

  if (!userStates[from]) {
    userStates[from] = { step: 'welcome' };
  }

  const state = userStates[from];

  if (state.step === 'welcome' || incomingMsg === 'menu' || incomingMsg === 'start') {
    twiml.message(`Willkommen! 👋

Was brauchst du?

1️⃣ Kostenlose Liste (50 Kontakte)
2️⃣ Vollständige Liste (600 Kontakte) - €29
3️⃣ Bewerbung Dossier Service - €49
4️⃣ Paket: Liste + Dossier - €69

Antworte mit einer Zahl (1-4)`);
    state.step = 'main_menu';
  }
  else if (state.step === 'main_menu') {
    if (incomingMsg === '1') {
      twiml.message(`🎁 Kostenlose Liste wird gesendet!

Dies ist eine Probe mit 50 Pflegefachmann Ausbildung Kontakten.

Für die vollständige Liste (600 Kontakte), antworte mit "2"

Schreibe MENU für Hauptmenü`);
      state.step = 'sent_free';
    } else if (incomingMsg === '2') {
      twiml.message(`📋 Vollständige Liste - 600 Kontakte
Preis: €29

Bezahle hier: [DEIN-PAYPAL-LINK]

Nach Zahlung, sende einen Screenshot und du bekommst die Liste sofort!

Schreibe MENU für Hauptmenü`);
      state.step = 'awaiting_payment_list';
    } else if (incomingMsg === '3') {
      twiml.message(`📝 Bewerbung Dossier Service
Preis: €49

Ich erstelle professionelle:
✅ Anschreiben
✅ Lebenslauf Optimierung  
✅ Motivationsschreiben

Ich brauche:
- Dein aktueller CV (PDF)
- Zielposition/Firma
- Deine Verfügbarkeit

Interessiert? Antworte mit JA

Schreibe MENU für Hauptmenü`);
      state.step = 'bewerbung_interest';
    } else if (incomingMsg === '4') {
      twiml.message(`🎯 PAKET ANGEBOT
Liste (600) + Bewerbung Service
Normal: €78 → Jetzt: €69

Du sparst €9! 💰

Bezahle hier: [DEIN-PAYPAL-LINK]

Nach Zahlung sende Screenshot!

Schreibe MENU für Hauptmenü`);
      state.step = 'awaiting_payment_bundle';
    } else {
      twiml.message('Ungültige Auswahl. Bitte antworte mit 1, 2, 3 oder 4\n\nSchreibe MENU für Hauptmenü');
    }
  }
  else if (state.step === 'awaiting_payment_list') {
    twiml.message(`Danke! Ich überprüfe deine Zahlung...

Die Liste wird in wenigen Minuten gesendet! ✅

Schreibe MENU für Hauptmenü`);
    state.step = 'welcome';
  }
  else if (state.step === 'bewerbung_interest') {
    if (incomingMsg === 'ja' || incomingMsg === 'yes') {
      twiml.message(`Super! 🎉

Bitte sende mir:
1. Dein CV als PDF
2. Zielposition (z.B. "Pflegefachmann Ausbildung bei XYZ")
3. Wann kannst du starten?

Bezahlung: €49 via [PAYPAL-LINK]`);
      state.step = 'collecting_info';
    } else {
      twiml.message('Kein Problem! Schreibe MENU um zurück zu gehen.');
      state.step = 'welcome';
    }
  }

  res.type('text/xml').send(twiml.toString());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```
