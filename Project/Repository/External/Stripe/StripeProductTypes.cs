using System;

namespace Repository.External.Stripe
{
    public class StripeProductTypes
    {
        public const string Service = "service";
        public const string Good = "good";
    }
    public class StripeBillingException : Exception
    {
        public StripeBillingException(string message) : base(message)
        {
        }
    }
    public static class EpochTime
    {
        private static DateTime _epochStartDateTime = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        public static DateTime ConvertEpochToDateTime(long seconds)
        {
            return _epochStartDateTime.AddSeconds(seconds);
        }

        public static long ConvertDateTimeToEpoch(this DateTime datetime)
        {
            if (datetime < _epochStartDateTime)
                return 0;

            return Convert.ToInt64((datetime.ToUniversalTime() - _epochStartDateTime).TotalSeconds);
        }
    }
    public class StripeStatementDescriptorTypes
    {
        public const string SetupFee = "Setup fee";
        public const string Subscription = "Veriface Software";

        public static string GetDescriptorTypeName(string statementDescriptor)
        {
            switch (statementDescriptor) {
                case SetupFee:
                    return "Setup";
                case Subscription:
                    return "Subscription";
                default:
                    return "Unknow";

            }

        }
    }
    public class Subscribe
    {
        public string GatewayPlanId { get; set; }
        
        public string NewCardToken { get; set; }

        public ConsultingFee OnboardingFee { get; set; }
    }
    public class ConsultingFee
    {
        public string Name { get; set; }

        public decimal Amount { get; set; }

        public decimal AmountIncludeTax { get; set; }

        public ConsultingFeeTypes Type { get; set; }

        public decimal Discount { get; set; }

        public string CouponCode { get; set; }
    }
    public enum ConsultingFeeTypes
    {
        SetupFee,
        ConsultingFee
    }
}
