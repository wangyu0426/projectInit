using System;
using Stripe;

namespace Repository.External.Stripe
{
    public static class StripeExtension
    {

        public static bool HasStripeCustomer(this Customer stripeCustomer)
        {
            return stripeCustomer != null && !(stripeCustomer.Deleted ?? false);
        }
        public static int TrialDaysRemaining(this DateTime? trialEnds) {
            if (!trialEnds.HasValue) {
                return 0;
            }

            return trialEnds.Value.TrialDaysRemaining();
        }

        public static int TrialDaysRemaining(this DateTime trialEnd)
        {
            var diff = trialEnd - DateTime.UtcNow;
            if (diff.Days > 0) {
                return diff.Days;
            }

            return DateTime.Compare(trialEnd, DateTime.UtcNow) > 0 ? 1 : 0;
        }
    }
}
