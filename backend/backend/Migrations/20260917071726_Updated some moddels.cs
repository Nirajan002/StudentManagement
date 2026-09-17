using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class Updatedsomemoddels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Marks",
                table: "AssignmentSubmissions");

            migrationBuilder.RenameColumn(
                name: "Feedback",
                table: "AssignmentSubmissions",
                newName: "OriginalFileName");

            migrationBuilder.AddColumn<int>(
                name: "SubmissionMode",
                table: "GroupPosts",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FileName",
                table: "AssignmentSubmissions",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "OnlineSubmittedAt",
                table: "AssignmentSubmissions",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SubmissionMode",
                table: "GroupPosts");

            migrationBuilder.DropColumn(
                name: "FileName",
                table: "AssignmentSubmissions");

            migrationBuilder.DropColumn(
                name: "OnlineSubmittedAt",
                table: "AssignmentSubmissions");

            migrationBuilder.RenameColumn(
                name: "OriginalFileName",
                table: "AssignmentSubmissions",
                newName: "Feedback");

            migrationBuilder.AddColumn<int>(
                name: "Marks",
                table: "AssignmentSubmissions",
                type: "int",
                nullable: true);
        }
    }
}
