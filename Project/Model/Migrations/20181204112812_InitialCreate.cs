using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Model.Migrations
{
    public partial class InitialCreate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Contact",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Key = table.Column<Guid>(nullable: false),
                    FirstName = table.Column<string>(nullable: true),
                    LastName = table.Column<string>(nullable: true),
                    Email = table.Column<string>(nullable: true),
                    HomePhone = table.Column<string>(nullable: true),
                    WorkPhone = table.Column<string>(nullable: true),
                    Mobile = table.Column<string>(nullable: true),
                    DateRegistered = table.Column<DateTime>(nullable: true),
                    Password = table.Column<byte[]>(nullable: true),
                    Salt = table.Column<byte[]>(nullable: true),
                    Pending = table.Column<bool>(nullable: true),
                    Active = table.Column<bool>(nullable: true),
                    RefreshToken = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Contact", x => x.Id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Contact");
        }
    }
}
