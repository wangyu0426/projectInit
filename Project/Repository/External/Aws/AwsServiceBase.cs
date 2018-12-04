using System;
using System.Threading.Tasks;
using Amazon.Runtime;
using Amazon.SecurityToken;
using Amazon.SecurityToken.Model;
using Model.Common;

namespace Repository.External.Aws
{
    public abstract class AwsServiceBase
    {
        public AppSettings Settings { get; set; }
        protected const int _sessionExpiredSeconds = 7200;
        protected DateTime _expiredTime = DateTime.UtcNow;
        protected SessionAWSCredentials _tempCredentials;

        protected virtual Amazon.RegionEndpoint RegionEndpoint => Amazon.RegionEndpoint.USWest2;


        private AmazonSecurityTokenServiceConfig _stsClientConfig => new AmazonSecurityTokenServiceConfig {
            RegionEndpoint = RegionEndpoint,
            Timeout = TimeSpan.FromSeconds(180),
            ReadWriteTimeout = TimeSpan.FromSeconds(300),
            MaxErrorRetry = 5
        };

        protected async Task<SessionAWSCredentials> GetTempCredentials() {
            if (DateTime.UtcNow > _expiredTime) {
                _tempCredentials = null;
            }
            if (_tempCredentials == null)
            {
                var Credentials =  await GetTemporaryCredentialsAsync();
                _tempCredentials = Credentials;
                _expiredTime = DateTime.UtcNow.AddSeconds(_sessionExpiredSeconds - 20);
            }
            return _tempCredentials;
        }

        protected async Task<SessionAWSCredentials> GetTemporaryCredentialsAsync()
        {
            try {
                AmazonSecurityTokenServiceClient stsClient =
                    new AmazonSecurityTokenServiceClient(Settings.AwsAccessKeyId,
                        Settings.AwsSecretAccessKey, _stsClientConfig);

                GetSessionTokenRequest getSessionTokenRequest =
                    new GetSessionTokenRequest();
                getSessionTokenRequest.DurationSeconds = _sessionExpiredSeconds; // seconds

                var task = await stsClient.GetSessionTokenAsync(getSessionTokenRequest);
                Credentials credentials = task.Credentials;

                SessionAWSCredentials sessionCredentials =
                    new SessionAWSCredentials(credentials.AccessKeyId,
                        credentials.SecretAccessKey,
                        credentials.SessionToken);

                return sessionCredentials;
            } catch (AmazonServiceException asEx) {
                if (asEx.Message.Contains("Timeout")) { // A WebException with status Timeout was thrown
                    return await GetTemporaryCredentialsAsync();   // Try again when it's timeout, this doesn't help if it hitted the AWS account limits
                } else {
                    throw;
                }
            } catch (Exception ex) {
                throw;
            }
        }
    }
}