// src/config.ts
// Everything you might want to edit (names, texts, songs, photos) lives here.
import type { AppConfig } from './types';

export const CONFIG: AppConfig = {
  herName: 'Chichi, My Mutya',
  startDate: '2024-12-21',
  littleThings: [
    'i love how you smile at me  ',
    "i like it when you're looking at me with a curios face",
    "i love how soft hearted you are you are the most genuine person i've meet it didn't through time",
    "i love how you still show up to me even when you're busy",
    'i love it when nag bibiruan tayo and the random laughter pag nag video calls tayo',
  ],
  letter: `Hi Chichii,

Happy 23rd monthsary, Chichii my mutya. i really love you so much. I'm so proud of you because you worked hard for that crown and you truly earned every bit of it.
Thank you for being my partner and my biggest inspiration. You'll always be my favorite person. Honestly, if you told me to explain how i see you and how i feel about you, I wouldn't know where to start. Simple words aren't enough to describe your beauty, and there are no words big enough to capture what i feel for you. I will always be your biggest fan. I love you so much chichi, and i feel the luckiest person to have met you.

I love you, today and always.

— EL`,
  photos: [], // e.g. ['images/1.jpg', 'images/2.jpg']
  backgroundVideo: 'background.mp4', // put the file in /public
  // Put song1, song2, song3 in /public (use their real ending: .m4a or .mp3).
  // src lists the file names to try in order. drive is only a backup. Use [] for no music.
  music: [
    {
      title: 'Libu-Libong Buwan',
      src: ['song1.m4a', 'song1.mp3'],
      drive: 'https://drive.google.com/file/d/1BljC58MO-3mEO1MWOIEvJd01khsf1yr1/view?usp=drive_link',
    },
    {
      title: 'No Punctuation',
      src: ['song2.m4a', 'song2.mp3'],
      drive: 'https://drive.google.com/file/d/1hwKdU2Bg2KhMS6U8WgDG7mqF6jLE0YMv/view?usp=drive_link',
    },
    {
      title: 'Coming Up Roses',
      src: ['song3.m4a', 'song3.mp3'],
      drive: 'https://drive.google.com/file/d/1sBQsSqbJ5iv7sTlfN_WMp8rJ_b6QJ8rh/view?usp=drive_link',
    },
  ],
};
