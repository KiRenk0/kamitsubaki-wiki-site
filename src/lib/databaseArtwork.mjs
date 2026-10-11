export const DATABASE_PLACEHOLDER_IMAGE=Object.freeze({
  src:'/images/database-placeholder.svg',
  width:960,
  height:960,
});

// The existing harusaruhi-album-shingan entry confirms the same title,
// primary artist and 2021-10-06 release date as harusaruhi-shinkyu.
/** @type {Readonly<Partial<Record<string,string>>>} */
export const DATABASE_ARTWORK_FALLBACKS=Object.freeze({
  'harusaruhi-shinkyu':'/images/albums/harusaruhi/shingan.jpg',
});
