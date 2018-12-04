using System;
using System.IO;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using Model.Entity;
using Util;
using Util;

namespace Model.Entity
{
    [AutoWire]
    public class ContextFactory : IDesignTimeDbContextFactory<Context>
    {
        public string BasePath { get; protected set; }

        public Context Create()
        {
            var environmentName = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");

            var basePath = AppContext.BaseDirectory;

            return Create(basePath, environmentName);
        }

        private Context Create(string basePath, string environmentName)
        {
            BasePath = basePath;
            var configuration = Configuration(basePath, environmentName);
            var connectionString = ConnectionString(configuration.Build());
            return Create(connectionString);
        }

        private Context Create(string connectionString)
        {
            if (string.IsNullOrEmpty(connectionString))
            {
                throw new ArgumentException($"{nameof(connectionString)} is null or empty", nameof(connectionString));
            }
            var optionsBuilder = new DbContextOptionsBuilder<Context>();
            return Configure(connectionString, optionsBuilder);
        }

        protected virtual IConfigurationBuilder Configuration(string basePath, string environmentName)
        {
            var builder = new ConfigurationBuilder()
                .AddJsonFile("appsettings.json")
                .AddJsonFile($"appsettings.{environmentName}.json", true)
                .AddEnvironmentVariables();
            return builder;
        }

        protected virtual string ConnectionString(IConfigurationRoot configuration)
        {
            string connectionString = configuration["ConnectionStrings:DefaultConnection"];
            return connectionString;
        }

        protected virtual Context Configure(string connectionString, DbContextOptionsBuilder<Context> builder)
        {
            builder.UseSqlServer(connectionString, opt => opt.UseRowNumberForPaging());

            Context db = new Context(builder.Options);
            return db;
        }

        public Context CreateDbContext(string[] args)
        {

            var environmentName = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
            IConfigurationRoot configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json")
                .AddJsonFile($"appsettings.{environmentName}.json", true)
                .Build();

            var builder = new DbContextOptionsBuilder<Context>();

            var connectionString = configuration.GetConnectionString("DefaultConnection");
            builder.UseSqlServer(connectionString);
            Context db = new Context(builder.Options);
            return db;
        }
    }
    public partial class Context : DbContext
    {
        public Context()
        {
        }

        public Context(DbContextOptions<Context> options)
            : base(options)
        {
        }

        
        public virtual DbSet<Contact> Contact { get; set; }

        public static string ConnectionString { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            
        }
    }
}
