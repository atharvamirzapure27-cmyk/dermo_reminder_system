const templates = {
  reminder_3day: {
    english: 'Hello {name}, reminder for your dermatology appointment with {doctor} on {date} at {time}.',
    hindi: 'Namaste {name}, {date} ko {time} baje {doctor} ke sath aapki dermatology appointment ke liye reminder.',
    marathi: 'Namaskar {name}, {date} roji {time} vajta {doctor} sobat aaplya dermatology bhetisathi smaran.'
  },
  reminder_1day: {
    english: 'Hello {name}, this is a reminder for your upcoming dermatology appointment with {doctor} tomorrow, {date} at {time}.',
    hindi: 'Namaste {name}, kal {date} ko {time} baje {doctor} ke sath aapki dermatology appointment ke liye reminder.',
    marathi: 'Namaskar {name}, udya {date} roji {time} vajta {doctor} sobat aaplya dermatology bhetisathi smaran.'
  },
  reminder_same_day: {
    english: 'Hello {name}, reminder for your dermatology appointment with {doctor} today, {date} at {time}.',
    hindi: 'Namaste {name}, aaj {date} ko {time} baje {doctor} ke sath aapki dermatology appointment ke liye reminder.',
    marathi: 'Namaskar {name}, aaj {date} roji {time} vajta {doctor} sobat aaplya dermatology bhetisathi smaran.'
  },
  reminder_missed: {
    english: 'Hello {name}, you have missed your dermatology appointment on {date} with {doctor}. Please contact the dermatology department to reschedule.',
    hindi: 'Namaste {name}, aapki {date} ko {doctor} ke sath dermatology appointment chhoot gayi hai. Kripaya reschedule karne ke liye dermatology department se sampark karein.',
    marathi: 'Namaskar {name}, aapchi {date} roji {doctor} sobat dermatology bhet sutali aahe. Kripaya reschedule karnyasathi dermatology vibhagala bhet dya.'
  },
  reminder_7day_missed: {
    english: 'Hello {name}, you missed your dermatology appointment 7 days ago on {date} with {doctor}. Please contact the dermatology department to reschedule.',
    hindi: 'Namaste {name}, aapki 7 din pehle {date} ko {doctor} ke sath dermatology appointment chhoot gayi thi. Kripaya reschedule karne ke liye dermatology department se sampark karein.',
    marathi: 'Namaskar {name}, aapchi 7 divasampurvi {date} roji {doctor} sobat bhet chukli hoti. Kripaya reschedule karnyasathi dermatology vibhagala bhet dya.'
  }
};

const fillTemplate = (templateKey, language, placeholders) => {
  const templateGroup = templates[templateKey];
  if (!templateGroup) {
    throw new Error(`Template key '${templateKey}' not found.`);
  }

  const lang = String(language).toLowerCase();
  let templateText = templateGroup[lang] || templateGroup.english;

  for (const [key, value] of Object.entries(placeholders)) {
    templateText = templateText.replace(new RegExp(`{${key}}`, 'g'), value || '');
  }

  return templateText;
};

module.exports = {
  templates,
  fillTemplate
};
