// Map tab - 4×6 stakeholder map with draggable dots.
// Two-way: dragging a dot updates the underlying scores (scaled across team).
// Three visual variations driven by Tweaks: classic / halo / density.

function MapView({ stakeholders, scores, team, updateCoordForStakeholder, selectedId, setSelectedId, openDetail, tweaks, users }) {
  const D = window.STAKEHOLDER_DATA;
  const stageRef = useRef(null);
  const [dragging, setDragging] = useState(null); // { id, offsetX, offsetY }
  const [detailOpen, setDetailOpen] = useState(true);
  // history mode: when truthy, all dots vanish except the selected
  // stakeholder's current position, plus a dotted trail of past positions.
  const [historyMode, setHistoryMode] = useState(false);
  // When user clicks a dot, ensure detail column reopens and history mode
  // turns off (so they're not stuck in a single-stakeholder view).
  const wrapSelect = (id) => { setSelectedId(id); setDetailOpen(true); setHistoryMode(false); };

  // computed coords for every stakeholder
  const rows = stakeholders.map(s => {
    const { x, y } = D.weightedCoord(s.id, scores, team);
    return { ...s, _x: x, _y: y, _status: D.statusFor(x, y) };
  });

  // counts per cell for the badge
  const counts = useMemo(() => {
    const m = {};
    rows.forEach(r => {
      const c = (r._x < -5) ? 0 : (r._x < 0) ? 1 : (r._x < 5) ? 2 : 3;
      const ro = (r._y > 5) ? 0 : (r._y > 2.5) ? 1 : (r._y > 0) ? 2 : (r._y > -2.5) ? 3 : (r._y > -5) ? 4 : 5;
      const k = ro + "," + c;
      m[k] = (m[k] || 0) + 1;
    });
    return m;
  }, [rows]);

  // density heatmap: nicer cell shading scaled by counts
  const maxCount = Math.max(1, ...Object.values(counts));

  function onPointerDown(e, id) {
    if (!stageRef.current) return;
    e.preventDefault();
    wrapSelect(id);
    setDragging({ id });
  }

  useEffect(() => {
    if (!dragging) return;
    function move(e) {
      const layer = stageRef.current?.querySelector(".dots-layer");
      if (!layer) return;
      const rect = layer.getBoundingClientRect();
      let leftPct = ((e.clientX - rect.left) / rect.width) * 100;
      let topPct  = ((e.clientY - rect.top)  / rect.height) * 100;
      leftPct = Math.max(0, Math.min(100, leftPct));
      topPct  = Math.max(0, Math.min(100, topPct));
      const { x, y } = pctToCoord(leftPct, topPct);
      // round to .25 for stability
      const rx = Math.round(x * 4) / 4;
      const ry = Math.round(y * 4) / 4;
      updateCoordForStakeholder(dragging.id, rx, ry);
    }
    function up() { setDragging(null); }
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [dragging, updateCoordForStakeholder]);

  // style: "classic" | "halo" | "density"
  const style = tweaks.mapStyle;
  const showLabels = tweaks.showLabels;
  const showZoneLabels = tweaks.showZoneLabels;
  const dotSize = tweaks.dotSize;

  const selected = rows.find(r => r.id === selectedId);

  return (
    <div className={"map-wrap" + (detailOpen ? "" : " detail-closed")}>
      <div className="map-stage" ref={stageRef}>
        <div className="map-grid-area">
          {/* numeric y-axis ticks (10..-10), subtle, outside the grid */}
          <div className="map-yaxis-ticks">
            {[10, 7.5, 5, 2.5, 0, -2.5, -5, -7.5, -10].map(n => (
              <span key={n} className="map-ytick">{n}</span>
            ))}
          </div>
          {/* zone grid */}
          <div className="map-grid">
            {D.GRID.flatMap((row, r) =>
              row.map((status, c) => {
                const meta = D.STATUSES[status];
                const cnt = counts[r + "," + c] || 0;
                let bg = meta.color;
                if (style === "density") {
                  // dim cells with low counts; full color for the hottest
                  const t = cnt / maxCount;
                  bg = `color-mix(in oklch, ${meta.color} ${20 + t * 80}%, #F2EFE7)`;
                }
                return (
                  <div className="zone" key={r + "-" + c} style={{ background: bg, color: meta.text }}>
                    {showZoneLabels && <span className="zone-label">{status}</span>}
                    {cnt > 0 && <span className="zone-count">{cnt}</span>}
                  </div>
                );
              })
            )}
          </div>

          {/* axis lines */}
          <div className="axis-lines" />

          {/* dot layer */}
          <div className="dots-layer">
            {historyMode && selected && selected.history && selected.history.length > 0 && (
              <svg className="trail-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                {(() => {
                  const points = [...selected.history, { x: selected._x, y: selected._y }];
                  const path = points.map((p, i) => {
                    const cx = ((p.x + 10) / 20) * 100;
                    const cy = ((10 - p.y) / 20) * 100;
                    return `${i === 0 ? "M" : "L"}${cx},${cy}`;
                  }).join(" ");
                  return (
                    <path d={path}
                      stroke="var(--accent)"
                      strokeWidth="0.35"
                      strokeDasharray="1.2,1.2"
                      fill="none"
                      vectorEffect="non-scaling-stroke"
                    />
                  );
                })()}
              </svg>
            )}
            {historyMode && selected && (selected.history || []).map((h, i) => {
              const p = coordToPct(h.x, h.y);
              return (
                <div
                  key={"hist-" + i}
                  className="dot history-dot"
                  style={{ left: p.left, top: p.top }}
                  title={`${h.quarter}: (${h.x}, ${h.y})`}
                >
                  <div className="dot-inner" style={{
                    width: 14, height: 14,
                    background: "var(--paper)",
                    color: "var(--ink-3)",
                    borderColor: "var(--ink-mute)",
                    borderStyle: "dashed"
                  }}>
                    {""}
                  </div>
                  <div className="dot-label" style={{ background: "var(--paper)" }}>{h.quarter}</div>
                </div>
              );
            })}
            {(historyMode ? (selected ? [selected] : []) : rows).map(r => {
              const pos = coordToPct(r._x, r._y);
              const meta = D.STATUSES[r._status];
              const isSel = selectedId === r.id;
              const isDrag = dragging?.id === r.id;
              const initial = abbrev(r.name);
              return (
                <div
                  key={r.id}
                  className={"dot" + (isSel ? " selected" : "") + (isDrag ? " dragging" : "")}
                  style={{ left: pos.left, top: pos.top, color: meta.color }}
                  onPointerDown={(e) => onPointerDown(e, r.id)}
                  onDoubleClick={() => openDetail(r.id)}
                  title={`${r.name} · ${r._status} · (${r._x.toFixed(1)}, ${r._y.toFixed(1)})`}
                >
                  {style === "halo" && (
                    <div
                      className="dot-halo"
                      style={{ inset: -(dotSize * 0.8) + "px" }}
                    />
                  )}
                  <div
                    className="dot-inner"
                    style={{
                      width: dotSize + "px",
                      height: dotSize + "px",
                      background: meta.color,
                      color: meta.text,
                      borderColor: isSel ? "var(--accent)" : (meta.border || meta.text)
                    }}
                  >
                    {dotSize >= 22 ? initial : ""}
                  </div>
                  {(showLabels || isSel) && (
                    <div className="dot-label">{r.name}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* numeric x-axis ticks (-10..10), subtle, outside the grid */}
        <div className="map-xaxis-ticks">
          {Array.from({ length: 21 }, (_, i) => i - 10).map(n => (
            <span key={n} className="map-xtick">{n}</span>
          ))}
        </div>

        {/* under-stage legend strip */}
        <div className="map-axis-legend" style={{ marginTop: 14, width: "92%", maxWidth: 920, marginInline: "auto" }}>
          <span style={{ justifySelf: "start" }}><strong>←</strong> Works against you</span>
          <span style={{ justifySelf: "center" }}>
            <strong>↑</strong> Greater community influence&nbsp;&nbsp;·&nbsp;&nbsp;<strong>↓</strong> Less community influence
          </span>
          <span style={{ justifySelf: "end" }}>Works with you <strong>→</strong></span>
        </div>
      </div>

      {detailOpen ? (
        <MapDetail
          stakeholder={selected}
          onOpenFull={() => selected && openDetail(selected.id)}
          team={team}
          scores={scores}
          stakeholders={stakeholders}
          setSelectedId={wrapSelect}
          onClose={() => setDetailOpen(false)}
          users={users}
          historyMode={historyMode}
          onToggleHistory={() => setHistoryMode(h => !h)}
        />
      ) : (
        <button
          className="map-detail-reopen"
          onClick={() => setDetailOpen(true)}
          title="Reopen scorecard"
          aria-label="Open scorecard"
        >
          <Icon name="chevron-left" className="ico" />
        </button>
      )}
    </div>
  );
}

function MapDetail({ stakeholder, onOpenFull, team, scores, stakeholders, setSelectedId, onClose, users, historyMode, onToggleHistory }) {
  if (!stakeholder) {
    return (
      <div className="detail">
        <div className="detail-head-row">
          <strong style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-3)" }}>Scorecard</strong>
          <button className="btn btn-ghost" onClick={onClose} title="Hide scorecard panel" aria-label="Close"><Icon name="close" /></button>
        </div>
        <div style={{ padding: "30px 12px", textAlign: "center" }}>
          <div style={{ fontSize: 16, marginBottom: 4 }}>Scorecard</div>
          <div className="muted" style={{ fontSize: 12 }}>
            Click any dot on the map to see details, or drag a dot to move it.
          </div>
          <div style={{ marginTop: 20, fontSize: 11, color: "var(--ink-mute)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Recently scored
          </div>
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
            {stakeholders.slice(0, 6).map(s => (
              <button
                key={s.id}
                className="btn btn-ghost"
                style={{ justifyContent: "flex-start", textAlign: "left" }}
                onClick={() => setSelectedId(s.id)}
              >
                <span style={{ fontWeight: 500 }}>{s.name}</span>
                <span className="muted" style={{ marginLeft: 6 }}>- {s.type}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }
  const meta = window.STAKEHOLDER_DATA.STATUSES[stakeholder._status];
  return (
    <div className="detail">
      <div className="detail-head-row">
        <strong style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-3)" }}>Scorecard</strong>
        <button className="btn btn-ghost" onClick={onClose} title="Hide scorecard panel" aria-label="Close"><Icon name="close" /></button>
      </div>
      <h3>{window.displayName(stakeholder) || stakeholder.name}</h3>
      <div className="det-org">{stakeholder.org}</div>
      {stakeholder.url && (
        <div style={{ marginTop: -4, marginBottom: 8 }}>
          <a className="det-website" href={window.normalizeUrl(stakeholder.url)} target="_blank" rel="noopener noreferrer">
            Visit Website
          </a>
        </div>
      )}
      {stakeholder.history && stakeholder.history.length > 0 && (
        <button
          className={"map-history-btn" + (historyMode ? " active" : "")}
          onClick={onToggleHistory}
          title={historyMode ? "Exit history view" : "View this stakeholder's historic positions"}
        >
          <Icon name="clock" className="ico" />
          {historyMode ? "Exit history" : "Show history"}
        </button>
      )}
      <div className="status-pill-row">
        <StatusPill status={stakeholder._status} size="lg" />
        <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--ink-3)" }}>
          ({stakeholder._x.toFixed(1)}, {stakeholder._y.toFixed(1)})
        </span>
      </div>

      <div style={{
        background: meta.color,
        borderRadius: 8,
        padding: "10px 12px",
        marginBottom: 14,
        color: meta.text,
        fontSize: 12,
        lineHeight: 1.4
      }}>
        <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4, opacity: .85 }}>
          Strategy
        </div>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>{meta.strategy}</div>
        <div style={{ fontSize: 11.5, lineHeight: 1.45 }}>{meta.action}</div>
      </div>

      <div className="detail-row"><div className="k">Category</div><div className="v">{stakeholder.category}</div></div>
      <div className="detail-row"><div className="k">Type</div><div className="v">{stakeholder.type}</div></div>
      <div className="detail-row"><div className="k">Market</div><div className="v">{stakeholder.market}</div></div>
      <div className="detail-row"><div className="k">Region</div><div className="v">{stakeholder.region}</div></div>
      <div className="detail-row"><div className="k">Geography</div><div className="v">{stakeholder.geography}</div></div>
      <div className="detail-row"><div className="k">Issues</div><div className="v">
        {(stakeholder.issues && stakeholder.issues.length) ? (
          <span style={{ display: "inline-flex", flexWrap: "wrap", gap: 4 }}>
            {stakeholder.issues.map(i => <span key={i} className="tag">{i}</span>)}
          </span>
        ) : <span className="muted">-</span>}
      </div></div>
      <div className="detail-row"><div className="k">Priority</div><div className="v"><PriorityPill value={stakeholder.priority} /></div></div>
      <div className="detail-row"><div className="k">Owner</div><div className="v"><OwnersDisplay users={users || []} owners={stakeholder.owners || []} size={22} /></div></div>
      <div className="detail-row"><div className="k">Last contact</div><div className="v">{stakeholder.lastContact}</div></div>
      <div className="detail-row"><div className="k">Status</div><div className="v"><StatusDot value={stakeholder.status} /></div></div>
      <div className="detail-row"><div className="k">Tags</div><div className="v"><Tags values={stakeholder.tags} /></div></div>

      {(() => {
        const history = (stakeholder.notesHistory || []);
        const latest = history.length
          ? history.slice().sort((a, b) => (b.at || "").localeCompare(a.at || ""))[0]
          : (stakeholder.notes ? { body: stakeholder.notes, at: stakeholder.lastContact, by: null } : null);
        if (!latest) return null;
        const d = latest.at ? new Date(latest.at) : null;
        const stamp = d ? d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "";
        return (
          <div className="detail-latest-note">
            <div className="detail-latest-note-head">
              <span style={{ fontSize: 9.5, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-mute)", fontWeight: 600 }}>Latest note</span>
              {stamp && <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-3)" }}>{stamp}</span>}
            </div>
            <div className="detail-latest-note-body">{latest.body}</div>
          </div>
        );
      })()}
    </div>
  );
}

Object.assign(window, { MapView });
