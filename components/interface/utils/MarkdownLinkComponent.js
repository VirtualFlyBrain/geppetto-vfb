var React = require('react');

/**
 * MarkdownLinkComponent
 *
 * Renders a VFBquery result cell that contains one or more
 * `[label](short_form)` term-link markdown items. Multi-item cells
 * (e.g. the per-pub Reference column added in VFBquery v1.14.7, or the
 * per-chip Type column added in NeuronNeuron / NeuronRegion connectivity
 * queries) use `; ` between items; this component parses each one and
 * emits an individual clickable chip, semicolon-separating them in the
 * rendered output to match v2 prod styling.
 *
 * Replaces the legacy QueryLinkComponent + QueryLinkArrayComponent
 * pattern that relied on positional id-extraction from the row's
 * delimited id column (entityIndex / entityDelimiter / stringDelimiter
 * config in queryBuilderConfiguration.js). The packed-id approach was
 * brittle: column order, missing canonical slots, and per-query schema
 * shape all had to line up exactly with the entityIndex value baked
 * into queryBuilderConfiguration.js for the click to route to the right
 * term. This component parses the id directly out of each cell's
 * markdown, so it cannot misalign.
 *
 * REGEX SAFETY NOTES (per Robbie):
 *
 * Labels CAN contain `(`, `)`, `[`, `]` characters -- e.g.
 * "Wolff & Rubin, 2018, J. Comp. Neurol. 526(16): 2585--2611",
 * "antennal lobe (left)", "FBbt_[deprecated]", and so on.
 *
 * The id portion in `[label](id)` is always a VFB / FlyBase
 * short_form: `[A-Za-z0-9_-]+`. We exploit that constraint by
 * restricting the id capture group to `[^()[\]]+` -- anything BUT
 * parens or brackets. The regex engine then backtracks the label
 * capture (`(.*?)`) until the label/id boundary is consistent with
 * the id constraint, even when the label itself contains parens or
 * brackets.
 *
 * Examples that parse correctly:
 *   [adult brain (left)](FBbt_123)        -> label="adult brain (left)", id="FBbt_123"
 *   [antennal lobe [R]](FBbt_456)         -> label="antennal lobe [R]",  id="FBbt_456"
 *   [Wolff & Rubin, 2018, J. Comp. Neurol. 526(16): 2585--2611](FBrf0240744)
 *                                          -> label intact, id="FBrf0240744"
 *   [a](id1); [b](id2); [c with [bracket]](id3)
 *                                          -> three independent links
 *   "plain text no link"                  -> rendered as plain text
 *   ""                                    -> renders nothing
 *
 * Image markdown (`[![alt](url 'alt')](ref)`) is NOT handled here;
 * that path is owned by the Java VFBqueryJsonProcessor's image-wrapping
 * step and surfaced through SlideshowImageComponent for the Images
 * column. This component is for term-label-with-id cells only.
 *
 * CAVEAT: if a real VFB short_form ever contains `(`, `)`, `[` or `]`,
 * the id-character-class needs widening and the label/id boundary
 * needs a different disambiguator. Current pdb data has no such ids.
 */
var TERM_LINK = /\[(.*?)\]\(([^()[\]]+)\)/g;

/*
 * Internal VFB / FlyBase short_form: word characters and hyphen only
 * (e.g. VFB_00101567, FBbt_00003624, SplitShuai2023). Only ids matching
 * this get a clickable chip wired to addVfbId. Anything else -- most
 * importantly an external URL leaking through from an unmapped column
 * (e.g. the Janelia split-GAL4 imagery link) -- is rendered as its plain
 * label with no link, so we never call addVfbId with a non-VFB target or
 * surface an external hyperlink straight from cell data.
 */
var INTERNAL_ID = /^[A-Za-z0-9_-]+$/;

function parseTermLinks (value) {
  if (typeof value !== 'string' || !value) {
    return [];
  }
  var out = [];
  var m;
  TERM_LINK.lastIndex = 0;
  while ((m = TERM_LINK.exec(value)) !== null) {
    out.push({ label: m[1], id: m[2] });
  }
  return out;
}

function MarkdownLinkComponent (props) {
  /*
   * Geppetto's query-results griddle passes the cell value as `data`
   * (alongside `rowData` / `metadata`) -- the same prop the legacy
   * QueryLinkComponent / QueryLinkArrayComponent read. It is NOT
   * `value` (that is the newer griddle Cell contract used by the
   * term-info side panel). Reading `value` here yields undefined, so
   * every term-link column renders nothing.
   */
  var value = props && props.data;
  var links = parseTermLinks(value);
  if (links.length === 0) {
    /*
     * Not parseable as a term link -- render the raw cell value as
     * plain text so we don't silently drop content. Covers numeric,
     * pipe-joined tag, empty cell, and any future schema additions.
     */
    return value ? React.createElement('span', null, value) : null;
  }
  return React.createElement(
    'span',
    { className: 'markdown-link-cell' },
    links.map(function (link, i) {
      var sep = i < links.length - 1 ? '; ' : null;
      if (!INTERNAL_ID.test(link.id)) {
        /*
         * Non-VFB target (external URL or otherwise non-short_form id):
         * render the label as plain text, no link.
         */
        return React.createElement(React.Fragment, { key: i }, link.label, sep);
      }
      return React.createElement(
        React.Fragment,
        { key: i },
        React.createElement(
          'a',
          {
            href: '#',
            'data-instancepath': link.id,
            onClick: function (e) {
              e.preventDefault();
              if (typeof window !== 'undefined' && typeof window.addVfbId === 'function') {
                window.addVfbId(link.id);
              }
            }
          },
          link.label
        ),
        sep
      );
    })
  );
}

module.exports = MarkdownLinkComponent;
