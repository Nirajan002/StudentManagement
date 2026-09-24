using backend.Data;
using backend.Modules;
using backend.Services;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using backend.Hubs;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

// Reject oversized uploads early instead of letting them time out mid-stream.
builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 30 * 1024 * 1024; // 30 MB
});

builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 30 * 1024 * 1024; // 30 MB
});

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<StudentManagement>(options => options.UseSqlServer(builder.Configuration.GetConnectionString("ManagementDbConnection")));

builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactPolicy", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// Throttle brute-force login/password-reset attempts. 5 attempts per IP
// per minute is generous for a real user, painful for a script.
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    options.AddFixedWindowLimiter("auth", opt =>
    {
        opt.PermitLimit = 5;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueLimit = 0;
    });
});

builder.Services.AddScoped<IFileStorageService, FileStorageService>();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IStudentService, StudentService>();
builder.Services.AddScoped<ITeacherService, TeacherService>();
builder.Services.AddScoped<IReadStateService, ReadStateService>();
builder.Services.AddScoped<IGroupService, GroupService>();
builder.Services.AddScoped<IGroupPostService, GroupPostService>();
builder.Services.AddScoped<IGlobalNoticeService, GlobalNoticeService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IAssignmentSubmissionService, AssignmentSubmissionService>();
builder.Services.AddSignalR();
builder.Services.AddScoped<IRealtimeNotifier, RealtimeNotifier>();

var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrWhiteSpace(jwtKey))
{
    throw new InvalidOperationException(
        "Jwt:Key is not configured. Set it via `dotnet user-secrets set \"Jwt:Key\" \"...\"` " +
        "in development, or the Jwt__Key environment variable in production.");
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                if (context.Request.Cookies.ContainsKey("token"))
                {
                    context.Token = context.Request.Cookies["token"];
                }
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// Seed an admin user if one doesn't exist yet. Credentials come from
// configuration (user-secrets locally, environment variables in prod) —
// never hardcoded here.
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<StudentManagement>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    var hasher = new PasswordHasher<Teacher>();

    if (!dbContext.Teachers.Any(u => u.Role == "Admin"))
    {
        var seedEmail = builder.Configuration["SeedAdmin:Email"];
        var seedPassword = builder.Configuration["SeedAdmin:Password"];

        if (string.IsNullOrWhiteSpace(seedEmail) || string.IsNullOrWhiteSpace(seedPassword))
        {
            logger.LogWarning(
                "No admin account exists and SeedAdmin:Email/SeedAdmin:Password are not configured. " +
                "Skipping admin seed — set these via user-secrets or environment variables.");
        }
        else
        {
            var admin = new Teacher
            {
                Id = Guid.NewGuid(),
                FullName = "Admin User",
                Email = seedEmail,
                Password = hasher.HashPassword(null!, seedPassword),
                Role = "Admin",
            };

            dbContext.Teachers.Add(admin);
            dbContext.SaveChanges();

            logger.LogInformation("Seeded initial admin account for {Email}.", seedEmail);
        }
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("ReactPolicy");

app.UseStaticFiles();

app.UseRateLimiter();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.MapHub<NotificationHub>("/hubs/notifications");

app.Run();