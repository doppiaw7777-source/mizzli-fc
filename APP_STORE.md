# App Store — MIZZLI FC

Questa app è pronta per essere trasformata in app iPhone con Capacitor.
**Non si carica da sola sull’App Store**: serve un Mac, Xcode e un account Apple Developer (99 USD/anno).

## Cosa è già pronto

- Bundle ID: `com.noldi.fcunited`
- Nome: `MIZZLI FC`
- Icona e splash in `resources/`
- Tab bar iOS, haptic, condivisione partite, fotocamera/galleria
- Privacy Policy (`/privacy`) e Termini (`/termini`)
- Login admin compatibile con l’app (cookie + token)

Account demo per Apple Review:
- Utente: `Noldi`
- Password: `Noninoni99@`

## Passi per pubblicare

### 1. Metti il sito online

L’app iPhone deve parlare con un server su internet.

1. Crea un account su [Vercel](https://vercel.com)
2. Carica questo progetto
3. Copia l’URL (es. `https://fc-noldi.vercel.app`)

### 2. Account Apple

1. Iscriviti a [Apple Developer](https://developer.apple.com/programs/) (99 USD/anno)
2. Su un Mac installa **Xcode** dal Mac App Store
3. Apri Xcode → Settings → Accounts → entra con l’Apple ID

### 3. Collega il sito all’app iOS

Il progetto iOS è già nella cartella `ios/` (bundle `com.noldi.fcunited`).

Su un **Mac**, nella cartella del progetto:

```bash
export CAPACITOR_SERVER_URL=https://IL-TUO-SITO.vercel.app
npx cap sync ios
npx cap open ios
```

### 4. In Xcode

1. Seleziona il target **App**
2. Signing & Capabilities → Team (il tuo Apple ID)
3. Display Name: `FC Noldi United`
4. Version `1.0.0`, Build `1`
5. Aggiungi in Info:
   - Privacy — Camera Usage Description: `Per scattare le foto dei giocatori e dello staff`
   - Privacy — Photo Library Usage Description: `Per scegliere foto di giocatori, staff e sfondi`
6. Product → Archive
7. Distribute App → App Store Connect

### 5. App Store Connect

1. Vai su [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Nuova app → iOS
3. Compila:
   - Categoria: Sport
   - Descrizione in italiano
   - Screenshot iPhone (6.7" e 6.1")
   - Privacy Policy URL: `https://IL-TUO-SITO.vercel.app/privacy`
   - Note per la review: account `Noldi` / `Noninoni99@`
4. Prima **TestFlight**, poi **Invia per la revisione**

## Screenshot richiesti

- iPhone 6.7" (es. iPhone 16 Pro Max): 1290 × 2796
- iPhone 6.1" (es. iPhone 16): 1179 × 2556

Fai catture di Home, Rosa, Formazione, Calendario, Admin.

## Se Apple rifiuta

Spesso succede se l’app è “solo un sito”. In quel caso:
- tieni le funzioni native già aggiunte (camera, share, splash, tab bar)
- non scrivere “apri il sito” nella descrizione
- descrivi rosa, formazione, panchina e staff come funzioni dell’app
