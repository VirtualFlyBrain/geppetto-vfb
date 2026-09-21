/*
 * Per-term page metadata for search engines and link previews.
 *
 * Googlebot's renderer does not hold a WebSocket open, so everything the
 * viewer loads through Geppetto is invisible to it: a term URL rendered as an
 * empty shell with the home page's title and canonical, which Search Console
 * reported as a soft 404. VFBquery serves the same term info over plain HTTPS,
 * which the renderer does fetch, so the title, description, canonical, JSON-LD
 * and a text summary of the term are filled in from that instead. Nothing here
 * touches the socket or the Geppetto model, and every failure leaves the
 * site-wide defaults in place.
 */

var TERM_INFO_API = 'https://v3-cached.virtualflybrain.org/get_term_info?id=';
// /reports/<id> is the stable public address of a term; it forwards to the viewer.
var REPORTS_BASE = 'https://virtualflybrain.org/reports/';
var SITE_NAME = 'Virtual Fly Brain';
var CONTENT_ID = 'content';
var TERM_JSONLD_ID = 'termMetaDesc';
var MAX_DESCRIPTION = 300;
var MAX_LIST = 25;

var ID_PATTERN = /^[A-Za-z][A-Za-z0-9]*_[A-Za-z0-9_]+$/;
var MARKDOWN_LINK = /\[([^\]]*)\]\(([^)\s]*)\)/g;

var termInfoCache = {};
var defaults = null;
var latestRequest = 0;

export function isTermId (id) {
  return typeof id === 'string' && id.length < 100 && ID_PATTERN.test(id);
}

export function reportUrl (id) {
  return REPORTS_BASE + encodeURIComponent(id);
}

/* The focus term of a viewer URL: id=<id>. i=<a,b,c> only lists what is loaded, so it is ignored. */
export function getFocusIdFromSearch (search) {
  var query = (search || '').replace(/^\?/, '').split('&');
  var params = {};
  query.forEach(function (pair) {
    var at = pair.indexOf('=');
    if (at > 0) {
      try {
        params[pair.substring(0, at)] = decodeURIComponent(pair.substring(at + 1));
      } catch (ignore) { }
    }
  });
  if (!params.id) {
    return null;
  }
  var id = params.id.split(',')[0].trim();
  return isTermId(id) ? id : null;
}

/* "[medulla](FBbt_00003748) is ..." -> "medulla is ...", whitespace collapsed. */
export function stripMarkdown (text) {
  if (typeof text !== 'string') {
    return '';
  }
  return text.replace(MARKDOWN_LINK, '$1').replace(/[*`]/g, '').replace(/\s+/g, ' ').trim();
}

function truncate (text, max) {
  if (text.length <= max) {
    return text;
  }
  var cut = text.substring(0, max - 1);
  var space = cut.lastIndexOf(' ');
  return (space > max * 0.6 ? cut.substring(0, space) : cut) + '…';
}

function firstThumbnail (info) {
  var sources = [info.Images, info.Examples];
  for (var s = 0; s < sources.length; s++) {
    var group = sources[s];
    if (group && typeof group === 'object') {
      var keys = Object.keys(group);
      for (var k = 0; k < keys.length; k++) {
        var list = group[keys[k]];
        if (Array.isArray(list) && list.length && list[0] && list[0].thumbnail) {
          return list[0].thumbnail;
        }
      }
    }
  }
  return null;
}

function kindOf (info) {
  if (info.IsTemplate) {
    return 'template';
  }
  if (info.IsIndividual) {
    return 'image';
  }
  if (info.IsClass) {
    return 'class';
  }
  return 'term';
}

export function buildDescription (info) {
  var meta = info.Meta || {};
  var parts = [];
  var description = stripMarkdown(meta.Description);
  if (description) {
    parts.push(description);
  }
  var types = stripMarkdown((meta.Types || '').replace(/;/g, ','));
  if (types && info.IsIndividual) {
    parts.push(info.Name + ' is an instance of ' + types + '.');
  }
  if (!description) {
    var comment = stripMarkdown(meta.Comment);
    if (comment) {
      parts.push(comment + '.');
    }
    if (Array.isArray(info.Technique) && info.Technique.length) {
      parts.push('Imaged by ' + info.Technique.join(', ') + '.');
    }
    if (!parts.length && Array.isArray(info.Tags) && info.Tags.length) {
      parts.push(info.Name + ' (' + info.Tags.join(', ').replace(/_/g, ' ') + ').');
    }
    parts.push('View the 3D image, annotations and queries for this ' + kindOf(info) + ' on ' + SITE_NAME + '.');
  }
  return truncate(parts.join(' '), MAX_DESCRIPTION);
}

export function buildTitle (info) {
  return info.Name + ' [' + info.Id + '] - ' + SITE_NAME;
}

export function buildJsonLd (info) {
  var url = reportUrl(info.Id);
  var data = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    '@id': url,
    'url': url,
    'name': info.Name,
    'termCode': info.Id,
    'identifier': info.Id,
    'description': buildDescription(info),
    'inDefinedTermSet': {
      '@type': 'DefinedTermSet',
      'name': SITE_NAME,
      'url': 'https://virtualflybrain.org'
    }
  };
  if (Array.isArray(info.Synonyms)) {
    var names = [];
    info.Synonyms.forEach(function (synonym) {
      if (synonym && synonym.label && names.indexOf(synonym.label) < 0) {
        names.push(synonym.label);
      }
    });
    if (names.length) {
      data.alternateName = names.slice(0, MAX_LIST);
    }
  }
  var image = firstThumbnail(info);
  if (image) {
    data.image = image;
  }
  if (Array.isArray(info.Tags) && info.Tags.length) {
    data.keywords = info.Tags.join(', ').replace(/_/g, ' ');
  }
  return data;
}

function setMeta (selector, value) {
  var node = document.querySelector(selector);
  if (node) {
    node.setAttribute('content', value);
  }
}

function setCanonical (href) {
  var link = document.querySelector("link[rel='canonical']");
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

function rememberDefaults () {
  if (defaults) {
    return;
  }
  var read = function (selector) {
    var node = document.querySelector(selector);
    return node ? node.getAttribute('content') : null;
  };
  var canonical = document.querySelector("link[rel='canonical']");
  defaults = {
    title: document.title,
    description: read('meta[name="description"]'),
    ogUrl: read('meta[property="og:url"]'),
    ogImage: read('meta[property="og:image"]'),
    canonical: canonical ? canonical.getAttribute('href') : null
  };
}

/* Markdown with [label](target) links -> DOM nodes; VFB ids link to their report page. */
function appendMarkdown (parent, text) {
  var last = 0;
  var match;
  MARKDOWN_LINK.lastIndex = 0;
  while ((match = MARKDOWN_LINK.exec(text)) !== null) {
    if (match.index > last) {
      parent.appendChild(document.createTextNode(text.substring(last, match.index)));
    }
    var target = match[2];
    var href = isTermId(target) ? reportUrl(target) : (/^https?:\/\//.test(target) ? target : null);
    if (href && match[1]) {
      var anchor = document.createElement('a');
      anchor.setAttribute('href', href);
      anchor.textContent = match[1];
      parent.appendChild(anchor);
    } else {
      parent.appendChild(document.createTextNode(match[1]));
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) {
    parent.appendChild(document.createTextNode(text.substring(last)));
  }
}

function addSection (container, heading, lines) {
  lines = lines.filter(function (line) {
    return typeof line === 'string' && line.trim();
  }).slice(0, MAX_LIST);
  if (!lines.length) {
    return;
  }
  var title = document.createElement('h2');
  title.textContent = heading;
  container.appendChild(title);
  var list = document.createElement('ul');
  lines.forEach(function (line) {
    var item = document.createElement('li');
    appendMarkdown(item, line.trim());
    list.appendChild(item);
  });
  container.appendChild(list);
}

/*
 * The text summary of the term. The viewer fills the whole window, so this is
 * kept out of the layout with the usual visually-hidden pattern: crawlers and
 * screen readers read it, sighted users get the Term Info panel instead.
 */
export function renderSummary (info) {
  var container = document.getElementById(CONTENT_ID);
  if (!container) {
    container = document.createElement('div');
    container.id = CONTENT_ID;
    document.body.insertBefore(container, document.body.firstChild);
  }
  container.style.cssText = 'position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
  if (!info) {
    return container;
  }
  var meta = info.Meta || {};
  var article = document.createElement('article');
  var heading = document.createElement('h1');
  heading.textContent = info.Name + ' [' + info.Id + ']';
  article.appendChild(heading);

  [meta.Description, meta.Comment].forEach(function (text) {
    if (typeof text === 'string' && text.trim()) {
      var paragraph = document.createElement('p');
      appendMarkdown(paragraph, text.replace(/\s+/g, ' ').trim());
      article.appendChild(paragraph);
    }
  });

  var image = firstThumbnail(info);
  if (image) {
    var picture = document.createElement('img');
    picture.setAttribute('src', image);
    picture.setAttribute('alt', info.Name + ' [' + info.Id + ']');
    picture.setAttribute('loading', 'lazy');
    article.appendChild(picture);
  }

  addSection(article, 'Types', (meta.Types || '').split(';'));
  addSection(article, 'Relationships', (meta.Relationships || '').split(';'));
  addSection(article, 'Synonyms', (info.Synonyms || []).map(function (synonym) {
    return synonym && synonym.label ? synonym.label : '';
  }).filter(function (label, index, all) {
    return all.indexOf(label) === index;
  }));
  addSection(article, 'Tags', (info.Tags || []).map(function (tag) {
    return String(tag).replace(/_/g, ' ');
  }));
  addSection(article, 'Queries', (info.Queries || []).map(function (query) {
    if (!query || !query.label) {
      return '';
    }
    return query.label + (typeof query.count === 'number' && query.count >= 0 ? ' (' + query.count + ')' : '');
  }));
  addSection(article, 'Imaging technique', info.Technique || []);
  addSection(article, 'Publications', (info.Publications || []).map(function (publication) {
    return publication && publication.title ? publication.title : '';
  }));
  addSection(article, 'Cross references', (info.Xrefs || []).map(function (xref) {
    if (!xref || !xref.label) {
      return '';
    }
    return xref.label + (xref.accession ? ' ' + xref.accession : '');
  }));

  container.appendChild(article);
  return container;
}

export function applyTermMetadata (info) {
  if (!info || !info.Id || !info.Name) {
    return false;
  }
  rememberDefaults();
  var title = buildTitle(info);
  var description = buildDescription(info);
  var url = reportUrl(info.Id);
  document.title = title;
  setMeta('meta[name="description"]', description);
  setMeta('meta[property="og:title"]', title);
  setMeta('meta[property="og:description"]', description);
  setMeta('meta[property="og:url"]', url);
  var image = firstThumbnail(info);
  if (image) {
    setMeta('meta[property="og:image"]', image);
  } else if (defaults.ogImage) {
    setMeta('meta[property="og:image"]', defaults.ogImage);
  }
  setCanonical(url);

  var script = document.getElementById(TERM_JSONLD_ID);
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = TERM_JSONLD_ID;
    document.head.appendChild(script);
  }
  // "<" cannot appear literally inside a script element.
  script.textContent = JSON.stringify(buildJsonLd(info)).replace(/</g, '\\u003c');

  renderSummary(info);
  return true;
}

/* Raw get_term_info for a term, memoised; resolves to null on any failure. */
export function fetchTermInfo (id) {
  if (!isTermId(id)) {
    return Promise.resolve(null);
  }
  if (termInfoCache[id] === undefined) {
    termInfoCache[id] = fetch(TERM_INFO_API + encodeURIComponent(id))
      .then(function (response) {
        return response.ok ? response.json() : null;
      })
      .then(function (info) {
        return (info && info.Id) ? info : null;
      })
      .catch(function () {
        delete termInfoCache[id];
        return null;
      });
  }
  return termInfoCache[id];
}

/*
 * Point the page at a term. The canonical only needs the id, so it is set at
 * once, before the fetch answers; the rest follows when it does. A later call
 * for a different term wins over a slower earlier one.
 */
export function updateTermPageMetadata (id) {
  if (!isTermId(id)) {
    return Promise.resolve(false);
  }
  rememberDefaults();
  var request = ++latestRequest;
  setCanonical(reportUrl(id));
  setMeta('meta[property="og:url"]', reportUrl(id));
  return fetchTermInfo(id).then(function (info) {
    if (request !== latestRequest || !info) {
      return false;
    }
    return applyTermMetadata(info);
  });
}

export function initTermPageMetadata (search) {
  // Clears the unreplaced "$content" template placeholder whether or not a term is given.
  renderSummary(null);
  var id = getFocusIdFromSearch(search);
  return id ? updateTermPageMetadata(id) : Promise.resolve(false);
}
