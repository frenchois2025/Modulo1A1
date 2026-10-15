/* BROUILLON : contenu déplacé du module 1. */
const qcmSaludos=[
  {q:'¿Cómo se dice "hola" de forma informal en francés?', opts:['Bonsoir','Bonjour','Salut','Au revoir'], ans:2, speak:'Salut'},
  {q:'"Comment allez-vous ?" es una forma…', opts:['informal','formal','para niños','con amigos'], ans:1},
  {q:'¿Cómo se responde de forma informal a "Ça va ?"', opts:['Je vais bien, merci. Et vous ?','Ça va bien, merci ! Et toi ?','Bonsoir !','Je m\'appelle Marie.'], ans:1},
  {q:'"Bonsoir" se usa…', opts:['Por la mañana','Todo el día','A partir del final de la tarde/noche','Solo con amigos'], ans:2, speak:'Bonsoir'},
  {q:'¿Cómo se pregunta la edad formalmente?', opts:['Tu as quel âge ?','Quel âge avez-vous ?','Comment tu t\'appelles ?','Tu habites où ?'], ans:1},
  {q:'J\'habite à Lyon → ¿Qué significa?', opts:['Vengo de Lyon','Vivo en Lyon','Trabajo en Lyon','Estudio en Lyon'], ans:1},
];
const fillPresentation=[
  {sentence:'___ m\'appelle Carlos. (yo)', answer:'Je', hint:'pronombre yo'},
  {sentence:'J\'___ vingt-deux ans. (tener)', answer:'ai', hint:'avoir 1a persona'},
  {sentence:'Je ___ de Mexico. (venir)', answer:'viens', hint:'venir 1a persona'},
  {sentence:'Je ___ étudiant. (ser)', answer:'suis', hint:'être 1a persona'},
  {sentence:'J\'habite ___ Madrid. (preposición ciudad)', answer:'à', hint:'à'},
  {sentence:'Je suis ___. → Soy español (masculino)', answer:'espagnol', hint:'nacionalidad masc.'},
];
const matchInterrogatifs=[
  {left:'Qui',right:'¿Quién?'},{left:'Où',right:'¿Dónde?'},{left:'Quand',right:'¿Cuándo?'},
  {left:'Comment',right:'¿Cómo?'},{left:'Pourquoi',right:'¿Por qué?'},{left:'Combien',right:'¿Cuánto/s?'},
];
const qcmFamille=[
  {q:'¿Cómo se dice "Tengo un hermano y dos hermanas"?', opts:['J\'ai une frère et deux sœurs.','J\'ai un frère et deux sœurs.','J\'ai un frère et deux frères.'], ans:1},
  {q:'"Je suis célibataire" significa:', opts:['Estoy casado/a.','Estoy en pareja.','Estoy soltero/a.'], ans:2},
  {q:'"Je n\'ai pas d\'enfants" →', opts:['Tengo hijos.','No tengo hijos.','Tengo un hijo.'], ans:1},
  {q:'¿Cómo se pregunta si alguien tiene hermanos (formal)?', opts:['Tu as des frères et sœurs ?','Avez-vous des frères et sœurs ?','Il a des frères ?'], ans:1},
];
const wordsL1=[
  {fr:'Bonjour',es:'Buenos días',ipa:'[bɔ̃.ʒuʁ]'},{fr:'Salut',es:'Hola (informal)',ipa:'[sa.ly]'},
  {fr:'Bonsoir',es:'Buenas noches',ipa:'[bɔ̃.swaʁ]'},{fr:'Merci',es:'Gracias',ipa:'[mɛʁ.si]'},
  {fr:'Enchanté',es:'Encantado',ipa:'[ɑ̃.ʃɑ̃.te]'},{fr:'Au revoir',es:'Hasta luego',ipa:'[o.ʁə.vwaʁ]'},
];
const raL1=[
  {phrase:"Bonjour ! Je m'appelle Carlos.",         translation:"¡Hola! Me llamo Carlos.",         voice:"m"},
  {phrase:"J'ai vingt-deux ans.",                   translation:"Tengo veintidós años.",            voice:"m"},
  {phrase:"Je suis mexicain. J'habite à Mexico.",   translation:"Soy mexicano. Vivo en México.",    voice:"m"},
  {phrase:"Comment vous appelez-vous ?",            translation:"¿Cómo se llama usted?",            voice:"f"},
  {phrase:"Enchanté de faire votre connaissance !", translation:"¡Encantado de conocerle!",         voice:"m"},
];
window.LESSON_DATA={stage:2,title:'Se présenter (brouillon)',lessons:[{id:1,title:'Salutations y cortesía',objective:'TODO — contenu à finaliser',explanation:'Contenu déplacé du module 1.',exercises:[{type:'qcm',data:qcmSaludos}]},{id:2,title:'Completa la presentación',objective:'TODO — contenu à finaliser',explanation:'Contenu déplacé du module 1.',exercises:[{type:'fill',data:fillPresentation}]},{id:3,title:'Preguntas y familia',objective:'TODO — contenu à finaliser',explanation:'Contenu déplacé du module 1.',exercises:[{type:'match',data:matchInterrogatifs},{type:'qcm',data:qcmFamille}]}]};
