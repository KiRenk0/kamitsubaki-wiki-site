import { Fragment } from 'react';
import { ArrowUpRight, Globe } from 'lucide-react';
import type { entityInfoModel } from '../../../../src/lib/entityInfoModel.mjs';

type Info = ReturnType<typeof entityInfoModel>;
const publicHref = (value: string) => value.startsWith('/') ? 'https://kamitsubaki.wiki' + value : value;
function Facts({ facts }: { facts: Info['coreFacts'] }) {
  return <dl className="entity-info-facts">{facts.map(fact => <div key={fact.key}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl>;
}
export function ReaderInfoBox({ model }: { model: Info }) {
  const { copy } = model;
  return <section className="wiki-infobox entity-info" data-card-kind="entity" data-entity-type={model.type} data-placeholder={model.artwork.placeholder || undefined} aria-label={copy.card}>
    <header><small>{copy.card} / {model.typeLabel}</small><h2>{model.title}</h2>{model.romanized ? <p className="info-romanized">{model.romanized}</p> : null}{model.artists.length ? <p className="info-artists">{model.artists.map((artist, index) => <Fragment key={artist.id}>{index > 0 ? ' / ' : null}<a href={publicHref(artist.url)} target="_blank" rel="noopener noreferrer">{artist.title}</a></Fragment>)}</p> : null}</header>
    {model.showArtwork ? <figure><img src={model.artwork.src} alt={model.artwork.placeholder ? '' : model.title} loading="lazy" decoding="async" /></figure> : null}
    <div className="entity-info-body"><Facts facts={model.coreFacts} />{model.hasMore ? <details className="entity-info-more" open={!model.kind || undefined}><summary>{copy.more}</summary><div className="entity-info-more-body">
      {model.extraFacts.length ? <Facts facts={model.extraFacts} /> : null}
      {model.affiliations.length ? <section><h3>{copy.affiliations}</h3>{model.affiliations.map((affiliation, index) => <div key={index}><a className="info-relation" href={publicHref(affiliation.url)} target="_blank" rel="noopener noreferrer">{affiliation.title}{affiliation.historical ? <small>{affiliation.historicalLabel}</small> : null}</a>{affiliation.dates ? <small className="info-relation-date">{affiliation.dates}</small> : null}</div>)}</section> : null}
      {model.credits.length ? <section id="entry-credits"><h3>{copy.credits}</h3><dl className="entity-info-credits">{model.credits.map((credit, index) => <div className="info-credit" key={index}><dt>{credit.role}</dt><dd>{credit.url ? <a href={publicHref(credit.url)} target="_blank" rel="noopener noreferrer">{credit.title}</a> : <span>{credit.title}</span>}</dd></div>)}</dl></section> : null}
      {model.links.length ? <section><h3>{copy.links}</h3><div className="info-links">{model.links.map((link, index) => <a className="external-link-card external-link-card--compact" href={publicHref(link.url)} target="_blank" rel="noopener noreferrer" aria-label={link.label + ' — ' + link.platform.name} data-platform={link.platform.id} style={{ '--platform-color': link.platform.color } as React.CSSProperties} key={index}><span className="platform-icon" title={link.platform.name} aria-hidden="true">{link.platform.icon ? <svg viewBox="0 0 24 24" focusable="false"><path d={link.platform.icon} /></svg> : <Globe />}</span><span className="external-link-card__copy"><span className="external-link-card__label">{link.label}</span><span className="external-link-card__platform">{link.platform.name}</span></span><ArrowUpRight className="external-link-card__arrow" /></a>)}</div></section> : null}
      {model.palette.length ? <section><h3>{copy.theme}</h3><div className="theme-swatch-row">{model.palette.map((swatch: { value: string; label: string }, index: number) => <span key={index} title={swatch.label + ' ' + swatch.value}><i style={{ background: swatch.value }} aria-hidden="true" /><small>{swatch.label}</small></span>)}</div></section> : null}
    </div></details> : null}</div>
  </section>;
}
