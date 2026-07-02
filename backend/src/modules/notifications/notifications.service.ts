import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly authKey: string;
  private readonly notifyPhone: string;
  private readonly whatsappNumber: string;
  private readonly whatsappTemplateId: string;
  private readonly smsTemplateId: string;
  private readonly smsSenderId: string;

  constructor(private readonly config: ConfigService) {
    this.authKey             = config.get("MSG91_AUTH_KEY", "");
    this.notifyPhone         = config.get("NOTIFY_PHONE", "");
    this.whatsappNumber      = config.get("MSG91_WHATSAPP_NUMBER", "");
    this.whatsappTemplateId  = config.get("MSG91_WA_TEMPLATE_ID", "");
    this.smsTemplateId       = config.get("MSG91_SMS_TEMPLATE_ID", "");
    this.smsSenderId         = config.get("MSG91_SENDER_ID", "INVEST");
  }

  // ── Public API ───────────────────────────────────────────────────────────────

  /** Fire-and-forget: send WhatsApp/SMS when a new enquiry arrives */
  sendEnquiryAlert(
    enquiry: { name: string; phone: string; email?: string | null; message?: string | null },
    propertyTitle?: string | null,
  ): void {
    this.dispatch(enquiry, propertyTitle, "enquiry").catch((err) =>
      this.logger.error("Enquiry notification failed", err?.message),
    );
  }

  /** Fire-and-forget: send WhatsApp/SMS when a site visit is booked */
  sendSiteVisitAlert(
    visit: { name: string; phone: string; email?: string | null; preferredAt: Date; message?: string | null },
    propertyTitle?: string | null,
  ): void {
    this.dispatch(visit, propertyTitle, "visit").catch((err) =>
      this.logger.error("Site visit notification failed", err?.message),
    );
  }

  // ── Dispatch chain ───────────────────────────────────────────────────────────

  private async dispatch(
    data: { name: string; phone: string; email?: string | null; message?: string | null; preferredAt?: Date },
    propertyTitle: string | null | undefined,
    type: "enquiry" | "visit",
  ) {
    if (!this.authKey || !this.notifyPhone) {
      this.logger.warn("MSG91 credentials not configured — skipping notification.");
      return;
    }

    const text = this.buildMessage(data, propertyTitle, type);

    // 1️⃣ Plain-text WhatsApp session message (works immediately, no template needed)
    if (this.whatsappNumber) {
      const sent = await this.trySendWhatsAppText(text);
      if (sent) return;
    }

    // 2️⃣ WhatsApp template message (needs Meta-approved template)
    if (this.whatsappNumber && this.whatsappTemplateId &&
        !this.whatsappTemplateId.includes("_here")) {
      const sent = await this.trySendWhatsAppTemplate(data, propertyTitle, type);
      if (sent) return;
    }

    // 3️⃣ SMS flow fallback (needs DLT-approved flow)
    if (this.smsTemplateId && !this.smsTemplateId.includes("_here")) {
      await this.trySendSms(data, propertyTitle, type);
    }
  }

  // ── Method 1: Plain WhatsApp text (no template — works right away) ──────────

  private async trySendWhatsAppText(text: string): Promise<boolean> {
    try {
      const res = await fetch(
        "https://control.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/",
        {
          method: "POST",
          headers: {
            authkey: this.authKey,
            "content-type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify({
            integrated_number: this.normalisePhone(this.whatsappNumber),
            content_type: "text",
            payload: {
              to: this.normalisePhone(this.notifyPhone),
              type: "text",
              text: { body: text },
            },
          }),
        },
      );

      const json: any = await res.json().catch(() => ({}));

      if (res.ok) {
        this.logger.log(`✅ WhatsApp text alert sent to ${this.notifyPhone}`);
        return true;
      }

      this.logger.warn(
        `WhatsApp text failed (${res.status}): ${JSON.stringify(json)} — will try next method`,
      );
      return false;
    } catch (err: any) {
      this.logger.warn(`WhatsApp text error: ${err?.message}`);
      return false;
    }
  }

  // ── Method 2: WhatsApp approved template ─────────────────────────────────────

  private async trySendWhatsAppTemplate(
    data: { name: string; phone: string; email?: string | null; message?: string | null; preferredAt?: Date },
    propertyTitle: string | null | undefined,
    type: "enquiry" | "visit",
  ): Promise<boolean> {
    try {
      const res = await fetch(
        "https://control.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/",
        {
          method: "POST",
          headers: {
            authkey: this.authKey,
            "content-type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify({
            integrated_number: this.normalisePhone(this.whatsappNumber),
            content_type: "template",
            payload: {
              to: this.normalisePhone(this.notifyPhone),
              type: "template",
              template: {
                name: this.whatsappTemplateId,
                language: { code: "en" },
                components: [
                  {
                    type: "body",
                    parameters: [
                      { type: "text", text: data.name },
                      { type: "text", text: data.phone },
                      { type: "text", text: data.email || "—" },
                      { type: "text", text: propertyTitle || "General enquiry" },
                      { type: "text", text: data.message || "—" },
                      ...(data.preferredAt
                        ? [{ type: "text", text: this.formatDate(data.preferredAt) }]
                        : []),
                    ],
                  },
                ],
              },
            },
          }),
        },
      );

      const json: any = await res.json().catch(() => ({}));

      if (res.ok) {
        this.logger.log(`✅ WhatsApp template alert sent to ${this.notifyPhone}`);
        return true;
      }

      this.logger.warn(`WhatsApp template failed (${res.status}): ${JSON.stringify(json)}`);
      return false;
    } catch (err: any) {
      this.logger.warn(`WhatsApp template error: ${err?.message}`);
      return false;
    }
  }

  // ── Method 3: SMS Flow fallback ───────────────────────────────────────────────

  private async trySendSms(
    data: { name: string; phone: string; email?: string | null; message?: string | null; preferredAt?: Date },
    propertyTitle: string | null | undefined,
    type: "enquiry" | "visit",
  ) {
    const label = type === "enquiry" ? "New Enquiry" : "New Site Visit";
    try {
      const res = await fetch("https://control.msg91.com/api/v5/flow/", {
        method: "POST",
        headers: {
          authkey: this.authKey,
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          template_id: this.smsTemplateId,
          sender: this.smsSenderId,
          short_url: "0",
          mobiles: this.normalisePhone(this.notifyPhone),
          VAR1: label,
          VAR2: data.name,
          VAR3: data.phone,
          VAR4: propertyTitle || "General",
        }),
      });

      const json: any = await res.json().catch(() => ({}));

      if (res.ok) {
        this.logger.log(`✅ SMS alert sent to ${this.notifyPhone}`);
      } else {
        this.logger.warn(`SMS failed (${res.status}): ${JSON.stringify(json)}`);
      }
    } catch (err: any) {
      this.logger.warn(`SMS error: ${err?.message}`);
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  private buildMessage(
    data: { name: string; phone: string; email?: string | null; message?: string | null; preferredAt?: Date },
    propertyTitle: string | null | undefined,
    type: "enquiry" | "visit",
  ): string {
    const label = type === "enquiry" ? "🏠 New Enquiry" : "📅 New Site Visit Request";
    const lines = [
      `${label} — Investo Properties`,
      ``,
      `👤 Name: ${data.name}`,
      `📞 Phone: ${data.phone}`,
      `📧 Email: ${data.email || "—"}`,
      `🏢 Property: ${propertyTitle || "General enquiry"}`,
      `💬 Message: ${data.message || "—"}`,
    ];
    if (data.preferredAt) {
      lines.push(`📅 Visit time: ${this.formatDate(data.preferredAt)}`);
    }
    lines.push(``, `🕐 Received: ${this.formatDate(new Date())}`);
    return lines.join("\n");
  }

  private normalisePhone(phone: string): string {
    return phone.replace(/\D/g, "");
  }

  private formatDate(date: Date): string {
    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }
}
