# Play Games Services setup

The app already calculates totals, streaks and badges from each user's history (see `utils/progress.ts`). This guide connects those numbers to Google Play Games Services so users can compare them on leaderboards (with friends and with everyone) and see the badges as Play Games achievements.

Until the steps below are done, the app works as before: the History tab shows progress and badges, and the Play Games card stays hidden. Play Games is Android only. iOS users see the same in-app progress but no leaderboards.

## 1. List the app as a game

Play Games Services only works for apps in the **Game** category.

Play Console → **Grow users → Store presence → Store settings** → App category: **Game**, category **Casual**.

> Trade-off: the listing moves out of Health & Fitness, and that affects where it shows up in search and browse.

## 2. Create the Play Games Services project

1. Play Console → **Grow users → Play Games Services → Setup and management → Configuration**.
2. Choose **No, my game doesn't use Google APIs** → give it a name → **Create**.
3. Copy the numeric **Project ID** shown at the top of the configuration page and paste it into `app.json`:

   ```json
   ["./plugins/with-play-games", { "projectId": "123456789012" }]
   ```

## 3. OAuth consent and Android credentials

Play Games signs users in with OAuth, and each signing key needs its own credential.

1. On the Configuration page, open the linked **Google Cloud project** → **APIs & Services → OAuth consent screen** → External. Fill in the app name, support email and developer email, then save. Go back to Play Console.
2. **Credentials → Add credential → Android**:
   - Package name: `com.nllsn.nlsnmeditate`
   - **Create OAuth client** (opens Google Cloud) → type *Android*, same package, and the SHA-1 below → back in Play Console, select that client.
3. Repeat step 2 for **each** SHA-1 you build with:
   - **App signing key** (builds installed from Play): Play Console → **Test and release → App integrity → App signing** → SHA-1.
   - **Upload key** (EAS builds installed directly): `eas credentials` → Android → production → keystore SHA-1.
   - **Debug key** (`npx expo run:android`, optional): `cd android && ./gradlew signingReport` → the `debug` variant's SHA-1.

If sign-in fails silently on a device, the usual cause is a missing SHA-1 for the key that build was signed with.

## 4. Achievements

Play Games Services → **Achievements → Add achievement**, one for each badge. Use the titles and descriptions from `constants/i18n/en.ts` and add the Portuguese ones from `pt.ts` under *Add translations*. Each needs a 512×512 PNG icon, and the points across all achievements must add up to 1000 or less.

| Key in `constants/play-games.ts` | Title (en / pt) | Points |
|---|---|---|
| `first-sit` | First sit / Primeira sessão | 5 |
| `first-guided` | Guided / Guiada | 5 |
| `deep-sit` | Deep sit / Sessão profunda | 20 |
| `explorer` | Explorer / Exploração | 30 |
| `early-bird` | Early bird / Madrugada | 15 |
| `night-owl` | Night owl / Noite adentro | 15 |
| `streak-7` | One week / Uma semana | 40 |
| `streak-30` | One month / Um mês | 120 |
| `minutes-10` | 10 minutes / 10 minutos | 5 |
| `minutes-60` | One hour / Uma hora | 15 |
| `minutes-300` | Five hours / Cinco horas | 40 |
| `minutes-600` | Ten hours / Dez horas | 70 |
| `minutes-1440` | A whole day / Um dia inteiro | 120 |
| `minutes-3000` | Fifty hours / Cinquenta horas | 200 |
| `minutes-6000` | A hundred hours / Cem horas | 300 |

Leave them all **standard** (not incremental) and **revealed**. Copy each achievement's **ID** (like `CgkI…EAIQAQ`) into `PLAY_GAMES_ACHIEVEMENTS` in `constants/play-games.ts`.

## 5. Leaderboards (where users compare)

Play Games Services → **Leaderboards → Add leaderboard**, three times:

| Key in `constants/play-games.ts` | Name (en / pt) | Format | Ordering |
|---|---|---|---|
| `totalMinutes` | Total minutes / Minutos no total | Numeric, 0 decimals, unit "min" | Larger is better |
| `weekMinutes` | Minutes this week / Minutos na semana | Numeric, 0 decimals, unit "min" | Larger is better |
| `bestStreak` | Longest streak / Maior sequência | Numeric, 0 decimals, unit "days" | Larger is better |

Copy each **ID** into `PLAY_GAMES_LEADERBOARDS`.

Each leaderboard has *Today / This week / All time* tabs and *Friends / Everyone* filters built in. "Minutes this week" is meant to be read on its **This week** tab. The app counts it from Sunday 00:00 Pacific time, which is when Google resets weekly boards.

## 6. Testers

Until the configuration is published, only tester accounts can sign in.

Play Games Services → **Testers** → add the Google accounts you test with. They also need to be on a testing track for the app (internal testing is fine).

## 7. Build and test

Native changes need a new build. An OTA update won't carry them.

```sh
npx expo prebuild -p android --clean   # or let EAS do it
eas build -p android --profile production
```

On a tester's phone: open the app (Play Games signs in automatically, or tap *Sign in to Play Games* on the History tab) → finish a short sit → **Leaderboards** and **Achievements** should show the scores and unlocked badges. Scores can take a few minutes to show up.

## 8. Publish and Data safety

1. Play Games Services → **Review and publish** → publish the configuration. Achievements and leaderboards can't be deleted afterwards, only added, so check them first.
2. **Policy → App content → Data safety**: the app now shares app activity (scores and achievements tied to the user's Play Games profile) with Google Play Games Services. Declare *App activity → Other actions*, collected and shared for *App functionality*.
3. Release the new build.
