import { Participant } from "@/components/admin/ParticipantsTable";

export function exportFeedbackPDF(participants: Participant[]) {
  const feedbackList = participants.filter((p) => p.wants_more_sessions || p.requested_topics);
  const listToExport = feedbackList.length > 0 ? feedbackList : participants;

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const totalCount = participants.length;
  const wantsMoreCount = participants.filter((p) => p.wants_more_sessions).length;
  const percentage = totalCount > 0 ? Math.round((wantsMoreCount / totalCount) * 100) : 0;
  const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Training Feedback Report - ${dateStr}</title>
        <style>
          @page { size: A4 portrait; margin: 15mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; padding: 24px; font-size: 12px; line-height: 1.5; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 24px; }
          .title { font-size: 22px; font-weight: 700; color: #0f172a; margin: 0; }
          .subtitle { font-size: 12px; color: #64748b; margin-top: 4px; }
          .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
          .stat-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center; }
          .stat-value { font-size: 20px; font-weight: 700; color: #0f172a; }
          .stat-label { font-size: 11px; color: #64748b; font-weight: 500; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th { background: #f1f5f9; text-align: left; padding: 10px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; border-bottom: 1px solid #cbd5e1; }
          td { padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; vertical-align: top; }
          tr:nth-child(even) { background: #fafafa; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 600; }
          .badge-yes { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
          .badge-no { background: #f1f5f9; color: #64748b; }
          .topic-box { background: #f8fafc; border-left: 3px solid #d97706; padding: 6px 10px; font-style: italic; color: #334155; margin-top: 4px; border-radius: 0 4px 4px 0; }
          .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">Training Feedback Report</h1>
            <p class="subtitle">Generated on ${dateStr} • Admin Portal</p>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${totalCount}</div>
            <div class="stat-label">Total Participants</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${wantsMoreCount}</div>
            <div class="stat-label">Interested in Future Training</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${percentage}%</div>
            <div class="stat-label">Opt-In Rate</div>
          </div>
        </div>

        <h3 style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">Participant Feedback & Topic Requests</h3>

        <table>
          <thead>
            <tr>
              <th style="width: 22%;">Participant Name</th>
              <th style="width: 25%;">Email</th>
              <th style="width: 15%;">Unique ID</th>
              <th style="width: 15%;">Wants More?</th>
              <th style="width: 23%;">Requested Topics</th>
            </tr>
          </thead>
          <tbody>
            ${listToExport
              .map(
                (p) => `
              <tr>
                <td style="font-weight: 600;">${escapeHtml(p.name)}</td>
                <td style="color: #475569;">${escapeHtml(p.email)}</td>
                <td style="font-family: monospace;">${escapeHtml(p.unique_id)}</td>
                <td>
                  ${
                    p.wants_more_sessions
                      ? `<span class="badge badge-yes">Yes</span>`
                      : `<span class="badge badge-no">No response</span>`
                  }
                </td>
                <td>
                  ${
                    p.requested_topics
                      ? `<div class="topic-box">"${escapeHtml(p.requested_topics)}"</div>`
                      : `<span style="color: #94a3b8;">—</span>`
                  }
                </td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <div class="footer">
          Confidential • Admin Training Feedback Export • Page 1
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

function escapeHtml(str: string) {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
