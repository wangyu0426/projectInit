using System;
using System.Collections.Generic;
using Microsoft.Extensions.Configuration;
using Util;

namespace Model.Common
{
    [AutoWire(AutoWireScope.SingleInstance)]
    public class AppSettings
    {
        private IConfigurationRoot build;
        public AppSettings()
        {
            var environmentName = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");

            var basePath = AppContext.BaseDirectory;
            var builder = new ConfigurationBuilder()
                .SetBasePath(basePath)
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                .AddJsonFile($"appsettings.{environmentName}.json", optional: true)
                .AddEnvironmentVariables();
            build = builder.Build();
        }
        public string Secret { get { return build["AppSettings:Secret"]; } }
        public int SessionExpires { get { return build["AppSettings:SessionExpires"].ToInteger(); } }
        public string AwsAccessKeyId { get { return build["AppSettings:AwsAccessKeyId"]; } }
        public string AwsSecretAccessKey { get { return build["AppSettings:AwsSecretAccessKey"]; } }
        public string StripeSecretKey { get { return build["AppSettings:StripeSecretKey"]; } }
        public List<LanguageConfig> LanguageConfig = new List<LanguageConfig>()
        {
            new LanguageConfig() { Code= "en", Text= "English",   SpeechVoiceCode= "Nicole" },
            new LanguageConfig() { Code= "ar", Text= "Arabic",    SpeechVoiceCode= null },
            new LanguageConfig() { Code= "zh", Text= "Chinese",   SpeechVoiceCode= "Zhiyu" },
            new LanguageConfig() { Code= "fr", Text= "French",    SpeechVoiceCode= "Chantal" },
            new LanguageConfig() { Code= "de", Text= "German",    SpeechVoiceCode= "Marlene" },
            new LanguageConfig() { Code= "pt", Text= "Portugese", SpeechVoiceCode= "Vitoria" },
            new LanguageConfig() { Code= "es", Text= "Spanish",   SpeechVoiceCode= "Conchita" }
        };
        public LanguageConfig BaseLanguage = new LanguageConfig() { Code = "en", Text = "English", SpeechVoiceCode = "Nicole" };
    }
}
