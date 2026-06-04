/* ============================================================================
 * <ui-chart> — inline-SVG chart (MD3 ships none).
 *
 * Attributes:
 *   type      "bar" (default) | "line" | "area"
 *   values    comma-separated numbers as fallback (e.g. "12,45,30,60")
 *   label     accessible chart label (aria-label)
 *
 * Properties:
 *   .data     array of numbers OR array of {label, value}
 *
 * Renders a responsive inline SVG with:
 *   - bars / line / area filled with --ui-sys-primary
 *   - grid lines --ui-sys-outline-subtle
 *   - axis labels --ui-sys-font-caption + --ui-sys-on-surface-muted
 *
 * Accessible: role=img, aria-label summarizing the series.
 *
 * If no .data is set on connect, seeds sample data so gallery renders.
 * ==========================================================================*/

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: block;
      width: 100%;
    }
    svg {
      display: block;
      width: 100%;
      height: auto;
      overflow: visible;
    }
  </style>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    part="svg"
    viewBox="0 0 400 200"
    preserveAspectRatio="xMidYMid meet"
  ></svg>
`;

const SAMPLE_DATA = [
  { label: 'Jan', value: 42 },
  { label: 'Feb', value: 68 },
  { label: 'Mar', value: 55 },
  { label: 'Apr', value: 81 },
  { label: 'May', value: 37 },
  { label: 'Jun', value: 73 },
];

/* resolve CSS variable in context of an element */
function resolveToken(el, token) {
  return getComputedStyle(el).getPropertyValue(token).trim();
}

class UiChart extends HTMLElement {
  static observedAttributes = ['type', 'values', 'label'];

  #data = null;
  #svg;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
    this.#svg = this.shadowRoot.querySelector('svg');
  }

  connectedCallback() {
    if (this.#data === null) {
      // Seed from `values` attr first, then sample data.
      const attr = this.getAttribute('values');
      if (attr) {
        this.#data = attr.split(',').map(v => ({ label: '', value: parseFloat(v.trim()) || 0 }));
      } else {
        this.#data = SAMPLE_DATA;
      }
    }
    this.#render();
  }

  attributeChangedCallback(name) {
    if (name === 'values' && this.isConnected) {
      const attr = this.getAttribute('values');
      if (attr) {
        this.#data = attr.split(',').map(v => ({ label: '', value: parseFloat(v.trim()) || 0 }));
        this.#render();
      }
    } else if (this.isConnected) {
      this.#render();
    }
  }

  get data() { return this.#data; }
  set data(val) {
    if (!Array.isArray(val)) return;
    this.#data = val.map(v =>
      typeof v === 'object' && v !== null
        ? { label: String(v.label ?? ''), value: Number(v.value ?? 0) }
        : { label: '', value: Number(v) || 0 }
    );
    if (this.isConnected) this.#render();
  }

  #render() {
    const points = this.#data || [];
    if (points.length === 0) return;

    const type  = this.getAttribute('type') || 'bar';
    const W     = 400;
    const H     = 200;
    const padT  = 12;
    const padR  = 12;
    const padB  = 28; // room for x-axis labels
    const padL  = 36; // room for y-axis labels

    const chartW = W - padL - padR;
    const chartH = H - padT - padB;

    const values = points.map(p => p.value);
    const maxVal = Math.max(...values, 1);
    const minVal = 0; // always start at 0

    // ---- read tokens (CSS variables resolve against the host) ----
    const primary         = resolveToken(this, '--ui-sys-primary')            || '#666361';
    const outlineSubtle   = resolveToken(this, '--ui-sys-outline-subtle')     || '#F0EEE6';
    const onSurfaceMuted  = resolveToken(this, '--ui-sys-on-surface-muted')   || '#ABA9A4';
    const fontCaption     = resolveToken(this, '--ui-sys-font-caption')       || '400 12px/1.35 Inter,sans-serif';

    // parse font-caption for font-size / font-family
    const fontSizeMatch = fontCaption.match(/\d+px/);
    const fontSize = fontSizeMatch ? fontSizeMatch[0] : '12px';
    const fontFamily = fontCaption.split('/').pop()?.trim() || 'Inter,sans-serif';

    // ---- coordinate helpers ----
    const xOf = (i) => padL + (i + 0.5) * (chartW / points.length);
    const yOf = (v) => padT + chartH - (v / maxVal) * chartH;

    // ---- grid lines (5 horizontal) ----
    const gridLines = [];
    const gridCount = 4;
    for (let g = 0; g <= gridCount; g++) {
      const gv = (maxVal * g) / gridCount;
      const gy = yOf(gv);
      gridLines.push(
        `<line x1="${padL}" y1="${gy}" x2="${padL + chartW}" y2="${gy}" stroke="${outlineSubtle}" stroke-width="1" />`
      );
      // y-axis labels
      const label = Math.round(gv).toString();
      gridLines.push(
        `<text x="${padL - 4}" y="${gy + 4}" text-anchor="end" font-size="${fontSize}" font-family="${fontFamily}" fill="${onSurfaceMuted}">${label}</text>`
      );
    }

    // ---- series geometry ----
    let seriesMarkup = '';
    const barPad = 0.25;

    if (type === 'bar') {
      const bw = (chartW / points.length) * (1 - barPad);
      const series = points.map((p, i) => {
        const bx = padL + i * (chartW / points.length) + (chartW / points.length) * (barPad / 2);
        const by = yOf(p.value);
        const bh = (p.value / maxVal) * chartH;
        return `<rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" fill="${primary}" rx="2" />`;
      }).join('');
      seriesMarkup = series;
    } else {
      // line / area — build path
      const pts = points.map((p, i) => `${xOf(i).toFixed(1)},${yOf(p.value).toFixed(1)}`).join(' L ');
      const first = `${xOf(0).toFixed(1)},${yOf(points[0].value).toFixed(1)}`;
      const last  = `${xOf(points.length - 1).toFixed(1)},${yOf(points[points.length - 1].value).toFixed(1)}`;
      const baseline = (padT + chartH).toFixed(1);

      if (type === 'area') {
        const areaPath = `M ${xOf(0).toFixed(1)},${baseline} L ${pts} L ${xOf(points.length-1).toFixed(1)},${baseline} Z`;
        seriesMarkup += `<path d="${areaPath}" fill="${primary}" opacity="0.18" />`;
      }
      seriesMarkup += `<polyline points="${first} L ${pts}" fill="none" stroke="${primary}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />`;
      // dots
      seriesMarkup += points.map((p, i) =>
        `<circle cx="${xOf(i).toFixed(1)}" cy="${yOf(p.value).toFixed(1)}" r="3" fill="${primary}" />`
      ).join('');
    }

    // ---- x-axis labels ----
    const xLabels = points.map((p, i) =>
      p.label
        ? `<text x="${xOf(i).toFixed(1)}" y="${(padT + chartH + 16).toFixed(1)}" text-anchor="middle" font-size="${fontSize}" font-family="${fontFamily}" fill="${onSurfaceMuted}">${p.label}</text>`
        : ''
    ).join('');

    // ---- aria label ----
    const ariaLabel = this.getAttribute('label') ||
      `${type} chart with ${points.length} data points. Values: ${values.join(', ')}.`;

    this.#svg.setAttribute('aria-label', ariaLabel);
    this.#svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

    this.#svg.innerHTML = `
      <desc>${ariaLabel}</desc>
      <g class="grid">${gridLines.join('')}</g>
      <g class="series">${seriesMarkup}</g>
      <g class="x-labels">${xLabels}</g>
      <line x1="${padL}" y1="${padT}" x2="${padL}" y2="${padT + chartH}" stroke="${outlineSubtle}" stroke-width="1"/>
      <line x1="${padL}" y1="${padT + chartH}" x2="${padL + chartW}" y2="${padT + chartH}" stroke="${outlineSubtle}" stroke-width="1"/>
    `;
  }
}

if (!customElements.get('ui-chart')) {
  customElements.define('ui-chart', UiChart);
}
