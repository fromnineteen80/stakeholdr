import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { PHASES } from './phases';

const STORAGE = 'stakeholdr_guide_checks_v1';

interface Item { t: string; done?: boolean; d?: string; }
interface Phase { id: string; icon: string; label: string; blurb: string; items: Item[]; }

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    MatToolbarModule, MatListModule, MatExpansionModule,
    MatCheckboxModule, MatProgressBarModule, MatIconModule, MatChipsModule,
  ],
  templateUrl: './app.component.html',
})
export class AppComponent {
  phases = PHASES as Phase[];
  active = this.phases[0].id;
  checks: Record<string, boolean> = {};

  constructor() {
    try { this.checks = JSON.parse(localStorage.getItem(STORAGE) || '{}'); } catch { /* ignore */ }
    for (const p of this.phases) {
      p.items.forEach((it, i) => {
        const id = p.id + '-' + i;
        if (it.done && !(id in this.checks)) this.checks[id] = true;
      });
    }
  }

  get phase(): Phase { return this.phases.find((p) => p.id === this.active) ?? this.phases[0]; }
  get allIds(): string[] { return this.phases.flatMap((p) => p.items.map((_, i) => p.id + '-' + i)); }
  get doneCount(): number { return this.allIds.filter((id) => this.checks[id]).length; }
  get total(): number { return this.allIds.length; }
  get pct(): number { return Math.round((this.doneCount / this.total) * 100); }

  phaseDone(p: Phase): number { return p.items.filter((_, i) => this.checks[p.id + '-' + i]).length; }
  setActive(id: string): void { this.active = id; }
  isOn(id: string): boolean { return !!this.checks[id]; }
  toggle(id: string): void {
    this.checks = { ...this.checks, [id]: !this.checks[id] };
    try { localStorage.setItem(STORAGE, JSON.stringify(this.checks)); } catch { /* ignore */ }
  }
}
