import { STAKEHOLDER_DATA } from './data';
// Help screen - "How to read this".

export function HelpView() {
  const D = STAKEHOLDER_DATA;
  return (
    <div className="help-wrap">
      <div className="help-inner">

        <div className="help-prelude">
          <p>
            Stakeholders exist in a public square where <em>ideas</em> are exchanged, your <em>credibility</em> is won or lost, and <em>value</em> is created, shared, or squandered.
          </p>
        </div>

        <div className="help-title">How to plan for and engage stakeholders</div>

        <div className="engage-funnel">
          <div className="funnel-arrows">
            <div className="funnel-arrow funnel-1"><span>Purpose</span></div>
            <div className="funnel-arrow funnel-2"><span>Plan</span></div>
            <div className="funnel-arrow funnel-3"><span>Execute</span></div>
          </div>
          <div className="funnel-cols">
            <div className="funnel-col">
              <div className="funnel-step funnel-step-lead">1. Set goals for your organization</div>
              <div className="funnel-step">2. Issue identification</div>
              <div className="funnel-step">3. Stakeholder identification</div>
              <div className="funnel-step">4. Stakeholder prioritization</div>
            </div>
            <div className="funnel-col">
              <div className="funnel-step funnel-step-lead">5. Landscape analysis</div>
              <div className="funnel-step">6. Cross-functional teams alignment</div>
              <div className="funnel-step">7. Research &amp; listening sessions</div>
              <div className="funnel-step">8. Early stakeholder analysis &amp; modeling</div>
            </div>
            <div className="funnel-col">
              <div className="funnel-step funnel-step-lead">9. Launch campaign</div>
              <div className="funnel-step">10. Ongoing stakeholder analysis</div>
              <div className="funnel-step">11. Collaborate with stakeholders</div>
              <div className="funnel-step">12. Realize shared value where possible</div>
            </div>
          </div>
        </div>

        <div className="help-title">How to read the stakeholder map</div>

        <div className="spectrum">
          {D.STATUS_ORDER.map(name => {
            const meta = D.STATUSES[name];
            return (
              <div className="sw" key={name} style={{ background: meta.color, color: meta.text }}>
                {name}
              </div>
            );
          })}
        </div>

        <div className="help-cols">
          <div className="help-card neg">
            <h3>Negative impact on organization</h3>
            <ul className="bullets">
              <li>Defend license to operate</li>
              <li>Challenge misinformation</li>
              <li>Plan for their influence in community</li>
              <li>Identify their reputation with audiences</li>
            </ul>
            <div className="influencer-tag">"Influencer"</div>
          </div>

          <div className="help-card mid">
            <h3>The winnable middle</h3>
            <ul className="bullets">
              <li>Dispel myths and misperceptions</li>
              <li>Appeal to their priorities</li>
              <li>Identify shared value to move them our way</li>
              <li>Invest in relationship where possible</li>
              <li>Identify our reputation with them</li>
            </ul>
          </div>

          <div className="help-card pos">
            <h3>Positive impact on organization</h3>
            <ul className="bullets">
              <li>Maximize shared value</li>
              <li>Maintain relationship</li>
              <li>Champion their cause</li>
              <li>Recruit as public surrogates</li>
              <li>Communicate often</li>
            </ul>
            <div className="influencer-tag">"Influencer"</div>
          </div>
        </div>

        <div className="help-grid-section">
          <h2>The 24 zones at a glance</h2>
          <p>
            Stakeholders are plotted on a two-axis grid: <strong>x</strong> measures impact on the
            business (do they work with you or against you?), <strong>y</strong> measures their
            influence in the community. The combination determines the relationship strategy.
          </p>

          <div className="help-grid-figure">
            <div className="grid-body">
              {D.GRID.flatMap((row, r) =>
                row.map((status, c) => {
                  const meta = D.STATUSES[status];
                  return (
                    <div className="zone" key={r + "-" + c} style={{ background: meta.color, color: meta.text }}>
                      <div className="zone-label" style={{ fontSize: 11.5 }}>{status}</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Axis legend strip (full width) */}
          <div className="map-axis-legend" style={{ marginTop: 12 }}>
            <span style={{ justifySelf: "start" }}>← Works against you</span>
            <span style={{ justifySelf: "center" }}>
              ↑ Greater community influence&nbsp;&nbsp;·&nbsp;&nbsp;↓ Less community influence
            </span>
            <span style={{ justifySelf: "end" }}>Works with you →</span>
          </div>
        </div>

        <div className="help-grid-section">
          <h2>Strategy reference</h2>
          <p>For every zone, a stakeholder's position on the map returns recommended posture and identifies suggested immediate actions your team can take.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {D.STATUS_ORDER.map(name => {
              const meta = D.STATUSES[name];
              return (
                <div key={name} style={{
                  border: "1px solid var(--rule)",
                  borderRadius: 10,
                  padding: "12px 14px",
                  background: "var(--paper)",
                  display: "grid",
                  gridTemplateColumns: "8px 1fr",
                  gap: 12,
                  alignItems: "start"
                }}>
                  <div style={{ width: 8, alignSelf: "stretch", borderRadius: 4, background: meta.color }} />
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <strong style={{ fontSize: 13 }}>{name}</strong>
                      <span className="muted" style={{ fontSize: 11 }}>·</span>
                      <em style={{ fontSize: 12, color: meta.text }}>{meta.strategy}</em>
                    </div>
                    <div className="muted" style={{ fontSize: 12, lineHeight: 1.45 }}>{meta.action}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="help-grid-section">
          <h2>How scores become coordinates</h2>
          <p>
            On the Scoring tab, every teammate rates each stakeholder on x and y from −10 to 10. Each teammate also has a weight. The final coordinate is the weighted average of their scores. A teammate with weight 1.5 counts 1.5 times more than one with weight 1.0.
          </p>
          <pre style={{
            background: "var(--bg-2)",
            border: "1px solid var(--rule)",
            borderRadius: 8,
            padding: "12px 14px",
            fontFamily: "var(--mono)",
            fontSize: 12,
            color: "var(--ink-2)",
            margin: 0,
            overflowX: "auto"
          }}>
{`final.x = Σ (member.x × member.weight) / Σ member.weight
final.y = Σ (member.y × member.weight) / Σ member.weight
zone    = lookup(final.x, final.y)`}
          </pre>
        </div>
      </div>
    </div>
  );
}

