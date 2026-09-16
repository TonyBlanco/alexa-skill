'use strict';

const COPY = {
  'es-ES': {
    invocation: 'compañero diario',
    medsMorning: 'las pastillas de la mañana',
    medsEvening: 'las pastillas de la noche',
    launchNew:
      'Hola. Soy tu compañero diario. Si estás configurando esto para alguien, di configura. Si ya vives conmigo, di estoy bien, o háblame.',
    launchMorning: (name) =>
      `Hola${name ? `, ${name}` : ''}. ¿Cómo estás esta mañana? Di: estoy bien.`,
    launchAfternoonOk: (name) =>
      `Hola${name ? `, ${name}` : ''}. Hoy ya me dijiste que estás bien. Si quieres, dime háblame. O pastillas, si toca.`,
    launchNeedMeds: (name, medsLabel) =>
      `Hola${name ? `, ${name}` : ''}. ¿Te tomaste ${medsLabel}? Di: me las tomé, todavía no, o no me acuerdo.`,
    launchEvening: (name) =>
      `Buenas noches${name ? `, ${name}` : ''}. ¿Cómo te encuentras? Di: estoy bien, o háblame.`,
    launchNight: (name) =>
      `Estoy aquí${name ? `, ${name}` : ''}. Si quieres compañía, di háblame. Si necesitas ayuda de verdad, di emergencia.`,
    checkInWell: (name) =>
      `Me alegra${name ? `, ${name}` : ''}. Si tocan pastillas, di pastillas. Si quieres compañía, di háblame.`,
    checkInUnwell:
      'Siento que no estés bien. Puedo quedarme un rato: di háblame. Si es urgente, di emergencia.',
    medsTaken: (label) => `Vale. Dejo apuntado ${label}. ¿Quieres que te acompañe un momento? Di háblame, o adiós.`,
    medsNotTaken: (label) =>
      `De acuerdo. Cuando tomes ${label}, dime pastillas. No te voy a insistir en que te las tomes ahora.`,
    medsUnsure: (label) =>
      `No pasa nada. Mira el pastillero antes de tomar otra. Cuando sepas si tomaste ${label}, dime pastillas.`,
    medsAsk: (label) => `¿Te tomaste ${label}? Di: me las tomé, todavía no, o no me acuerdo.`,
    medsAllDone: 'Hoy las pastillas que tengo apuntadas ya están. Si quieres, di háblame.',
    company: [
      'No estás sola ni solo. Estoy en la mesilla. Respira conmigo: aire adentro... y suelta. Si quieres otro rato, di háblame otra vez.',
      'El día no tiene que ser grande. Haber contestado ya cuenta. ¿Quieres que te pregunte qué tal ha ido, o prefieres adiós?',
      'Te acompaño un momento en silencio... Ya está. Si te apetece, cuéntame algo del día: di háblame.',
      'Un dicho corto: despacio se llega lejos. Yo no me voy. Di háblame para otro rato, o estoy bien si ya está.',
    ],
    companyFollowup: '¿Otro rato? Di háblame. O adiós.',
    emergency: (caregiver) =>
      caregiver
        ? `Estoy contigo. No puedo llamar yo al uno uno dos. Si puedes, di: Alexa, llama a ${caregiver}. Si es urgente y no llegas, pide ayuda en voz alta. ¿Quieres que te lo repita?`
        : 'Estoy contigo. No puedo llamar yo al uno uno dos. Si tienes un contacto en Alexa, di: Alexa, llama, y el nombre. El cuidador puede guardar ese contacto. ¿Quieres que te lo repita?',
    emergencyRepeat: (caregiver) =>
      caregiver
        ? `Despacio: Alexa, llama a ${caregiver}. Yo sigo aquí. Di háblame si quieres compañía, o adiós.`
        : 'Despacio: Alexa, llama, y el nombre de tu contacto. Yo sigo aquí. Di háblame, o adiós.',
    morning: (name) => `Buenos días${name ? `, ${name}` : ''}. ¿Cómo estás? Di: estoy bien.`,
    night: (name) => `Buenas noches${name ? `, ${name}` : ''}. Descansa. Si quedan pastillas, di pastillas. Si no, adiós.`,
    whatsNextCheckin: 'Ahora toca decir cómo estás. Di: estoy bien.',
    whatsNextMeds: (label) => `Ahora toca ${label}. Di pastillas cuando las hayas mirado.`,
    whatsNextRest: 'Ahora no toca nada obligatorio. Di háblame si quieres compañía, o adiós.',
    setupAskPerson: 'Vale. ¿Cómo se llama la persona que va a usar este altavoz? Di: se llama, y el nombre.',
    setupAskCaregiver: (person) =>
      `De acuerdo, ${person}. ¿Y tú, que cuidas, cómo te llamas? Di: yo me llamo, y tu nombre.`,
    setupDone: (person, caregiver) =>
      `Listo. Este altavoz es el compañero de ${person}${caregiver ? `, y el cuidador es ${caregiver}` : ''}. ${person} solo tiene que decir: estoy bien, pastillas, háblame, o ayuda. Si quieres avisos, di: pon los recordatorios.`,
    setupNeedName: 'No he pillado el nombre. Di: se llama Ana. Un solo nombre vale.',
    remindersAsk:
      'Voy a pedirte permiso para recordatorios de Alexa. Tú, el cuidador, di que sí. Luego el mayor solo oirá el aviso y dirá: Alexa, abre compañero diario.',
    remindersOk:
      'Permiso listo. Creo un aviso por la mañana y otro por la noche para abrir compañero diario. El mayor no tiene que tocar la app.',
    remindersDenied:
      'Sin permiso no puedo crear avisos de Alexa. El mayor puede abrir la skill diciendo: Alexa, abre compañero diario. Si cambias de idea, di: pon los recordatorios.',
    remindersCreated: 'Recordatorios diarios listos: mañana y noche. Di adiós, o prueba: estoy bien.',
    remindersFailed:
      'No he podido crear los recordatorios ahora. La skill sigue valiendo: ábrela a mano. Inténtalo más tarde con: pon los recordatorios.',
    help: 'Puedes decir: estoy bien, pastillas, háblame, o emergencia. Para parar, di adiós. ¿Qué quieres?',
    helpShort: 'Di: estoy bien, pastillas, háblame, o ayuda.',
    fallback: 'No te he entendido. Di: estoy bien, pastillas, háblame, o emergencia.',
    goodbye: 'Hasta luego. Aquí sigo.',
    stop: 'Vale. Hasta luego.',
    yesUnclear: 'Dime con palabras: estoy bien, pastillas, o háblame.',
    noUnclear: 'Vale. Di estoy bien, pastillas, háblame, o adiós.',
    error: 'Perdona, me he liado. Prueba otra vez: estoy bien, o háblame.',
  },
  'en-US': {
    invocation: 'daily companion',
    medsMorning: 'the morning pills',
    medsEvening: 'the evening pills',
    launchNew:
      'Hi. I am your daily companion. If you are setting this up for someone, say configure. If you live with me, say I am okay, or talk to me.',
    launchMorning: (name) => `Hi${name ? `, ${name}` : ''}. How are you this morning? Say: I am okay.`,
    launchAfternoonOk: (name) =>
      `Hi${name ? `, ${name}` : ''}. You already told me you are okay today. Say talk to me, or pills if it is time.`,
    launchNeedMeds: (name, medsLabel) =>
      `Hi${name ? `, ${name}` : ''}. Did you take ${medsLabel}? Say: I took them, not yet, or I do not remember.`,
    launchEvening: (name) => `Good evening${name ? `, ${name}` : ''}. How are you? Say: I am okay, or talk to me.`,
    launchNight: (name) =>
      `I am here${name ? `, ${name}` : ''}. Say talk to me for company. If this is urgent, say emergency.`,
    checkInWell: (name) =>
      `I am glad${name ? `, ${name}` : ''}. Say pills if it is time, or talk to me for company.`,
    checkInUnwell:
      'I am sorry you are not well. Say talk to me to stay with me. If it is urgent, say emergency.',
    medsTaken: (label) => `Okay. I noted ${label}. Want company? Say talk to me, or goodbye.`,
    medsNotTaken: (label) => `Okay. When you take ${label}, say pills. I will not push you to take them now.`,
    medsUnsure: (label) =>
      `That is okay. Check the pillbox before taking another. When you know about ${label}, say pills.`,
    medsAsk: (label) => `Did you take ${label}? Say: I took them, not yet, or I do not remember.`,
    medsAllDone: 'The pills I track for today are done. Say talk to me if you want company.',
    company: [
      'You are not alone. I am on the nightstand. Breathe in... and out. Say talk to me again for another moment.',
      'The day does not have to be big. Answering already counts. Say talk to me, or goodbye.',
      'I will sit with you a second... There. Say talk to me if you want another moment.',
      'A short saying: slow and steady. I am not going anywhere. Say talk to me, or I am okay.',
    ],
    companyFollowup: 'Another moment? Say talk to me. Or goodbye.',
    emergency: (caregiver) =>
      caregiver
        ? `I am with you. I cannot call emergency services myself. If you can, say: Alexa, call ${caregiver}. If you cannot, call out for help. Want me to repeat that?`
        : 'I am with you. I cannot call emergency services myself. If you have an Alexa contact, say: Alexa, call, then the name. Want me to repeat that?',
    emergencyRepeat: (caregiver) =>
      caregiver
        ? `Slowly: Alexa, call ${caregiver}. I am still here. Say talk to me, or goodbye.`
        : 'Slowly: Alexa, call, then the contact name. I am still here. Say talk to me, or goodbye.',
    morning: (name) => `Good morning${name ? `, ${name}` : ''}. How are you? Say: I am okay.`,
    night: (name) =>
      `Good night${name ? `, ${name}` : ''}. Rest. If pills are left, say pills. Otherwise goodbye.`,
    whatsNextCheckin: 'Please tell me how you are. Say: I am okay.',
    whatsNextMeds: (label) => `Now it is ${label}. Say pills when you have checked.`,
    whatsNextRest: 'Nothing required right now. Say talk to me for company, or goodbye.',
    setupAskPerson: 'Okay. What is the name of the person who will use this speaker? Say: their name is, then the name.',
    setupAskCaregiver: (person) => `Got it, ${person}. And your name, the caregiver? Say: my name is, then your name.`,
    setupDone: (person, caregiver) =>
      `Done. This speaker is ${person}'s companion${caregiver ? `, and the caregiver is ${caregiver}` : ''}. ${person} can say: I am okay, pills, talk to me, or help. For alerts, say: set the reminders.`,
    setupNeedName: 'I missed the name. Say: their name is Ana. One first name is enough.',
    remindersAsk:
      'I will ask you, the caregiver, for Alexa reminder permission. Say yes. Then the older adult only hears the chime and says: Alexa, open daily companion.',
    remindersOk: 'Permission granted. I will add a morning and evening reminder to open daily companion.',
    remindersDenied:
      'Without permission I cannot create Alexa reminders. They can still say: Alexa, open daily companion. Say set the reminders if you change your mind.',
    remindersCreated: 'Daily reminders are set: morning and night. Say goodbye, or try: I am okay.',
    remindersFailed: 'I could not create reminders right now. Open the skill by voice. Try set the reminders later.',
    help: 'You can say: I am okay, pills, talk to me, or emergency. To stop, say goodbye. What do you need?',
    helpShort: 'Say: I am okay, pills, talk to me, or help.',
    fallback: 'I did not catch that. Say: I am okay, pills, talk to me, or emergency.',
    goodbye: 'See you later. I will be here.',
    stop: 'Okay. See you later.',
    yesUnclear: 'Please use words: I am okay, pills, or talk to me.',
    noUnclear: 'Okay. Say I am okay, pills, talk to me, or goodbye.',
    error: 'Sorry, I got confused. Try: I am okay, or talk to me.',
  },
};

function localeBundle(locale) {
  if (locale && locale.toLowerCase().startsWith('en')) {
    return COPY['en-US'];
  }
  return COPY['es-ES'];
}

function wrapSpeak(text, { slow = true } = {}) {
  const safe = String(text).replace(/&/g, 'y');
  if (!slow) {
    return `<speak>${safe}</speak>`;
  }
  return `<speak><prosody rate="92%">${safe}</prosody></speak>`;
}

function medsLabel(copy, medsId) {
  return medsId === 'noche' ? copy.medsEvening : copy.medsMorning;
}

function companyLine(copy, isoDay, hour) {
  const lines = copy.company;
  const index = Math.abs(Number(String(isoDay).replace(/-/g, '')) + hour) % lines.length;
  return lines[index];
}

module.exports = {
  COPY,
  localeBundle,
  wrapSpeak,
  medsLabel,
  companyLine,
};
