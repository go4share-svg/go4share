export const resetPasswordEmail = (resetUrl) => `
<!DOCTYPE html>
<html>
<body style="margin:0;background:#05050a;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px;">
        <table style="
          max-width:420px;
          background:#0b0b16;
          border-radius:20px;
          border:1px solid rgba(34,211,238,.3);
          box-shadow:0 0 40px rgba(34,211,238,.2);
        ">
          <tr>
            <td style="padding:32px;color:white;text-align:center;">
              <h1 style="
                background:linear-gradient(90deg,#22d3ee,#d946ef);
                -webkit-background-clip:text;
                -webkit-text-fill-color:transparent;
              ">
                GO4SHARE
              </h1>

              <p style="color:#9ca3af;">
                Reset hesla ke tvému účtu
              </p>

              <a href="${resetUrl}" style="
                display:inline-block;
                margin-top:24px;
                padding:14px 28px;
                border-radius:14px;
                background:linear-gradient(90deg,#22d3ee,#d946ef);
                color:#05050a;
                font-weight:700;
                text-decoration:none;
              ">
                Resetovat heslo
              </a>

              <p style="margin-top:24px;font-size:12px;color:#6b7280;">
                Platnost odkazu: 15 minut
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;