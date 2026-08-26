# Mentor-toegang en bewaartermijn

## Rollen

De beheerder gebruikt `ADMIN_PASSWORD` en kan codepools beheren, resultaten exporteren en de technische verdieping openen.

Optioneel kunnen mentoren alleen het compacte mentoroverzicht voor hun eigen klassen openen. Configureer hiervoor `MENTOR_ACCESS_JSON` als één geldige JSON-regel in de omgevingsvariabelen, bijvoorbeeld:

```json
[
  { "password": "eigen-geheime-mentorcode", "classCodes": ["vmbo1a", "vmbo1b"] },
  { "password": "andere-geheime-mentorcode", "classCodes": ["hv3a"] }
]
```

De `classCodes` moeten exact overeenkomen met de klascode van de aangemaakte codepool. Een mentoraccount kan geen inlogcodes ophalen of beheren, kan geen technische itemanalyse of export openen en de resultaten-API beperkt de data server-side tot de toegewezen klassen.

## Bewaartermijn

De app verwijdert geen resultaten automatisch. Dat is bewust: een bewaartermijn is een schoolbesluit dat afhangt van doel, privacybeleid en eventuele afspraken met de functionaris gegevensbescherming.

Leg vóór de eerste afname vast wanneer codepools, sessies en samengevoegde resultaten worden verwijderd. De bestaande verwijderactie in de beheeromgeving verwijdert alleen inlogcodes en nog actieve sessies; afgeronde, samengevoegde resultaten blijven staan. Verwijder die pas via een gecontroleerde databaseprocedure nadat de school de bewaartermijn heeft vastgesteld. Kies geen kortere termijn voor leerjaar 1 wanneer cohortontwikkeling tot leerjaar 3 nog nodig is.

Houd voor elk cohort minimaal vast: doel van de meting, afnamevensters, afgesproken verwijdermoment en wie de verwijdering controleert. Gebruik nooit namen, e-mailadressen of leerlingnummers in cohortcodes of exportbestanden.
