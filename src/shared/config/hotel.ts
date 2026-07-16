/** Datos institucionales del hotel (contacto, ubicación, redes). */
export const hotel = {
  name: 'Hotel Manuel Antonio Park',
  phone: '+506 2777-0000',
  email: 'info@manuelantoniopark.com',
  address: 'Puntarenas, Quepos, 60601, Costa Rica.',
  addressNote: 'A 200m de la entrada del Parque Nacional.',
  // Embed de Google Maps (sin API key) centrado en Manuel Antonio.
  mapEmbedUrl:
    'https://www.google.com/maps?q=Hotel+Manuel+Antonio+Park,+Quepos,+Costa+Rica&output=embed',
  social: {
    facebook: 'https://www.facebook.com/hotelmanuelantoniopark/',
    tripadvisor:
      'https://www.tripadvisor.es/Hotel_Review-g309274-d12143724-Reviews-Hotel_Manuel_Antonio_Park-Manuel_Antonio_Quepos_Province_of_Puntarenas.html',
  },
} as const
