namespace backend.Services.Exceptions
{
    public class NotFoundException : Exception
    {
        public NotFoundException(string message = "Not found.") : base(message) { }
    }

    public class ForbiddenException : Exception
    {
        public ForbiddenException(string message = "Forbidden.") : base(message) { }
    }

    public class ValidationException : Exception
    {
        public ValidationException(string message) : base(message) { }
    }

    public class ConflictException : Exception
    {
        public ConflictException(string message) : base(message) { }
    }
}