using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Threading.Tasks;
using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;
using Amazon.S3.Transfer;
using Amazon.SecurityToken;
using Util;

namespace Repository.External.Aws
{
    [AutoWire()]
    public class S3Storage: AwsServiceBase
    {

        #region static 
        protected override Amazon.RegionEndpoint RegionEndpoint => Amazon.RegionEndpoint.APSoutheast2;

        // https://docs.aws.amazon.com/sdk-for-net/v3/developer-guide/retries-timeouts.html
        private AmazonS3Config _s3ClientConfig => new AmazonS3Config {     // From AWS help: These values are overridden when you explicitly set the timeout values.
            RegionEndpoint = RegionEndpoint,
            Timeout = TimeSpan.FromSeconds(120),                // AWS default value is 100 seconds
            ReadWriteTimeout = TimeSpan.FromSeconds(300),       // AWS default value is 300 seconds
            MaxErrorRetry = 3                                   // WAS default value is 4 retries
        };

        private AmazonSecurityTokenServiceConfig _stsClientConfig => new AmazonSecurityTokenServiceConfig {
            RegionEndpoint = RegionEndpoint,
            Timeout = TimeSpan.FromSeconds(180),
            ReadWriteTimeout = TimeSpan.FromSeconds(300),
            MaxErrorRetry = 5
        };
        #endregion static

        #region public methods


        public async Task<Stream> GetAsync(string key, string buckName)
        {
            return await AccessS3Async(async client => {
                //var s3FileInfo = new S3FileInfo(client, buckName, key);
                if (await S3ExistsAsync(key,buckName)) {
                    using (var transferUtility = new TransferUtility(client)) {
                        return await transferUtility.OpenStreamAsync(buckName, key); // very slow when there is no object
                    }
                } else {
                    throw new AmazonS3Exception("The specified key does not exist.", ErrorType.Sender, "NoSuchKey", null, HttpStatusCode.BadRequest);
                }
            });
        }

        /// <summary>
        /// check s3 file exists or not
        /// </summary>
        /// <param name="key">S3 Key</param>
        /// <param name="buckName">buckName</param>
        /// <returns>check current key exists or not</returns>
        public async Task<bool> S3ExistsAsync(string key, string buckName)
        {
            try
            {
                var result = await AccessS3Async(async client => {
                    var s3FileInfo = await client.GetObjectMetadataAsync(new GetObjectMetadataRequest() { BucketName = buckName, Key = key });
                    return s3FileInfo != null;
                });
                return (bool)result;
            }
            catch (AmazonS3Exception amazonS3Exception)
            {
                if (!amazonS3Exception.ErrorCode.Equals("NoSuchKey", StringComparison.OrdinalIgnoreCase)) {
                    return false;
                }
            }
            return false;
        }


        public async Task<bool> DeleteAsync(string key, string bucketName)
        {
            var result = await AccessS3Async(async client => {
                var deleteObjectRequest = new DeleteObjectRequest {
                    BucketName = bucketName,
                    Key = key
                };

                var deleteResponse = await client.DeleteObjectAsync(deleteObjectRequest);
                return deleteResponse;
            });

            return result.HttpStatusCode == System.Net.HttpStatusCode.OK || result.HttpStatusCode == HttpStatusCode.NoContent;
        }

        public async Task<IList<S3Object>> GetListAsync(string prefix, string bucketName)
        {
            var list = await AccessS3Async(async client => {
                ListObjectsRequest request = new ListObjectsRequest {
                    BucketName = bucketName,
                    Prefix = prefix,
                    MaxKeys = 10240
                };

                var objectList = new List<S3Object>();
                do {
                    var response = await client.ListObjectsAsync(request);

                    if (response.S3Objects.Count > 0) {
                        objectList.AddRange(response.S3Objects);

                        // If response is truncated, set the marker to get the next set of keys.
                        if (response.IsTruncated) {
                            request.Marker = response.NextMarker;
                        } else {
                            request = null;
                        }
                    } else {
                        request = null;
                    }
                } while (request != null);
                return objectList;
            });
            return list;
        }

        public async Task<bool> SaveToS3(string key, Stream fileStream, string contentType, string bucketName, bool isPublic = false, bool close = true)
        {
            var result = await AccessS3Async(async client => {
                PutObjectRequest request = new PutObjectRequest {
                    BucketName = bucketName,
                    Key = key,
                    InputStream = fileStream,
                    CannedACL = isPublic ? S3CannedACL.PublicRead : S3CannedACL.AuthenticatedRead,
                    ContentType = contentType,
                    AutoCloseStream = close
                };
                //request.Metadata.Add("","");

                var putResult = await client.PutObjectAsync(request);
                return putResult;
            });
            return result.HttpStatusCode == System.Net.HttpStatusCode.OK;
        }

        #endregion


        private async Task<T> AccessS3Async<T>(Func<IAmazonS3, Task<T>> function)
        {
            try {
                using (var client = new AmazonS3Client(await GetTempCredentials(), _s3ClientConfig)) {
                    return await function(client);
                }
            } catch (AmazonS3Exception amazonS3Exception) {
                if (!amazonS3Exception.ErrorCode.Equals("NoSuchKey", StringComparison.OrdinalIgnoreCase))
                {
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

        public async Task<bool> CreateBucket(string bucketName)
        {
            var result =  await AccessS3Async(async client => {
                PutBucketRequest request = new PutBucketRequest {
                    BucketName = bucketName.ToLower(),
                    CannedACL = S3CannedACL.Private,
                    BucketRegion = S3Region.APS2,
                };
                var putResult = await client.PutBucketAsync(request);
                return putResult;
            });
            return result.HttpStatusCode == System.Net.HttpStatusCode.OK;
        }
    }

    public class FileInfo
    {
        public string Name { get; set; }
        public long Size { get; set; }
        public bool Exists { get; set; }
    }
}

