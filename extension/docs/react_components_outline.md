## React Component Outline

### Popup (src/popup/)
- `Popup.js`: Main component, orchestrates other components.
  - `Header.js`: Displays MM glyph and settings button.
  - `TimeToday.js`: Shows total time spent today.
  - `SiteBreakdown.js`: Lists top 3 sites with time spent.
  - `NudgeBanner.js`: Conditional display for nudges.
  - `Footer.js`: Contains link to Dashboard.

### Dashboard (src/dashboard/)
- `Dashboard.js`: Main SPA component.
  - `HeaderBar.js`: Displays Dashboard title and date picker.
  - `SummaryCards.js`: Flex row of summary cards (Total Time, Avg. Session, etc.).
    - `Card.js`: Reusable card component.
    - `SmallChangeIndicator.js`: Component for delta display.
  - `Charts.js`: Container for Chart.js components.
    - `PieChart.js`: Displays category breakdown.
    - `BarChart.js`: Displays daily time spent over 7 days.
  - `SourceBiasTable.js`: Table displaying source bias, credibility, and time spent.
    - `TableRow.js`: Reusable table row component.


