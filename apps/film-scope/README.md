# film-scope

A catalog of films and shows built around the filters other sites don't give you:
exclusions ("every country **except** …"), multi-genre AND/OR, cast include _and_
exclude, age certification, and an honest "best of" ranking.

Nothing is hosted or streamed here — this is a metadata search engine that links out.

## Running it

```bash
pnpm dev --filter=film-scope   # http://localhost:3020
```

**No TMDB token is required to develop.** With `TMDB_ACCESS_TOKEN` empty the app
serves `lib/tmdb/__fixtures__/catalog.json` — 46 invented titles — through the exact
same filter, ranking and post-filter code as production. A permanent banner marks the
data as fake. Copy `.env.example` to `.env` and paste a token to switch to live TMDB;
no other line changes.

Get a token at themoviedb.org → Settings → API → **Developer** (instant approval).
Use the long **API Read Access Token (v4)**, not the short v3 key.

## The filter model

Every filter is one of exactly two shapes, so nothing is a special case:

- **Set** — include / exclude / match-any-or-all. One click requires a value, a second
  forbids it, a third clears it. Genres, keywords, studios, cast, crew, countries,
  languages, streaming services.
- **Range** — min / max plus any number of excluded bands, so "1980–2026 but not
  1990–2019" sits in the same control as a plain minimum. Year, runtime, score, votes.

Animation is the one deliberate exception to "a genre is just a genre". TMDB tags it as
genre 16, but people reach for it as a _type_ — every catalog in this market lists
Films / Series / Cartoons side by side — so it gets its own control next to the media
type. It also needs its own query field rather than riding along in `genres`, because
it must always AND with the selected genres and `with_genres` takes a single separator:
"(family OR comedy) AND animation" is inexpressible upstream. We fold it into the
request when the genre mode already allows it and post-filter otherwise, which is exact
since genre ids are in every list payload.

Exclusion is offered **only where it can actually be delivered** — either TMDB has a
`without_*` parameter, or the field is in the list payload (or cheaply resolvable) so
our post-filter is exact. TV status and TV kind are include-only and say so in the UI,
because TMDB has no exclusion for them and they are absent from list payloads. Age
certification is a ladder range, because `certification.gte/.lte` is the most TMDB can
honestly express — and it is films-only, since `/discover/tv` has no certification
filter at all.

## Why there is an API layer

TMDB `/discover` cannot express several things this product exists for. Verified
against the TMDB reference, Aug 2026:

| Needed                      | TMDB                              | Handled by                  |
| --------------------------- | --------------------------------- | --------------------------- |
| Exclude countries           | no `without_origin_country`       | `lib/filters/postFilter.ts` |
| Exclude original languages  | no `without_original_language`    | `lib/filters/postFilter.ts` |
| Exclude a person            | —                                 | person filmography → id set |
| Carve a band out of a range | —                                 | `lib/filters/postFilter.ts` |
| Honest "best" ordering      | `vote_average` has no vote floor  | `lib/filters/score.ts`      |
| Cast filter on TV           | `/discover/tv` has no `with_cast` | `/person/{id}/tv_credits`   |

Exclusions TMDB _does_ support go upstream where they belong: `without_genres`,
`without_keywords`, `without_companies`, `without_watch_providers`, and the
`vote_count.lte` / `vote_average.lte` upper bounds.

So the browser never calls TMDB. It calls us:

- `GET /api/discover` — the whole filter contract as query params
- `GET /api/title/{movie|tv}/{id}` — full details
- `GET /api/config` — genres, countries, languages, providers
- `GET /api/search?kind=person|keyword|company&q=` — autocomplete; `&ids=1,2` resolves
  ids back to names so a shared link shows "Keanu Reeves", not "#6384"

```bash
# Best family films of the last 5 years, nothing Japanese, real vote floor
curl 'http://localhost:3020/api/discover?type=movie&genres.include=10751,16&year.min=2021&certification.max=PG&countries.exclude=JP&rating.votes.min=200&sort.by=score'

# Films starring BOTH of two actors
curl 'http://localhost:3020/api/discover?cast.include=31,12898&cast.mode=all&sort.by=score'

# Rated 6–7, from 1980 on, skipping 1990–2019 entirely
curl 'http://localhost:3020/api/discover?rating.value.min=6&rating.value.max=7&year.min=1980&year.exclude=1990-2019'
```

## The ranking

`WR = (v / (v + m)) * R + (m / (v + m)) * C` — the same Bayesian weighting IMDb uses
for its Top 250. `m` is the votes threshold (user-controlled, floored at 50 so the
prior never vanishes), `C` the catalog mean. A title rated 8.4 on 910 votes correctly
lands _below_ one rated 8.2 on 3,100.

`rating.source` accepts `tmdb`, `imdb` or `mixed`. **IMDb returns TMDB today** — see
Stage 2 — and `/api/discover` reports which source it actually used in `ratingSource`.

## Layout

```
lib/filters/   the contract: schema (+ URL codec), score, post-filters, presets
lib/tmdb/      client, discover orchestration, details, config, search, fixtures
lib/i18n/      next-intl routing; en (default) / uk / ru, negotiated from the browser
app/[locale]/  catalog + title pages (server components)
app/api/       the public endpoints above
components/    filter controls (client, URL-driven) and presentation
```

`lib/filters/` imports nothing from `app/` or React on purpose: it moves to
`packages/film-scope-core` verbatim when the browser extension lands, so the extension
and the site share one filter definition.

All filter state lives in the URL — every search is shareable and survives a reload. An
active-filter bar above the results lists every constraint currently narrowing them, each
removable on its own; it is the only view of that on a phone, where the panel is collapsed.

Picking is explicit rather than cyclic. An earlier version cycled a chip
off -> include -> exclude on repeated clicks, which was compact and unguessable: nothing
said a second click meant "exclude", and undoing one meant clicking a third time. Each set
control now carries a visible add / exclude mode, so a click is one known action and
clicking the same chip again undoes it.

Origin also offers region groups — Western, Europe, Asia, India, Latin America, CIS —
because that intent is usually a bloc, not a country: "nothing from over there" should not
mean ticking ten boxes. A group writes into the same country lists the picker edits, so it
is a shortcut and never a separate source of truth, and the showcase collapses a
fully-applied group back into a single chip.

## Paging

Page size is 20 / 40 / 60 / 100, every value a multiple of TMDB's fixed 20, so one of our
pages maps onto a whole run of upstream pages — paging stays seamless and never repeats or
skips a title. Changing the size returns to page 1, since "page 3" means something
different afterwards.

## Stage 1 limitations (by design)

TMDB can't sort by our score, so when re-ranking is needed we pull a 300-candidate
window (15 requests), filter and rank it locally. Ordering is exact at the top of the
list but `approximate: true` is returned and surfaced in the UI. The window is a constant:
sizing it by page depth made each page rank a different set (titles drifted between pages
and the page count moved), and sizing it by page size made switching 20 -> 100 quietly
change which films ranked where. Country exclusion also
costs one details request per surviving candidate, capped at 150, because TMDB omits
`origin_country` from movie list payloads.

## Stage 2

Ingest the free daily IMDb TSV dumps (`title.ratings`, ~1.5M rows, no quota,
**non-commercial licence**) into the existing Neon Postgres, filtered to
`numVotes >= 100`. `/api/discover` then answers from SQL: exact sorting by any rating
source, exclusions for free, no candidate window. **The API contract and the entire UI
stay unchanged** — only the resolver behind `discover()` is swapped, and
`IMDB_INDEX_AVAILABLE` in `lib/tmdb/discover.ts` flips to `true`.

## Attribution

This product uses the TMDB API but is not endorsed or certified by TMDB.
