using System.Net;
using System.Net.Mail;
using backend.Services.Interfaces;

namespace backend.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration configuration;
        private readonly ILogger<EmailService> logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            this.configuration = configuration;
            this.logger = logger;
        }

        public async Task SendAsync(string toEmail, string subject, string bodyHtml)
        {
            var host = configuration["Smtp:Host"];

            if (string.IsNullOrWhiteSpace(host))
            {
                // No SMTP configured (e.g. local dev) — log instead of sending, so you can
                // still test the flow by reading the code from the console/logs.
                logger.LogWarning(
                    "SMTP not configured. Email to {To} not sent. Subject: {Subject}. Body: {Body}",
                    toEmail, subject, bodyHtml);
                return;
            }

            var port = int.TryParse(configuration["Smtp:Port"], out var p) ? p : 587;
            var user = configuration["Smtp:User"];
            var password = configuration["Smtp:Password"];
            var from = configuration["Smtp:From"] ?? user ?? "no-reply@studentgrid.local";
            var fromName = configuration["Smtp:FromName"] ?? "StudentGrid";

            using var client = new SmtpClient(host, port)
            {
                Credentials = new NetworkCredential(user, password),
                EnableSsl = true,
            };

            using var message = new MailMessage
            {
                From = new MailAddress(from, fromName),
                Subject = subject,
                Body = bodyHtml,
                IsBodyHtml = true,
            };

            message.To.Add(toEmail);
            await client.SendMailAsync(message);
        }
    }
}