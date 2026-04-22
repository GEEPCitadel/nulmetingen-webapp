const instrumentData = {
  'lj1-vmbo': {
    id: 'lj1-vmbo',
    name: 'Digitale Geletterdheid - LJ1 VMBO',
    targetGroup: 'leerjaar 1 VMBO',
    duration: 30,
    maxScore: 32,
    blocks: [
      {
        id: 'self-rating',
        type: 'self-rating',
        order: 0,
        prompt: 'Hoe goed ben jij met digitale dingen zoals computers, internet, apps en AI? Geef jezelf een cijfer van 0 (heel slecht) tot 100 (heel goed).',
        minValue: 0,
        maxValue: 100,
        countToScore: false
      },
      {
        id: 'mc-block',
        type: 'multiple-choice',
        order: 1,
        items: [
          {
            id: 'MC1',
            kd: 'KD1',
            stem: 'Welke van deze is hardware?',
            options: [
              'Een app',
              'Het besturingssysteem, bijvoorbeeld Windows of ChromeOS',
              'Een muis',
              'Een wachtwoord'
            ],
            correctAnswer: 'Een muis',
            points: 1
          },
          {
            id: 'MC2',
            kd: 'KD2',
            stem: 'Waarom laat TikTok je telkens dezelfde soort filmpjes zien?',
            options: [
              'TikTok kiest filmpjes willekeurig',
              'Een algoritme ziet waar jij lang naar kijkt en laat meer van zulke filmpjes zien',
              'Omdat jouw vrienden diezelfde filmpjes liken',
              'Omdat TikTok dat moet van de overheid'
            ],
            correctAnswer: 'Een algoritme ziet waar jij lang naar kijkt en laat meer van zulke filmpjes zien',
            points: 1
          },
          {
            id: 'MC3',
            kd: 'KD3',
            stem: 'Welk wachtwoord is het sterkst?',
            options: [
              'voetbal123',
              'Welkom!',
              'MijnKatHeetPoesPoes',
              '123456'
            ],
            correctAnswer: 'MijnKatHeetPoesPoes',
            points: 1
          },
          {
            id: 'MC4',
            kd: 'KD4',
            stem: 'Je zoekt op Google naar nieuwe sneakers. De volgende dag zie je overal reclame voor sneakers. Hoe kan dat?',
            options: [
              'Heel veel mensen zoeken toevallig ook sneakers',
              'Bedrijven krijgen data over wat jij online doet en gebruiken die voor advertenties',
              'Dat is toeval',
              'Google heeft per ongeluk je scherm gedeeld'
            ],
            correctAnswer: 'Bedrijven krijgen data over wat jij online doet en gebruiken die voor advertenties',
            points: 1
          },
          {
            id: 'MC5',
            kd: 'KD5',
            stem: 'Wat is AI, kunstmatige intelligentie?',
            options: [
              'Een robot die precies hetzelfde werkt als een mens',
              'Een computerprogramma dat leert en taken doet waarvoor normaal menselijk denken nodig is',
              'Een virus in je computer',
              'Een app om filmpjes mee te bewerken'
            ],
            correctAnswer: 'Een computerprogramma dat leert en taken doet waarvoor normaal menselijk denken nodig is',
            points: 1
          },
          {
            id: 'MC6',
            kd: 'KD5',
            stem: 'Je vraagt ChatGPT: \'Wanneer is Anne Frank geboren?\' De AI geeft een jaartal. Wat doe je?',
            options: [
              'Ik neem het jaartal gewoon over, AI weet alles',
              'Ik check het op een betrouwbare site, want AI kan fouten maken of iets verzinnen',
              'Ik check het alleen als het vreemd lijkt',
              'Niets, AI liegt nooit'
            ],
            correctAnswer: 'Ik check het op een betrouwbare site, want AI kan fouten maken of iets verzinnen',
            points: 1
          },
          {
            id: 'MC7',
            kd: 'KD6',
            stem: 'Je maakt een filmpje voor school en wilt muziek van een bekende artiest gebruiken. Wat klopt?',
            options: [
              'Alles op internet mag je zomaar gebruiken',
              'Dat mag als je de naam van de artiest noemt',
              'Op muziek zit auteursrecht; je hebt toestemming nodig of je gebruikt muziek die dat toestaat',
              'Het mag alleen niet als je er geld mee verdient'
            ],
            correctAnswer: 'Op muziek zit auteursrecht; je hebt toestemming nodig of je gebruikt muziek die dat toestaat',
            points: 1
          },
          {
            id: 'MC8',
            kd: 'KD7',
            stem: 'In een programma moet je 10 rondjes tekenen op het scherm. Wat is de slimste manier?',
            options: [
              'Tien keer opschrijven: teken een rondje',
              'Eén keer schrijven: herhaal 10 keer: teken een rondje',
              'Rondje typen, de computer snapt het wel',
              'Een foto van tien rondjes erin plakken'
            ],
            correctAnswer: 'Eén keer schrijven: herhaal 10 keer: teken een rondje',
            points: 1
          },
          {
            id: 'MC9',
            kd: 'KD7',
            stem: 'Wat is een algoritme?',
            options: [
              'Een computertaal',
              'Een stap-voor-stap instructie om iets op te lossen',
              'Een soort virus',
              'Een computerspel'
            ],
            correctAnswer: 'Een stap-voor-stap instructie om iets op te lossen',
            points: 1
          },
          {
            id: 'MC10',
            kd: 'KD8',
            stem: 'Milan krijgt elke dag gemene berichten in de klassenapp. Hij lacht erom, maar je ziet dat hij stiller wordt. Wat klopt?',
            options: [
              'Het is maar een grapje, daar moet je niks van aantrekken',
              'Dit is cyberpesten; ook als het als grap bedoeld is, kan het iemand echt raken',
              'Dat hoort bij social media',
              'Er is niks aan de hand, Milan lacht toch'
            ],
            correctAnswer: 'Dit is cyberpesten; ook als het als grap bedoeld is, kan het iemand echt raken',
            points: 1
          },
          {
            id: 'MC11',
            kd: 'KD8',
            stem: 'Je merkt dat je elke avond uren blijft scrollen op je telefoon, ook al wilde je eerder stoppen. Wat is een gezonde aanpak?',
            options: [
              'Niets doen, het gaat vanzelf over',
              'Meer opladers kopen zodat je telefoon niet leeg raakt',
              'Zelf grenzen afspreken, bijvoorbeeld schermtijd instellen of je telefoon niet mee naar bed nemen',
              'Je account verwijderen is de enige oplossing'
            ],
            correctAnswer: 'Zelf grenzen afspreken, bijvoorbeeld schermtijd instellen of je telefoon niet mee naar bed nemen',
            points: 1
          },
          {
            id: 'MC12',
            kd: 'KD9',
            stem: 'In Nederland gebruiken bijna alle mensen DigiD om in te loggen bij de overheid. Wat gebeurt er als DigiD een dag niet werkt?',
            options: [
              'Niets bijzonders, je kunt alles nog regelen',
              'Veel mensen kunnen die dag geen overheidszaken regelen',
              'Alleen ouderen hebben er last van',
              'Overheidswebsites werken dan juist sneller'
            ],
            correctAnswer: 'Veel mensen kunnen die dag geen overheidszaken regelen',
            points: 1
          }
        ]
      },
      {
        id: 'pt1-block',
        type: 'file-management',
        order: 2,
        duration: 6,
        maxScore: 5,
        tasks: [
          { id: 'A', instruction: 'Maak in School een map Biologie.' },
          { id: 'B', instruction: 'Verplaats huiswerk_cellen.docx naar School/Biologie.' },
          { id: 'C', instruction: 'Verplaats spreekbeurt_aardrijkskunde.pptx uit Downloads naar School/Aardrijkskunde.' },
          { id: 'D', instruction: 'Hernoem onbenoemd.docx naar werkstuk_geschiedenis.docx.' },
          { id: 'E', instruction: 'Verplaats vakantie_strand.jpg naar Foto\'s.' }
        ]
      },
      {
        id: 'pt2-block',
        type: 'source-evaluation',
        order: 3,
        duration: 5,
        maxScore: 8,
        items: [
          {
            id: 'PT2-1',
            mockupType: 'news-article',
            judgeOptions: ['Ja', 'Twijfel', 'Nee', 'Weet ik niet'],
            correctJudgment: 'Ja',
            reasonOptions: [
              'Het is een bekende nieuwsredactie, er staat een auteur bij en er is een bron vermeld',
              'De tekst is kort, dus makkelijk te geloven',
              'Er staat geen reclame omheen, dus het is vast betaald door de overheid',
              'Alle websites die op .nl eindigen zijn betrouwbaar'
            ],
            correctReason: 'Het is een bekende nieuwsredactie, er staat een auteur bij en er is een bron vermeld',
            points: 2
          },
          {
            id: 'PT2-2',
            mockupType: 'tiktok-post',
            judgeOptions: ['Ja', 'Twijfel', 'Nee', 'Weet ik niet'],
            correctJudgment: 'Nee',
            reasonOptions: [
              'Er is geen bron, de maker is anoniem en de post gebruikt angst om gedeeld te worden',
              'Het heeft veel likes, dus het is wel waar',
              'Het gaat over gezondheid, dus het is belangrijk',
              'Er staat \'wetenschappers\' in de tekst, dus het is wetenschappelijk'
            ],
            correctReason: 'Er is geen bron, de maker is anoniem en de post gebruikt angst om gedeeld te worden',
            points: 2
          },
          {
            id: 'PT2-3',
            mockupType: 'commercial-site',
            judgeOptions: ['Ja', 'Twijfel', 'Nee', 'Weet ik niet'],
            correctJudgment: 'Nee',
            reasonOptions: [
              'De website probeert vooral iets te verkopen en gebruikt overdreven claims als waarschuwingstruc',
              'Er staat \'gezond\' in de naam van de website, dus het klopt',
              'Het ziet er professioneel uit',
              'Fruit is gezond, dus het artikel klopt'
            ],
            correctReason: 'De website probeert vooral iets te verkopen en gebruikt overdreven claims als waarschuwingstruc',
            points: 2
          },
          {
            id: 'PT2-4',
            mockupType: 'educational-article',
            judgeOptions: ['Ja', 'Twijfel', 'Nee', 'Weet ik niet'],
            correctJudgment: 'Ja',
            reasonOptions: [
              'Schooltv is een educatieve site, er is een redacteur genoemd en er is samengewerkt met een expert',
              'Het is voor kinderen gemaakt, dus het kan geen echte informatie zijn',
              'Er staat een foto bij, dus het klopt',
              'Het woord \'school\' staat in de naam, dus het is automatisch goed'
            ],
            correctReason: 'Schooltv is een educatieve site, er is een redacteur genoemd en er is samengewerkt met een expert',
            points: 2
          }
        ]
      },
      {
        id: 'pt3-block',
        type: 'phishing-detection',
        order: 4,
        duration: 5,
        maxScore: 7,
        items: [
          {
            id: 'PT3-1',
            mockupType: 'school-email',
            judgeOptions: ['Verdacht', 'Veilig', 'Weet ik niet'],
            correctJudgment: 'Veilig',
            points: 1
          },
          {
            id: 'PT3-2',
            mockupType: 'phishing-netflix',
            judgeOptions: ['Verdacht', 'Veilig', 'Weet ik niet'],
            correctJudgment: 'Verdacht',
            featureOptions: [
              'Het afzenderadres klopt niet en er wordt druk gezet om snel te klikken',
              'De e-mail heeft een slordige opmaak',
              'Er staat een knop in de mail, en knoppen zijn altijd verdacht',
              'Er staat geen logo van Netflix in de mail'
            ],
            correctFeature: 'Het afzenderadres klopt niet en er wordt druk gezet om snel te klikken',
            points: 2
          },
          {
            id: 'PT3-3',
            mockupType: 'phishing-postnl',
            judgeOptions: ['Verdacht', 'Veilig', 'Weet ik niet'],
            correctJudgment: 'Verdacht',
            featureOptions: [
              'Het komt van een onbekend mobiel nummer en de link is niet van postnl.nl',
              'Het bedrag is te laag om serieus te nemen',
              'PostNL stuurt nooit berichten',
              'Het is nacht, dus het klopt niet'
            ],
            correctFeature: 'Het komt van een onbekend mobiel nummer en de link is niet van postnl.nl',
            points: 2
          },
          {
            id: 'PT3-4',
            mockupType: 'phishing-whatsapp',
            judgeOptions: ['Verdacht', 'Veilig', 'Weet ik niet'],
            correctJudgment: 'Verdacht',
            featureOptions: [
              'Iemand doet zich voor als een bekende via een onbekend nummer en vraagt direct om geld',
              'Het bedrag is te laag om op te lichten',
              'Hij zegt dat hij morgen terugbetaalt, dus dan klopt het',
              'De rekening begint met NL, dus het is veilig'
            ],
            correctFeature: 'Iemand doet zich voor als een bekende via een onbekend nummer en vraagt direct om geld',
            points: 2
          }
        ]
      }
    ]
  }
};

export default instrumentData;
