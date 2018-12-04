using System;

namespace Repository.External.Stripe
{
    public class ChargeInvoice
    {
        public string Id { get; set; }
        public bool Paid { get; set; }
    }
    public class StripeSubscriptionData
    {
        public CardInfo[] Cards { get; set; }

        public string CurrentPlanId { get; set; }

        public string CurrentPlanName { get; set; }

        public int PropertyLimit { get; set; }

        public DateTime? TrialEnds { get; set; }

        public DateTime? CurrentPeriodStart { get; set; }

        public DateTime? CurrentPeriodEnd { get; set; }

        public bool Delinquent { get; set; }

        public bool? CancelAtPeriodEnd { get; set; }

        public bool SmsEnabled { get; set; }

        public decimal SmsTopUpAmount { get; set; }
    }
    public class CardInfo
    {
        public string GatewayId { get; set; }

        public string Type { get; set; }

        public string Last4 { get; set; }

        public int ExpMonth { get; set; }

        public int ExpYear { get; set; }
    }
}
