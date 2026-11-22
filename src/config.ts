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
    // Ito yung mga actual highlights mo (personal photos)
    photos: [
      'https://lh3.googleusercontent.com/d/1ByDU3H0QTwi1IoNqcMKI_tkNQmt9yhwC',
      'https://lh3.googleusercontent.com/d/1CcDfXWJEfwcv2iyGLpOFtMfnaLdDgElA',
      'https://lh3.googleusercontent.com/d/1N2Vew-jeH_n2x4Q4ruPuiiSYmL46XcY8',
      'https://lh3.googleusercontent.com/d/1zfnnfMoeXfn_lN8C28dSCRyPcXVwEWaf',
      'https://drive.google.com/thumbnail?id=1Oeuptoq0KiUny4CkmlgfPgWx6oG7ZZCr&sz=w1000' 
    ],
    // Ito yung mga random images para sa BrandLyft-style carousel
    carouselPhotos: [
      '/images/random1.jpeg',
      '/images/random2.png',
      '/images/random3.png',    // <-- Inaayos (png)
      '/images/random4.png',
      '/images/random5.jpeg',
      '/images/random6.png',
      '/images/random7.png',    // <-- Inayos (jpg)
      '/images/random8.jpeg',   // <-- Inayos (jpeg)
      '/images/random9.png',    // <-- Inayos (png)
      '/images/random10.jpeg',  // <-- Inayos (jpeg)
      '/images/random11.png',   // <-- Inayos (png)
    ],
    backgroundVideo: 'mp4/MSD BACKGROUND VIDEO (1).mp4', // <-- Inayos para tumuro sa public/mp4
    startVideo: 'mp4/MSD BACKGROUND VIDEO (1).mp4',
  music: [
    {
      title: 'Libu-Libong Buwan',
      src: ['/mp3/Libu-Libong Buwan (Uuwian) - Kyle Raphael (Lyric Video)(M4A_128K) (1).mp3'], // <-- Tinuturo na sa public/mp3 folder
    },
    {
      title: 'No Punctuation',
      src: ['/mp3/beabadoobee - No Punctuation (Official Lyric Video(M4A_128K) (1).mp3'],
    },
    {
      title: 'Coming Up Roses',
      src: ['/mp3/Harry Styles - Coming Up Roses (Official Video)(M4A_128K) (1).mp3'],
    },
  ],
}
