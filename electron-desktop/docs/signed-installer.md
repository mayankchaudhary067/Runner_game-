# Signed Installer Setup for Windows

For production deployment, sign the installer and app with a valid code-signing certificate.

## Requirements

- A valid Windows code-signing certificate
- Access to `signtool.exe` from the Windows SDK
- A trusted certificate store on the machine building the installer

## Example signing flow

```powershell
signtool sign /fd SHA256 /tr http://timestamp.digicert.com /td SHA256 /a "dist\SimpleRunner-1.0.0-win.exe"
```

## Recommended practice

- Sign both the `.exe` installer and the portable app
- Use a certificate issued for your company or product name
- Keep the signing certificate in a secure environment
- Test the installer on a clean Windows 10/11 machine

## Update service

For auto-updates, host the final release files on a trusted HTTPS endpoint and configure `electron-updater` to use that release server.
