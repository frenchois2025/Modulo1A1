/* Données migrées depuis a1-module1.html — étape 1. */
const ALPHA_FR = {'A':'a','B':'bé','C':'cée','D':'dé','E':'e','F':'ef','G':'gé','H':'ache','I':'i','J':'ji','K':'ka','L':'elle','M':'emme','N':'ène','O':'o','P':'pé','Q':'cul','R':'erre','S':'esse','T':'té','U':'u','V':'vé','W':'double vé','X':'iks','Y':'i grec','Z':'zède'};
const qcmSons=[
  {q:'Escucha 🔊 — ¿qué sonido tiene "ch" en "chat" ?', speak:'le chat', opts:['[k] como "kilo"','[ʃ] suave, como "sh" inglés','[tʃ] como en español'], ans:1},
  {q:'Escucha 🔊 — ¿cómo se pronuncia "oi" en "moi" ?', speak:'moi', opts:['[oi] como en español "hoy"','[wa] como en "water"','[o] como en "solo"'], ans:1},
  {q:'Escucha 🔊 — ¿cómo suena "ou" en "vous" ?', speak:'vous', opts:['[u] como en español "luna"','[o] como en "solo"','[w] como "w"'], ans:0},
  {q:'Escucha 🔊 — ¿cómo suena "gn" en "montagne" ?', speak:'montagne', opts:['[g]+[n] separados','[ɲ] como la "ñ" española','solo [n]'], ans:1},
  {q:'Escucha 🔊 — ¿"lune" y "loup" suenan igual?', speak:'la lune', speak2:'le loup', opts:['Sí, los dos son [u]','No — "lune" es [y] (labios redondeados), "loup" es [u]','Sí, los dos son [ou]'], ans:1},
];
const wordsU=[
  {fr:'la lune',es:'la luna',ipa:'[la lyn]'},{fr:'la rue',es:'la calle',ipa:'[la ʁy]'},{fr:'tu',es:'tú',ipa:'[ty]'},
  {fr:'pur',es:'puro',ipa:'[pyʁ]'},{fr:'le mur',es:'la pared',ipa:'[lə myʁ]'},{fr:'au-dessus',es:'encima',ipa:'[o d(ə).sy]'},
];
const wordsJ=[
  {fr:'jour',es:'día',ipa:'[ʒuʁ]'},{fr:'je',es:'yo',ipa:'[ʒə]'},{fr:'joli',es:'bonito',ipa:'[ʒɔ.li]'},
  {fr:'jardin',es:'jardín',ipa:'[ʒaʁ.dɛ̃]'},{fr:'girafe',es:'jirafa',ipa:'[ʒi.ʁaf]'},{fr:'janvier',es:'enero',ipa:'[ʒɑ̃.vje]'},
];
const wordsR = [
  {fr:'rue',       ipa:'[ʁy]',        es:'calle',         speak_fr:'rue'},
  {fr:'rouge',     ipa:'[ʁuʒ]',       es:'rojo',          speak_fr:'rouge'},
  {fr:'restaurant',ipa:'[ʁɛstoʁɑ̃]',  es:'restaurante',   speak_fr:'restaurant'},
  {fr:'merci',     ipa:'[mɛʁsi]',     es:'gracias',       speak_fr:'merci'},
  {fr:'bonjour',   ipa:'[bɔ̃ʒuʁ]',    es:'buenos días',   speak_fr:'bonjour'},
  {fr:'Paris',     ipa:'[paʁi]',      es:'París',         speak_fr:'Paris'},
  {fr:'partir',    ipa:'[paʁtiʁ]',    es:'partir',        speak_fr:'partir'},
  {fr:'après',     ipa:'[apʁɛ]',      es:'después',       speak_fr:'après'},
];
const eeAudioData = [
  {word:'été',     type:'cerrado', speak:'été'},
  {word:'père',    type:'abierto', speak:'le père'},
  {word:'manger',  type:'cerrado', speak:'manger'},
  {word:'fête',    type:'abierto', speak:'la fête'},
  {word:'chez',    type:'cerrado', speak:'chez'},
  {word:'lait',    type:'abierto', speak:'le lait'},
];
const wordsUOU = [
  {fr:'tu',    ipa:'[y]',  es:'tú (sonido U)',     speak_fr:'tu'},
  {fr:'tout',  ipa:'[u]',  es:'todo (sonido OU)',  speak_fr:'tout'},
  {fr:'rue',   ipa:'[y]',  es:'calle (U)',         speak_fr:'rue'},
  {fr:'roue',  ipa:'[u]',  es:'rueda (OU)',        speak_fr:'la roue'},
  {fr:'lune',  ipa:'[y]',  es:'luna (U)',          speak_fr:'la lune'},
  {fr:'loupe', ipa:'[u]',  es:'lupa (OU)',         speak_fr:'la loupe'},
  {fr:'vu',    ipa:'[y]',  es:'visto (U)',         speak_fr:'vu'},
  {fr:'vous',  ipa:'[u]',  es:'ustedes (OU)',      speak_fr:'vous'},
];
const qcmCons = [
  {q:'"boulanger" → ¿cómo se pronuncia "an"?', opts:['[an] como en español','[ɑ̃] nasal — el aire pasa por la nariz','[en] como en inglés'], ans:1, speak:'le boulanger'},
  {q:'"montagne" → ¿cómo se pronuncia "gn"?', opts:['Como "gn" en "gnomo"','Como la "ñ" española','Como "g" + "n" separadas'], ans:1, speak:'la montagne'},
  {q:'"vous" → ¿se pronuncia la "s" final?', opts:['Sí, siempre','No, la "s" final es muda','Solo si la siguiente palabra empieza por vocal'], ans:2, speak:'vous avez'},
  {q:'"garçon" → ¿qué indica la cedilla (ç)?', opts:['Se pronuncia como "k"','Se pronuncia como "s" suave','Se pronuncia como "sh"'], ans:1, speak:'le garçon'},
  {q:'"photo" → la combinación "ph" suena como…', opts:['p + h separadas','f','v'], ans:1, speak:'la photo'},
];
const qcmLiaison=[
  {speak:'Il aime',        ans:0, text:'Il aime',        expl:'Singular — no hay liaison. "Il" termina en "l", no hay [z].'},
  {speak:'Ils aiment',     ans:1, text:'Ils aiment',     expl:'Plural — hay liaison [z] : "il-z-aiment". La "s" de "Ils" se pronuncia como [z] ante vocal.'},
  {speak:'Elle arrive',    ans:0, text:'Elle arrive',    expl:'Singular — no hay liaison. Solo una persona.'},
  {speak:'Ils ont',        ans:1, text:'Ils ont',        expl:'Plural — liaison forte [z] : "il-z-ont". La liaison est obligatoire avec "avoir".'},
  {speak:'Elles arrivent', ans:1, text:'Elles arrivent', expl:'Plural — hay liaison [z] : "el-z-arrivent". La "s" de "Elles" se pronuncia como [z].'},
  {speak:'Il a',           ans:0, text:'Il a',           expl:'Singular — no hay liaison. Una sola persona.'},
];
const raFinal = [
  {phrase:'Je voudrais une bouteille d\'eau et du jus de fruit.',  voice:'f', translation:'Querría una botella de agua y un jugo de fruta.'},
  {phrase:'Il est parti hier soir par le train de nuit.',          voice:'m', translation:'Partió ayer por la noche en el tren nocturno.'},
  {phrase:'Les enfants jouent dans le jardin sous la pluie.',      voice:'f', translation:'Los niños juegan en el jardín bajo la lluvia.'},
  {phrase:'Vous avez un rendez-vous chez le médecin à neuf heures.',voice:'m', translation:'Usted tiene una cita en el médico a las nueve.'},
  {phrase:'La rue est très calme le dimanche matin.',              voice:'f', translation:'La calle está muy tranquila el domingo por la mañana.'},
];
const _nasales=[{comb:'an, en, am, em',words:[{fr:'sans',es:'sin'},{fr:'le vent',es:'el viento'},{fr:'la lampe',es:'la lámpara'},{fr:'le temps',es:'el tiempo'}]},{comb:'in, ain, ein, un',words:[{fr:'le pain',es:'el pan'},{fr:'la main',es:'la mano'},{fr:'vingt',es:'veinte'},{fr:'la synthèse',es:'el resumen'}]},{comb:'on, om',words:[{fr:'le bon',es:'el bueno'},{fr:'le nom',es:'el nombre'},{fr:'le pont',es:'el puente'},{fr:'la pompe',es:'la bomba'}]}];
window.LESSON_DATA={stage:1,title:'Prononciation',lessons:[{id:1,title:"El abecedario y las vocales nasales",objective:"TODO — objectif à préciser",explanation:"Ejercicio 1 — El abecedario. Haz clic en cada letra para escuchar su pronunciación en francés.\n\nEjercicio 2 — Vocales nasales. Une la combinación con un ejemplo y escúchalo.",exercises:[{type:'alphabet',data:ALPHA_FR},{type:'nasal',data:_nasales}]},{id:2,title:"El sonido [y] : la u francesa y el sonido [ʒ]",objective:"TODO — objectif à préciser",explanation:"La \"u\" francesa NO es como la \"u\" española.\n\nLa \"j\" francesa NO es como la jota española (fuerte y gutural).",exercises:[{type:'wordCards',data:wordsU},{type:'wordCards',data:wordsJ}]},{id:3,title:"El sonido [ʁ] y é cerrado [e] vs è abierto [ɛ]",objective:"TODO — objectif à préciser",explanation:"La \"r\" francesa NO se pronuncia como la \"r\" española. Es gutural.\n\nHaz clic en 🔊 para escuchar la palabra — sin verla. Luego elige si el sonido es cerrado o abierto.",exercises:[{type:'wordCards',data:wordsR},{type:'qcm',data:eeAudioData.map(x=>({q:'Escucha '+x.word+' — ¿cerrado o abierto?',opts:['Cerrado [e]','Abierto [ɛ]'],ans:x.type==='cerrado'?0:1}))}]},{id:4,title:"Consonnes spéciales et lettres finales muettes",objective:"TODO — objectif à préciser",explanation:"Elige la pronunciación correcta para cada letra o combinación.\n\nEn francés, muchas letras al final de una palabra NO se pronuncian.",exercises:[{type:'qcm',data:qcmCons},{type:'qcm',data:qcmLiais},{type:'wordCards',data:wordsUOU}]}]};
