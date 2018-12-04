using System;
using System.Threading.Tasks;
using Amazon.S3;
using Amazon.Translate;
using Amazon.Translate.Model;
using Model.Common;
using Util;

namespace Repository.External.Aws
{
    [AutoWire()]
    public class AwsTranslate : AwsServiceBase
    {      
        private AmazonTranslateConfig _amazonPollyConfig => new AmazonTranslateConfig()
        {
            RegionEndpoint = RegionEndpoint
        };
        public async Task<string> GetSpeech(string text, LanguageConfig translateFrom, LanguageConfig translateTo)
        {
            return await AccessTranslateAsync(async client =>
            {
                var sres = await client.TranslateTextAsync(new TranslateTextRequest() {
                    SourceLanguageCode = translateFrom.Code,
                    TargetLanguageCode = translateTo.Code,
                    Text = text
                });
                return sres.TranslatedText;
            });

        }
        private async Task<T> AccessTranslateAsync<T>(Func<IAmazonTranslate, Task<T>> function)
        {
            try {

                using (var client = new AmazonTranslateClient(await GetTempCredentials(), _amazonPollyConfig)) {
                    return await function(client);
                }
            } catch (AmazonS3Exception amazonS3Exception) {
                if (!amazonS3Exception.ErrorCode.Equals("NoSuchKey", StringComparison.OrdinalIgnoreCase)) {
                    throw;
                }
                if (amazonS3Exception.ErrorCode != null &&
                    (amazonS3Exception.ErrorCode.Equals("InvalidAccessKeyId") ||
                     amazonS3Exception.ErrorCode.Equals("InvalidSecurity"))) {
                    _tempCredentials = null;
                    throw new Exception("Check the provided AWS Credentials.");
                } else {
                    throw;
                }
            } catch (Exception ex) {
                throw;
            }
        }

    }
}
