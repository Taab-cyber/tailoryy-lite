# services/email_service.py — HTML email templates with Tailoryy branding via Resend
from app.config import settings
from datetime import datetime


def _send(to: str, subject: str, html: str) -> bool:
    """Send HTML email via Resend. Falls back to console log in dev."""
    if not settings.RESEND_API_KEY or settings.RESEND_API_KEY.startswith("re_xxx"):
        print(f"\n[Email — dev mode]\n  To: {to}\n  Subject: {subject}\n")
        return True
    try:
        import resend
        resend.api_key = settings.RESEND_API_KEY
        resend.Emails.send({
            "from":    f"Tailoryy <{settings.FROM_EMAIL}>",
            "to":      [to],
            "subject": subject,
            "html":    html,
        })
        return True
    except Exception as e:
        print(f"[Email error] {e}")
        return False


def _wrap(body: str, cta_label: str = None, cta_url: str = None) -> str:
    """Wraps email body in the Tailoryy brand HTML template."""
    cta = ""
    if cta_label and cta_url:
        cta = f"""
        <div style="text-align:center;margin:32px 0;">
          <a href="{cta_url}" style="background:#C4704A;color:#fff;padding:14px 32px;
             border-radius:6px;text-decoration:none;font-family:Inter,sans-serif;
             font-size:14px;font-weight:600;">{cta_label}</a>
        </div>"""
    yr = datetime.now().year
    return f"""<!DOCTYPE html><html><body style="margin:0;padding:0;background:#FAF7F2;font-family:Inter,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0">
  <tr><td align="center" style="padding:40px 20px;">
    <table width="600" cellpadding="0" cellspacing="0"
           style="background:#fff;border-radius:12px;border:1px solid #E8DDD4;max-width:600px;overflow:hidden;">
      <tr>
        <td style="background:#2C1810;padding:28px 40px;text-align:center;">
          <span style="font-family:Inter,sans-serif;font-size:22px;font-weight:500;color:#FAF7F2;">tailor</span>
          <span style="font-family:Georgia,serif;font-size:22px;font-weight:600;color:#C4704A;font-style:italic;">yy</span>
        </td>
      </tr>
      <tr><td style="padding:40px;">{body}{cta}</td></tr>
      <tr>
        <td style="background:#F5EFE6;padding:20px 40px;text-align:center;
                   font-size:12px;color:#9B8A7A;font-family:Inter,sans-serif;">
          © {yr} Tailoryy &nbsp;·&nbsp; Your dream outfit, stitched to perfection.
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body></html>"""


def _p(text: str) -> str:
    return f'<p style="color:#4A3728;line-height:1.7;margin:0 0 14px;">{text}</p>'


def _h2(text: str) -> str:
    return f'<h2 style="font-family:Georgia,serif;color:#2C1810;margin:0 0 20px;">{text}</h2>'


# ── Individual email senders ─────────────────────────────────────────────────

def send_welcome_email(email: str, name: str):
    body = (
        _h2(f"Welcome to Tailoryy, {name}!")
        + _p("We're thrilled to have you here. Your dream outfit is just a few steps away.")
        + _p("Browse our portfolio, explore fabrics, and place your first custom order — "
             "we stitch every piece with love and precision.")
    )
    _send(email, "Welcome to Tailoryy ✨",
          _wrap(body, "Start Your Order", settings.FRONTEND_URL + "/order"))


def send_order_confirmation(email: str, name: str, order_number: str):
    body = (
        _h2("Your order is confirmed!")
        + _p(f"Hi {name}, your order <strong>{order_number}</strong> has been placed successfully.")
        + _p("Our team will review your requirements and confirm the final price within 24 hours. "
             "We'll keep you updated every step of the way.")
    )
    _send(email, f"Order {order_number} Confirmed — Tailoryy",
          _wrap(body, "Track Your Order", settings.FRONTEND_URL + "/dashboard/orders"))


def send_order_status_update(email: str, name: str, order_number: str, new_status: str):
    messages = {
        "confirmed":     "Great news — your order has been confirmed and will move to our artisan team shortly.",
        "cutting":       "Your fabric is being cut with precision. The magic has begun!",
        "stitching":     "Our skilled artisans are stitching your outfit with care.",
        "quality_check": "Your outfit has passed to our quality inspection team.",
        "shipped":       "Your outfit is on its way to you! Check the tracking details in your dashboard.",
        "delivered":     "Your outfit has been delivered. We hope it brings you joy!",
        "cancelled":     "Your order has been cancelled. Please contact us if you have any questions.",
    }
    msg  = messages.get(new_status, f"Your order status has been updated to: {new_status.replace('_', ' ').title()}")
    body = _h2("Order Update") + _p(f"Hi {name},") + _p(msg) + f'<p style="color:#9B8A7A;font-size:13px;">Order: {order_number}</p>'
    _send(email, f"Order {order_number} Update — Tailoryy",
          _wrap(body, "View Order", settings.FRONTEND_URL + "/dashboard/orders"))


def send_payment_confirmation(email: str, name: str, order_number: str, amount: float):
    body = (
        _h2("Payment Received!")
        + _p(f"Hi {name}, we've received your advance payment of ₹{amount:,.0f} for order <strong>{order_number}</strong>.")
        + _p("We'll now begin processing your order. You can track progress in your dashboard.")
    )
    _send(email, f"Payment Confirmed — {order_number}",
          _wrap(body, "View Order", settings.FRONTEND_URL + "/dashboard/orders"))


def send_shipping_notification(email: str, name: str, order_number: str, tracking_number: str):
    body = (
        _h2("Your outfit is on its way!")
        + _p(f"Hi {name}, your order <strong>{order_number}</strong> has been shipped.")
        + f'<p style="background:#F5EFE6;padding:12px;border-radius:6px;color:#4A3728;font-weight:600;">Tracking: {tracking_number}</p>'
        + _p("You can track your shipment using the tracking number above.")
    )
    _send(email, f"Your order is shipped — {order_number}",
          _wrap(body, "Track Shipment", settings.FRONTEND_URL + "/dashboard/orders"))


def send_delivery_confirmation(email: str, name: str, order_number: str):
    body = (
        _h2("Your outfit has arrived!")
        + _p(f"Hi {name}, your order <strong>{order_number}</strong> has been delivered.")
        + _p("We hope you love it! If you enjoyed the experience, we'd love to hear from you.")
    )
    _send(email, f"Order Delivered — {order_number}",
          _wrap(body, "Leave a Review", settings.FRONTEND_URL + "/dashboard/orders"))


def send_new_message_notification_admin(customer_name: str, customer_email: str, preview: str):
    body = (
        _h2("New Message from Customer")
        + _p(f"From: <strong>{customer_name}</strong> ({customer_email})")
        + f'<blockquote style="background:#F5EFE6;padding:12px 16px;border-left:3px solid #C4704A;border-radius:0 6px 6px 0;color:#4A3728;margin:0;">'
        f'"{preview[:200]}"</blockquote>'
    )
    _send(settings.ADMIN_EMAIL, f"New message from {customer_name} — Tailoryy",
          _wrap(body, "Reply in Admin Panel", settings.FRONTEND_URL + "/admin/messages"))


def send_new_message_notification_customer(email: str, name: str, preview: str):
    body = (
        _h2("You have a new reply")
        + _p(f"Hi {name}, the Tailoryy team replied to your message:")
        + f'<blockquote style="background:#F5EFE6;padding:12px 16px;border-left:3px solid #C4704A;border-radius:0 6px 6px 0;color:#4A3728;margin:0;">'
        f'"{preview[:200]}"</blockquote>'
    )
    _send(email, "New reply from Tailoryy",
          _wrap(body, "View Message", settings.FRONTEND_URL + "/dashboard/messages"))


def send_contact_form_emails(name: str, email: str, subject: str, message: str):
    # Admin notification
    admin_body = (
        _h2("New Contact Form Submission")
        + f'<p style="color:#4A3728;"><strong>Name:</strong> {name}</p>'
        + f'<p style="color:#4A3728;"><strong>Email:</strong> {email}</p>'
        + f'<p style="color:#4A3728;"><strong>Subject:</strong> {subject}</p>'
        + f'<p style="background:#F5EFE6;padding:12px;border-radius:6px;color:#4A3728;">{message}</p>'
    )
    _send(settings.ADMIN_EMAIL, f"Contact Form: {subject}", _wrap(admin_body))

    # Auto-reply
    reply_body = (
        _h2("We received your message")
        + _p(f"Hi {name},")
        + _p("Thank you for reaching out! We've received your message and will get back to you within 24 hours.")
    )
    _send(email, "We got your message — Tailoryy", _wrap(reply_body))
