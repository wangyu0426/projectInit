namespace Model.Common
{

    public class PlanInfo
    {
        public string GatewayId { get; set; }

        public string Name { get; set; }

        public decimal Amount { get; set; }

        public decimal AmountExcludeTax { get; set; }

        public string Currency { get; set; }

        public string TaxLabel { get; set; }

        public bool TaxIncluded { get; set; }

        public decimal SetupFeeAmount { get; set; }
    }
    public enum StripeSubscriptionStatus
    {
        Unknown = 0,
        Trialing = 1,
        Active = 2,
        PastDue = 3,
        Canceled = 4,
        Unpaid = 5
    }
}
