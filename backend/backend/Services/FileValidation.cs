using backend.Services.Exceptions;

namespace backend.Services
{
    public enum FileCategory
    {
        Image,
        Document
    }

    public static class FileValidation
    {
        private const long MaxImageSizeBytes = 5 * 1024 * 1024;      // 5 MB
        private const long MaxDocumentSizeBytes = 25 * 1024 * 1024;  // 25 MB

        private static readonly HashSet<string> AllowedImageExtensions = new(StringComparer.OrdinalIgnoreCase)
        {
            ".jpg", ".jpeg", ".png", ".gif", ".webp"
        };

        private static readonly HashSet<string> AllowedDocumentExtensions = new(StringComparer.OrdinalIgnoreCase)
        {
            ".jpg", ".jpeg", ".png", ".gif", ".webp",
            ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
            ".txt", ".csv", ".zip"
        };

        // Magic-number signatures used to catch a file whose declared
        // extension doesn't match its actual content (e.g. an .exe
        // renamed to profile.jpg).
        private static readonly Dictionary<string, byte[][]> Signatures = new(StringComparer.OrdinalIgnoreCase)
        {
            [".jpg"] = new[] { new byte[] { 0xFF, 0xD8, 0xFF } },
            [".jpeg"] = new[] { new byte[] { 0xFF, 0xD8, 0xFF } },
            [".png"] = new[] { new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A } },
            [".gif"] = new[]
            {
                new byte[] { 0x47, 0x49, 0x46, 0x38, 0x37, 0x61 },
                new byte[] { 0x47, 0x49, 0x46, 0x38, 0x39, 0x61 }
            },
            [".pdf"] = new[] { new byte[] { 0x25, 0x50, 0x44, 0x46 } },
            [".zip"] = new[] { new byte[] { 0x50, 0x4B, 0x03, 0x04 } },
            // .docx / .xlsx / .pptx are zip containers under the hood
            [".docx"] = new[] { new byte[] { 0x50, 0x4B, 0x03, 0x04 } },
            [".xlsx"] = new[] { new byte[] { 0x50, 0x4B, 0x03, 0x04 } },
            [".pptx"] = new[] { new byte[] { 0x50, 0x4B, 0x03, 0x04 } },
        };

        public static async Task ValidateAsync(IFormFile file, FileCategory category)
        {
            if (file.Length == 0)
                throw new ValidationException("The selected file is empty.");

            var maxSize = category == FileCategory.Image ? MaxImageSizeBytes : MaxDocumentSizeBytes;
            if (file.Length > maxSize)
                throw new ValidationException($"File is too large. Maximum size is {maxSize / (1024 * 1024)} MB.");

            var extension = Path.GetExtension(file.FileName);
            if (string.IsNullOrWhiteSpace(extension))
                throw new ValidationException("The file must have a valid extension.");

            var allowed = category == FileCategory.Image
                ? AllowedImageExtensions
                : AllowedDocumentExtensions;

            if (!allowed.Contains(extension))
                throw new ValidationException($"Files of type '{extension}' are not allowed.");

            if (Signatures.TryGetValue(extension, out var validSignatures))
            {
                var header = new byte[8];

                await using var stream = file.OpenReadStream();
                var bytesRead = await stream.ReadAsync(header.AsMemory(0, header.Length));

                var matchesAny = validSignatures.Any(sig =>
                    bytesRead >= sig.Length && header.Take(sig.Length).SequenceEqual(sig));

                if (!matchesAny)
                    throw new ValidationException(
                        $"The file's content doesn't match its extension ('{extension}'). It may be corrupted or mislabeled.");
            }
        }
    }
}