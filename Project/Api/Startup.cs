using System;
using System.Reflection;
using System.Text;
using MediatR;
using MediatR.Pipeline;
using System.Threading.Tasks;
using Api.Controllers;
using Autofac;
using Autofac.Core;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using AutoMapper;
using MediatR.Extensions.Autofac.DependencyInjection;
using FluentValidation.AspNetCore;
using Hangfire;
using Logic.Entity;
using Model.Common;
using Model.Entity;
using NJsonSchema;
using NSwag;
using NSwag.AspNetCore;
using NSwag.SwaggerGeneration.Processors.Security;
using Repository.Entity;
using Util;

namespace Api
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            var environmentName = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");

            var basePath = AppContext.BaseDirectory;
            var builder = new ConfigurationBuilder()
                .SetBasePath(basePath)
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                .AddJsonFile($"appsettings.{environmentName}.json", optional: true)
                .AddEnvironmentVariables();
            Configuration = builder.Build();
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            var appSettingsSection = Configuration.GetSection("AppSettings");
            // configure strongly typed settings objects
            services.Configure<AppSettings>(appSettingsSection);

            // configure jwt authentication
            var appSettings = appSettingsSection.Get<AppSettings>();

            services.AddAutoMapper();

            services.AddMvc().AddControllersAsServices().SetCompatibilityVersion(CompatibilityVersion.Version_2_1)
                .AddFluentValidation(fv =>
                {

                });
            services.AddSwagger();
            services.AddCors();

            services.AddHangfire(x => x.UseSqlServerStorage(Configuration["ConnectionStrings:DefaultConnection"]));
            var key = Encoding.ASCII.GetBytes(appSettings.Secret);
            services.AddAuthentication(x =>
                {
                    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                })
                .AddJwtBearer(options =>
                {
                    options.Events = new JwtBearerEvents
                    {
                        OnTokenValidated = context =>
                        {
                            var contactRepository = context.HttpContext.RequestServices.GetRequiredService<ContactRepository>();
                            var userId = int.Parse(context.Principal.Identity.Name);
                            var user = contactRepository.Get(userId);
                            if (user == null)
                            {
                                // return unauthorized if user no longer exists
                                context.Fail("Unauthorized");
                            }
                            context.Success();
                            return Task.CompletedTask;
                        },
                        OnAuthenticationFailed = context =>
                        {
                            if (context.Exception.GetType() == typeof(SecurityTokenExpiredException))
                            {
                                context.Response.Headers.Add("Token-Expired", "true");
                            }
                            return Task.CompletedTask;
                        }
                    };
                    options.RequireHttpsMetadata = false;
                    options.SaveToken = true;
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        ValidateLifetime = true,
                        IssuerSigningKey = new SymmetricSecurityKey(key),
                        ValidateIssuer = false,
                        ValidateAudience = false,
                    };
                });
        }
        public void ConfigureContainer(ContainerBuilder builder)
        {
            //builder.RegisterModule(new AutofacModule());
            AutoWireAttribute.Register(typeof(ContactRepository).Assembly, builder);  // repo
            AutoWireAttribute.Register(typeof(ContextFactory).Assembly, builder);  // Model
            AutoWireAttribute.Register(typeof(ContactController).Assembly, builder);  // controller
            builder.AddMediatR(typeof(CalculateZerosFromIntHandler).GetTypeInfo().Assembly);
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseHsts();
            }
            app.UseCors(x => x
                .AllowAnyOrigin()
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials());

            app.UseAuthentication();
            app.UseHttpsRedirection();
            app.UseMvc();
            app.UseSwaggerUi3WithApiExplorer(settings => {
                settings.GeneratorSettings.OperationProcessors.Add(new OperationSecurityScopeProcessor("JWT Token"));

                settings.GeneratorSettings.DocumentProcessors.Add(new SecurityDefinitionAppender("JWT Token",
                    new SwaggerSecurityScheme {
                        Type = SwaggerSecuritySchemeType.ApiKey,
                        Name = "Authorization",
                        Description = "Copy 'Bearer ' + valid JWT token into field",
                        In = SwaggerSecurityApiKeyLocation.Header
                    }));
                settings.GeneratorSettings.DefaultPropertyNameHandling =
                    PropertyNameHandling.CamelCase;
            });
            app.UseStaticFiles();
            app.UseHangfireServer();
            app.UseHangfireDashboard();
        }
    }
}
