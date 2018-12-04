using System;
using System.IO;
using System.Threading.Tasks;
using Amazon.Polly;
using Amazon.Polly.Model;
using Amazon.S3;
using Util;

namespace Repository.External.Aws
{
    [AutoWire()]
    public class AwsPolly : AwsServiceBase
    {

        private AmazonPollyConfig _amazonPollyConfig => new AmazonPollyConfig()
        {
            RegionEndpoint = RegionEndpoint
        };
        public async Task<Stream> GetSpeech(string text, VoiceId voice)
        {
            return await AccessPollyAsync(async client =>
            {
                var sres = await client.SynthesizeSpeechAsync(new SynthesizeSpeechRequest {
                    Text = text,
                    OutputFormat = OutputFormat.Mp3,
                    VoiceId = voice
                });
                return sres.AudioStream;
            });

        }
        private async Task<T> AccessPollyAsync<T>(Func<IAmazonPolly, Task<T>> function)
        {
            try {

                using (var client = new AmazonPollyClient(await GetTempCredentials(), _amazonPollyConfig)) {
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
