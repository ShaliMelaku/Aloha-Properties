/**
 * Premium Email Template Engine for Aloha Properties
 * Mirrors the website's premium cinema aesthetic.
 */

export function renderEmailTemplate(content: string, recipientName: string) {
  const brandBlue = '#0066FF';
  const luxuryCharcoal = '#0A0A0B';
  const mutedText = '#64748b';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&family=Plus+Jakarta+Sans:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      color: ${luxuryCharcoal};
      line-height: 1.6;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #f8fafc;
      padding-bottom: 40px;
    }
    .main-table {
      width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 24px;
      overflow: hidden;
      margin-top: 40px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    }
    .header {
      background-color: ${luxuryCharcoal};
      padding: 40px;
      text-align: center;
    }
    .logo {
      font-family: 'Outfit', sans-serif;
      font-size: 24px;
      font-weight: 900;
      letter-spacing: 0.2em;
      color: #ffffff;
      text-transform: uppercase;
      margin: 0;
    }
    .logo span {
      color: ${brandBlue};
    }
    .content {
      padding: 48px;
    }
    .message-body {
      font-size: 16px;
      margin-bottom: 32px;
    }
    .ad-banner {
      background: linear-gradient(135deg, ${brandBlue} 0%, #0044BB 100%);
      padding: 20px;
      border-radius: 16px;
      text-align: center;
      margin-bottom: 32px;
      color: #ffffff;
    }
    .ad-banner a {
      color: #ffffff;
      text-decoration: underline;
      font-weight: 700;
    }
    .footer {
      padding: 0 48px 48px 48px;
      border-top: 1px solid #f1f5f9;
    }
    .signature {
      padding-top: 32px;
    }
    .sig-name {
      font-family: 'Outfit', sans-serif;
      font-weight: 700;
      font-size: 18px;
      margin: 0;
      color: ${luxuryCharcoal};
    }
    .sig-title {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: ${mutedText};
      margin: 2px 0 12px 0;
    }
    .sig-links {
      font-size: 13px;
    }
    .sig-links a {
      color: ${brandBlue};
      text-decoration: none;
      margin-right: 12px;
      font-weight: 700;
    }
    .btn-cta {
      display: inline-block;
      padding: 12px 24px;
      background-color: ${brandBlue};
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 30px;
      font-weight: 700;
      font-size: 14px;
      margin-top: 16px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <table class="main-table" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td class="header">
          <h1 class="logo">ALOHA<span>PROPERTIES</span></h1>
        </td>
      </tr>
      <tr>
        <td class="content">
          <div class="message-body">
            <p style="font-weight: 700; margin-bottom: 24px;">Dear ${recipientName},</p>
            ${content}
          </div>
          
          <!-- Ad Banner Section -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" class="ad-banner">
            <tr>
              <td>
                <p style="margin: 0; font-size: 14px; font-weight: 500;">
                  Discover the future of Ethiopian Real Estate.
                </p>
                <a href="https://alohaproperties.et" style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">
                  Explore our Products &rarr;
                </a>
              </td>
            </tr>
          </table>
          
          <div class="footer">
            <div class="signature">
              <p class="sig-name">Mr Asmelash</p>
              <p class="sig-title">Founder & CEO | Aloha Properties</p>
              <div class="sig-links">
                <a href="https://alohaproperties.et">Website</a>
                <a href="https://linkedin.com">LinkedIn</a>
                <a href="mailto:contact@alohaproperties.et">Contact</a>
              </div>
            </div>
          </div>
        </td>
      </tr>
    </table>
    
    <div style="text-align: center; margin-top: 24px;">
      <p style="font-size: 10px; color: ${mutedText}; text-transform: uppercase; letter-spacing: 0.2em;">
        &copy; 2026 ALOHA PROPERTIES. ALL RIGHTS RESERVED.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}
