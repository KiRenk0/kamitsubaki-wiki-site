import catalog from '../data/supportCatalog.generated.json' with {type:'json'};
export {catalog as supportCatalog};
export const supportTier=id=>catalog.tiers.find(tier=>tier.id===id);
// Only the verified profile URL can reuse its generated QR. An edited channel remains authoritative.
export function withSupportQr(channel){return channel.id==='afdian'&&channel.url===catalog.source&&channel.qrImageUrl===undefined?{...channel,qrImageUrl:'https://kamitsubaki.wiki/support-qr/afdian.svg'}:channel;}
