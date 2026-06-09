# Audit randomisatie en option-id scoring v4

| onderdeel | gecontroleerd | resultaat | eventuele fix |
| --- | --- | --- | --- |
| SR single choice | `correctAnswer` verwijst naar `option.id`; `createPresentedOrders` randomiseert ids en pint `unknownOptionId` onderaan | akkoord | geen |
| SR multiple select | partial scoring gebruikt geselecteerde option-id's, `unknownOptionId` is exclusief in UI en scoret 0 | akkoord | geen |
| Performance interaction tasks | groepsopties worden per sessie gerandomiseerd; onbekend wordt onderaan gezet; scoringregels gebruiken `correctOptionIds`/`forbiddenOptionIds` | akkoord | geen |
| PT8 Whutsupp | `shuffleChoiceIds` randomiseert keuzes per render; `choiceOrderByNode` en `shownOptionOrder` loggen choice-id's; harmful caps werken op flags | akkoord | geen |
| Client-lek correcte positie | UI toont dynamische A/B/C-labels na randomisatie; correcte antwoorden zijn niet als positie gecodeerd | akkoord met restrisico dat clientdata interne scoring bevat, inherent aan client-side scoring | geen binnen scope |
| lj1-vmbo/lj1v-sr1-pw-passphrase | option-id referenties bestaan | akkoord | geen |
| lj1-vmbo/lj1v-sr3-phone | option-id referenties bestaan | akkoord | geen |
| lj1-vmbo/lj1v-sr4-official-source | option-id referenties bestaan | akkoord | geen |
| lj1-vmbo/lj1v-sr5-algorithm | option-id referenties bestaan | akkoord | geen |
| lj1-vmbo/lj1v-sr6-data-poll | option-id referenties bestaan | akkoord | geen |
| lj1-vmbo/lj1v-sr7-ai-check | option-id referenties bestaan | akkoord | geen |
| lj1-vmbo/lj1v-sr8-image-rights | option-id referenties bestaan | akkoord | geen |
| lj1-vmbo/lj1v-sr9-photo-consent | option-id referenties bestaan | akkoord | geen |
| lj1-vmbo/lj1v-sr10-platform-risk | option-id referenties bestaan | akkoord | geen |
| lj1-hv/lj1h-sr1-pw-passphrase | option-id referenties bestaan | akkoord | geen |
| lj1-hv/lj1h-sr3-phone-actions | option-id referenties bestaan | akkoord | geen |
| lj1-hv/lj1h-sr4-search-query | option-id referenties bestaan | akkoord | geen |
| lj1-hv/lj1h-sr5-feed-sample | option-id referenties bestaan | akkoord | geen |
| lj1-hv/lj1h-sr6-sample | option-id referenties bestaan | akkoord | geen |
| lj1-hv/lj1h-sr7-ai-startpunt | option-id referenties bestaan | akkoord | geen |
| lj1-hv/lj1h-sr8-image-source | option-id referenties bestaan | akkoord | geen |
| lj1-hv/lj1h-sr9-photo-share | option-id referenties bestaan | akkoord | geen |
| lj1-hv/lj1h-sr10-platform-risk | option-id referenties bestaan | akkoord | geen |
| lj3-vmbo/lj3v-sr1-cijfermail | option-id referenties bestaan | akkoord | geen |
| lj3-vmbo/lj3v-sr3-phone-actions | option-id referenties bestaan | akkoord | geen |
| lj3-vmbo/lj3v-sr4-health-source | option-id referenties bestaan | akkoord | geen |
| lj3-vmbo/lj3v-sr5-sponsored | option-id referenties bestaan | akkoord | geen |
| lj3-vmbo/lj3v-sr6-percent | option-id referenties bestaan | akkoord | geen |
| lj3-vmbo/lj3v-sr7-ai-factcheck | option-id referenties bestaan | akkoord | geen |
| lj3-vmbo/lj3v-sr8-media-rights | option-id referenties bestaan | akkoord | geen |
| lj3-vmbo/lj3v-sr9-photo-shared | option-id referenties bestaan | akkoord | geen |
| lj3-vmbo/lj3v-sr10-digital-access | option-id referenties bestaan | akkoord | geen |
| lj3-hv/lj3h-sr1-accountmail | option-id referenties bestaan | akkoord | geen |
| lj3-hv/lj3h-sr3-phone-actions | option-id referenties bestaan | akkoord | geen |
| lj3-hv/lj3h-sr4-triangulation | option-id referenties bestaan | akkoord | geen |
| lj3-hv/lj3h-sr5-filterbubble | option-id referenties bestaan | akkoord | geen |
| lj3-hv/lj3h-sr6-graph-scale | option-id referenties bestaan | akkoord | geen |
| lj3-hv/lj3h-sr7-ai-source-check | option-id referenties bestaan | akkoord | geen |
| lj3-hv/lj3h-sr8-remix-rights | option-id referenties bestaan | akkoord | geen |
| lj3-hv/lj3h-sr9-private-photo | option-id referenties bestaan | akkoord | geen |
| lj3-hv/lj3h-sr10-platform-dependence | option-id referenties bestaan | akkoord | geen |
