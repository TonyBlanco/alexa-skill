'use strict';

const COPY = {
  'es-ES': {
    invocation: 'compañero diario',
    medsMorning: 'las pastillas de la mañana',
    medsEvening: 'las pastillas de la noche',
    mealBreakfast: 'el desayuno',
    mealLunch: 'la comida',
    mealDinner: 'la cena',
    launchNew:
      'Hola, Luis. Soy tu compañero diario. Di: comida, pastillas, caminar, qué hora es, o háblame.',
    launchMorning: (name) =>
      `Hola${name ? `, ${name}` : ''}. ¿Cómo estás esta mañana? Di: estoy bien.`,
    launchAfternoonOk: (name) =>
      `Hola${name ? `, ${name}` : ''}. Hoy ya me dijiste que estás bien. Si quieres, dime háblame, qué hora es, o caminar.`,
    launchNeedMeds: (name, medsLabel) =>
      `Hola${name ? `, ${name}` : ''}. ¿Te tomaste ${medsLabel}? Di: me las tomé, todavía no, o no me acuerdo.`,
    launchNeedMeal: (name, meal) =>
      `Hola${name ? `, ${name}` : ''}. ¿Ya tomaste ${meal}? Di: ya comí, o todavía no.`,
    launchNeedWalk: (name) =>
      `Hola${name ? `, ${name}` : ''}. ¿Has dado un paseo suave o te has movido un poco? Di: ya me he movido, o todavía no.`,
    launchEvening: (name) =>
      `Buenas noches${name ? `, ${name}` : ''}. ¿Cómo te encuentras? Di: estoy bien, o háblame.`,
    launchNight: (name) =>
      `Estoy aquí${name ? `, ${name}` : ''}. Si quieres compañía, di háblame. Si necesitas ayuda de verdad, di emergencia.`,
    checkInWell: (name) =>
      `Me alegra${name ? `, ${name}` : ''}. Si toca comer, di comida. Si tocan pastillas, di pastillas. Si quieres compañía, di háblame.`,
    checkInUnwell:
      'Siento que no estés bien. Puedo quedarme un rato: di háblame. Si es urgente, di emergencia. Yo no llamo al uno uno dos.',
    medsTaken: (label) => `Vale. Dejo apuntado ${label}. ¿Quieres que te acompañe un momento? Di háblame, o adiós.`,
    medsNotTaken: (label) =>
      `De acuerdo. Cuando tomes ${label}, dime pastillas. No te voy a insistir en que te las tomes ahora.`,
    medsUnsure: (label) =>
      `No pasa nada. Mira el pastillero antes de tomar otra. Cuando sepas si tomaste ${label}, dime pastillas.`,
    medsAsk: (label) => `¿Te tomaste ${label}? Di: me las tomé, todavía no, o no me acuerdo.`,
    medsAllDone: 'Hoy las pastillas que tengo apuntadas ya están. Si quieres, di háblame.',
    mealAsk: (label) => `¿Ya tomaste ${label}? Di: ya comí, o todavía no.`,
    mealDone: (label) => `Vale. Dejo apuntado ${label}. Si tocan pastillas, di pastillas. Si quieres, di háblame.`,
    mealNot: (label) => `De acuerdo. Cuando tomes ${label}, dime comida. No te voy a insistir ahora.`,
    walkAsk: '¿Has dado un paseo suave o te has movido un poco? Di: ya me he movido, o todavía no. Sin prisas.',
    walkDone: 'Bien. Un poco de movimiento ya cuenta. Si quieres, di háblame, o qué hora es.',
    walkNot: 'Vale. Cuando te muevas un poco, dime caminar. Un paseo suave, sin prisas.',
    clockNow: (spoken, hint) => `${spoken}. ${hint}`,
    clockHintMeal: (label) => `Toca ${label}. Di comida cuando hayas comido.`,
    clockHintMeds: (label) => `Toca ${label}. Di pastillas cuando las hayas mirado.`,
    clockHintWalk: 'Si puedes, un paseo suave. Di caminar.',
    clockHintRest: 'Si quieres compañía, di háblame.',
    company: [
      'No estás solo. Estoy en la mesilla. Respira conmigo: aire adentro... y suelta. Si quieres otro rato, di háblame otra vez.',
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
    whatsNextMeal: (label) => `Ahora toca ${label}. Di comida cuando hayas comido.`,
    whatsNextWalk: 'Ahora toca moverte un poco. Di caminar cuando te hayas movido, sin prisas.',
    whatsNextRest: 'Ahora no toca nada obligatorio. Di háblame, qué hora es, o adiós.',
    setupAskPerson: 'Vale. ¿Cómo se llama la persona que va a usar este altavoz? Di: se llama, y el nombre.',
    setupAskCaregiver: (person) =>
      `De acuerdo, ${person}. ¿Y tú, que cuidas, cómo te llamas? Di: yo me llamo, y tu nombre.`,
    setupDone: (person, caregiver) =>
      `Listo. Este altavoz es el compañero de ${person}${caregiver ? `, y el cuidador es ${caregiver}` : ''}. ${person} puede decir: comida, pastillas, caminar, qué hora es, háblame. Si quieres avisos que suenen aunque yo me calle, di: pon los recordatorios.`,
    setupNeedName: 'No he pillado el nombre. Di: se llama Luis. Un solo nombre vale.',
    remindersAsk:
      'Voy a pedir permiso para recordatorios nativos de Alexa. Tú di que sí. Esos avisos suenan aunque se cierre la skill: desayuno, pastillas, paseo y comida.',
    remindersOk:
      'Permiso listo. Creo avisos nativos de Alexa para desayuno, pastillas, paseo suave y comida. Suenan aunque yo me calle. No hace falta tocar la app.',
    remindersDenied:
      'Sin permiso no puedo crear avisos de la skill. En la app de Alexa puedes poner recordatorios o rutinas nativas: desayuno, pastillas, caminar, comida. O di: pon los recordatorios, si cambias de idea.',
    remindersCreated:
      'Avisos listos: desayuno, pastillas, paseo y comida. Suenan aunque se cierre compañero diario. Di adiós, o prueba: qué hora es.',
    remindersFailed:
      'No he podido crear los recordatorios ahora. Mientras, usa los nativos: Alexa, recuérdame las pastillas. Inténtalo más tarde con: pon los recordatorios.',
    help: 'Puedes decir: comida, pastillas, caminar, qué hora es, háblame, o estoy bien. Para parar, di adiós. ¿Qué quieres?',
    helpShort: 'Di: comida, pastillas, caminar, qué hora es, o háblame.',
    fallback: 'No te he entendido. Di: comida, pastillas, caminar, qué hora es, o háblame.',
    callKnown: (name) =>
      `Para hablar con ${name} la llamada la hace Alexa, no yo. Di adiós, y luego despacio: Alexa, llama a ${name}. El cuidador tiene que haber guardado a ${name} en contactos de Alexa una vez.`,
    callUnknown: (name) =>
      name
        ? `No tengo a ${name} apuntado. El cuidador puede decir: añade a ${name}. Mientras, prueba: Alexa, llama a ${name}.`
        : '¿A quién llamo? Di: llama Miguel.',
    callNeedName: 'Di el nombre. Por ejemplo: llama Miguel.',
    contactAdded: (name) =>
      `He apuntado a ${name}. En la app de Alexa, el cuidador también lo guarda como contacto de llamada una vez. Luego el mayor dice: llama ${name}.`,
    contactNeedName: 'No he pillado el nombre. Di: añade a Miguel.',
    vitalsNone:
      'Todavía no tengo constantes del reloj. No es un dato médico. El cuidador puede decir: pulso, y el número. O, más adelante, el reloj las sube solo.',
    vitalsRead: (parts, stale) =>
      `${stale ? 'Tengo un dato antiguo. ' : ''}Último dato: ${parts}. No es un diagnóstico. Si te encuentras mal, di llama y el nombre, o emergencia.`,
    vitalsRecorded: (parts) => `Dejo apuntado ${parts}. No es un dato médico. Di constantes cuando quieras oírlas.`,
    vitalsNeedNumber: 'Dime el pulso con un número. Por ejemplo: pulso setenta y dos.',
    vitalsUnusual: ' Ese pulso está fuera de lo habitual en reposo. Si te encuentras mal, di llama y el nombre.',
    goodbye: 'Hasta luego. Aquí sigo.',
    stop: 'Vale. Hasta luego.',
    yesUnclear: 'Dime con palabras: comida, pastillas, caminar, o háblame.',
    noUnclear: 'Vale. Di comida, pastillas, caminar, háblame, o adiós.',
    error: 'Perdona, me he liado. Prueba otra vez: estoy bien, o háblame.',
  },
  'en-US': {
    invocation: 'daily companion',
    medsMorning: 'the morning pills',
    medsEvening: 'the evening pills',
    mealBreakfast: 'breakfast',
    mealLunch: 'lunch',
    mealDinner: 'dinner',
    launchNew:
      'Hi, Luis. I am your daily companion. Say: meal, pills, walk, what time is it, or talk to me.',
    launchMorning: (name) => `Hi${name ? `, ${name}` : ''}. How are you this morning? Say: I am okay.`,
    launchAfternoonOk: (name) =>
      `Hi${name ? `, ${name}` : ''}. You already told me you are okay today. Say talk to me, what time is it, or walk.`,
    launchNeedMeds: (name, medsLabel) =>
      `Hi${name ? `, ${name}` : ''}. Did you take ${medsLabel}? Say: I took them, not yet, or I do not remember.`,
    launchNeedMeal: (name, meal) =>
      `Hi${name ? `, ${name}` : ''}. Did you have ${meal} yet? Say: I already ate, or not yet.`,
    launchNeedWalk: (name) =>
      `Hi${name ? `, ${name}` : ''}. Have you taken a gentle walk or moved a little? Say: I already moved, or not yet.`,
    launchEvening: (name) => `Good evening${name ? `, ${name}` : ''}. How are you? Say: I am okay, or talk to me.`,
    launchNight: (name) =>
      `I am here${name ? `, ${name}` : ''}. Say talk to me for company. If this is urgent, say emergency.`,
    checkInWell: (name) =>
      `I am glad${name ? `, ${name}` : ''}. Say meal if it is time to eat, pills if it is time, or talk to me.`,
    checkInUnwell:
      'I am sorry you are not well. Say talk to me to stay with me. If it is urgent, say emergency. I cannot call emergency services.',
    medsTaken: (label) => `Okay. I noted ${label}. Want company? Say talk to me, or goodbye.`,
    medsNotTaken: (label) => `Okay. When you take ${label}, say pills. I will not push you to take them now.`,
    medsUnsure: (label) =>
      `That is okay. Check the pillbox before taking another. When you know about ${label}, say pills.`,
    medsAsk: (label) => `Did you take ${label}? Say: I took them, not yet, or I do not remember.`,
    medsAllDone: 'The pills I track for today are done. Say talk to me if you want company.',
    mealAsk: (label) => `Did you have ${label} yet? Say: I already ate, or not yet.`,
    mealDone: (label) => `Okay. I noted ${label}. Say pills if it is time, or talk to me.`,
    mealNot: (label) => `Okay. When you have ${label}, say meal. I will not push you now.`,
    walkAsk: 'Have you taken a gentle walk or moved a little? Say: I already moved, or not yet. No rush.',
    walkDone: 'Good. A little movement counts. Say talk to me, or what time is it.',
    walkNot: 'Okay. When you move a little, say walk. A gentle walk, no rush.',
    clockNow: (spoken, hint) => `${spoken}. ${hint}`,
    clockHintMeal: (label) => `Time for ${label}. Say meal when you have eaten.`,
    clockHintMeds: (label) => `Time for ${label}. Say pills when you have checked.`,
    clockHintWalk: 'If you can, a gentle walk. Say walk.',
    clockHintRest: 'Say talk to me if you want company.',
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
    whatsNextMeal: (label) => `Now it is ${label}. Say meal when you have eaten.`,
    whatsNextWalk: 'Time to move a little. Say walk when you have moved. No rush.',
    whatsNextRest: 'Nothing required right now. Say talk to me, what time is it, or goodbye.',
    setupAskPerson: 'Okay. What is the name of the person who will use this speaker? Say: their name is, then the name.',
    setupAskCaregiver: (person) => `Got it, ${person}. And your name, the caregiver? Say: my name is, then your name.`,
    setupDone: (person, caregiver) =>
      `Done. This speaker is ${person}'s companion${caregiver ? `, and the caregiver is ${caregiver}` : ''}. ${person} can say: meal, pills, walk, what time is it, talk to me. For alerts that still fire if I go quiet, say: set the reminders.`,
    setupNeedName: 'I missed the name. Say: their name is Luis. One first name is enough.',
    remindersAsk:
      'I will ask for native Alexa reminder permission. Say yes. Those alerts still speak if the skill session ends: breakfast, pills, a gentle walk, and lunch.',
    remindersOk: 'Permission granted. I will add native Alexa reminders for breakfast, pills, a gentle walk, and lunch. They still fire if I go quiet.',
    remindersDenied:
      'Without permission I cannot create skill reminders. You can still set native Alexa reminders or routines for meals, pills, and walking. Say set the reminders if you change your mind.',
    remindersCreated: 'Reminders are set: breakfast, pills, walk, and lunch. They still fire if daily companion closes. Say goodbye, or try: what time is it.',
    remindersFailed: 'I could not create reminders right now. Meanwhile say: Alexa, remind me about pills. Try set the reminders later.',
    help: 'You can say: meal, pills, walk, what time is it, talk to me, or I am okay. To stop, say goodbye. What do you need?',
    helpShort: 'Say: meal, pills, walk, what time is it, or talk to me.',
    fallback: 'I did not catch that. Say: meal, pills, walk, what time is it, or talk to me.',
    goodbye: 'See you later. I will be here.',
    stop: 'Okay. See you later.',
    yesUnclear: 'Please use words: meal, pills, walk, or talk to me.',
    noUnclear: 'Okay. Say meal, pills, walk, talk to me, or goodbye.',
    error: 'Sorry, I got confused. Try: I am okay, or talk to me.',
    callKnown: (name) =>
      `To talk to ${name}, Alexa places the call, not me. Say goodbye, then slowly: Alexa, call ${name}. The caregiver must save ${name} in Alexa contacts once.`,
    callUnknown: (name) =>
      name
        ? `I do not have ${name} saved. The caregiver can say: add ${name}. Meanwhile try: Alexa, call ${name}.`
        : 'Who should I call? Say: call Miguel.',
    callNeedName: 'Say the name. For example: call Miguel.',
    contactAdded: (name) =>
      `I saved ${name}. In the Alexa app, the caregiver also adds them as a calling contact once. Then they can say: call ${name}.`,
    contactNeedName: 'I missed the name. Say: add Miguel.',
    vitalsNone:
      'I do not have watch readings yet. This is not medical data. The caregiver can say: pulse, then the number. Later the watch can upload them.',
    vitalsRead: (parts, stale) =>
      `${stale ? 'This reading is old. ' : ''}Last reading: ${parts}. Not a diagnosis. If you feel unwell, say call and the name, or emergency.`,
    vitalsRecorded: (parts) => `Noted ${parts}. Not medical data. Say vitals when you want to hear them.`,
    vitalsNeedNumber: 'Say the pulse with a number. For example: pulse seventy two.',
    vitalsUnusual: ' That pulse is outside a typical resting range. If you feel unwell, say call and the name.',
  },
};

function localeBundle(locale) {
  if (locale && locale.toLowerCase().startsWith('en')) {
    return COPY['en-US'];
  }
  return COPY['es-ES'];
}

function wrapSpeak(text, { slow = true } = {}) {
  const safe = String(text)
    .replace(/&/g, 'y')
    .replace(/</g, '')
    .replace(/>/g, '');
  if (!slow) {
    return `<speak>${safe}</speak>`;
  }
  return `<speak><prosody rate="92%">${safe}</prosody></speak>`;
}

function medsLabel(copy, medsId) {
  return medsId === 'noche' ? copy.medsEvening : copy.medsMorning;
}

function mealLabel(copy, mealId) {
  if (mealId === 'cena') return copy.mealDinner;
  if (mealId === 'desayuno') return copy.mealBreakfast;
  return copy.mealLunch;
}

function companyLine(copy, isoDay, hour) {
  const lines = copy.company;
  const index = Math.abs(Number(String(isoDay).replace(/-/g, '')) + hour) % lines.length;
  return lines[index];
}

function vitalsParts(vitals, locale = 'es-ES') {
  const es = !(locale && locale.toLowerCase().startsWith('en'));
  const bits = [];
  if (vitals?.heartRate != null) bits.push(es ? `pulso ${vitals.heartRate}` : `pulse ${vitals.heartRate}`);
  if (vitals?.spo2 != null) bits.push(es ? `oxígeno ${vitals.spo2}` : `oxygen ${vitals.spo2}`);
  if (vitals?.systolic != null && vitals?.diastolic != null) {
    bits.push(es ? `tensión ${vitals.systolic} ${vitals.diastolic}` : `blood pressure ${vitals.systolic} over ${vitals.diastolic}`);
  }
  return bits.join(', ');
}

module.exports = {
  COPY,
  localeBundle,
  wrapSpeak,
  medsLabel,
  mealLabel,
  companyLine,
  vitalsParts,
};
