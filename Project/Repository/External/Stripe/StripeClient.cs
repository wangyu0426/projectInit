using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using Model.Common;
using Stripe;
using Util;

namespace Repository.External.Stripe
{
    [AutoWire]
    public class StripeClient
    {
        public AppSettings Settings { get; set; }

        public bool IsSubscipted(string subscriptionId)
        {
            return AccessStripeService(() => {
                var subscriptionService = new SubscriptionService();
                try {
                    var result = subscriptionService.Get(subscriptionId);
                    return result.Status == SubscriptionStatuses.Active;
                }
                catch (StripeException e) {
                    if (e.HttpStatusCode == HttpStatusCode.NotFound) {
                        return false;
                    }
                    throw;
                }
            });
        }

        private T AccessStripeService<T>(Func<T> func, bool ignoreStripeException = false)
        {
            try {
                StripeConfiguration.SetApiKey(Settings.StripeSecretKey);
                return func();
            }
            catch (StripeException ex) {
                //log the error 
                //Log.Error("Got a StripeException", ex);
                if (!ignoreStripeException) {
                    throw;
                }
                else {
                    // just ignore because app should continue event if Stripe is down
                }
            }
            catch (Exception ex) {
                //Log.Error("Failed to access Stripe service", ex);
                throw new StripeException("A problem occurred reading data from the payment gateway.");
            }

            return default(T);
        }
        public Event GetEvent(string eventId)
        {
            try {
                return AccessStripeService(() => {

                    var eventService = new EventService();

                    var stripeEvent = eventService.Get(eventId);

                    return stripeEvent;
                });
            }
            catch (StripeException ex) {
                //Log.Error(string.Format("Failed to get event. Code: {0}, Param: {1}", ex.StripeError?.Code, ex.StripeError?.Parameter), ex);
                return null;
            }
        }

        #region Customer
        public  Customer GetCustomer(string stripeCustomerId)
        {
            return AccessStripeService(() => {
                var customerService = new CustomerService();

                return customerService.Get(stripeCustomerId);
            });
        }

        public  Customer UpdateCustomer(string stripeCustomerId, CustomerUpdateOptions updateOptions)
        {
            return AccessStripeService(() => {
                var customerService = new CustomerService();

                return customerService.Update(stripeCustomerId, updateOptions);
            });
        }

        public  Customer CreateCustomer(string description, string email, string cardToken)
        {
            return AccessStripeService(() => {
                var customerService = new CustomerService();

                var createCustomer = new CustomerCreateOptions {
                    Description = description,
                    Email = email,
                    SourceToken = cardToken
                };
                return customerService.Create(createCustomer);
            });
        }

        public Customer DeleteCustomer(string stripeCustomerId)
        {
            return AccessStripeService(() => {
                var customerService = new CustomerService();

                return customerService.Delete(stripeCustomerId);
            });
        }
        #endregion

        #region Plan
        public  List<Plan> GetPlans()
        {
            try {
                return AccessStripeService(() => {
                    var planService = new PlanService();
                    planService.ExpandProduct = true;

                    var planList = planService.List(new PlanListOptions {
                        Limit = 100
                    });

                    if (planList.Data.Count(P => P.Id.StartsWith("plan_core_") || P.Id.StartsWith("plan_pro_")) < 8) {
                        CreateNewPlans();

                        planList = planService.List();
                    }

                    return planList.Data;
                });
            }
            catch (Exception ex) {
                //Log.Error("A problem occurred retrieving plans from the payment gateway.", ex);
                throw new StripeException("A problem occurred retrieving plans from the payment gateway", ex);
            }
        }

        public Plan GetPlan(string planId)
        {
            try {
                return AccessStripeService(() => {
                    var planService = new PlanService();
                    planService.ExpandProduct = true;

                    var plan = planService.Get(planId);
                    return plan;
                });
            }
            catch (Exception ex) {
                //Log.Error("A problem occurred retrieving plans from the payment gateway.", ex);
                throw new StripeException("A problem occurred retrieving plans from the payment gateway", ex);
            }
        }
        private  void CreateNewPlans()
        {
            var product = PrepareNewProduct();

            AccessStripeService(() => {
                var planService = new PlanService();
                planService.ExpandProduct = true;

                var planList = planService.List(new PlanListOptions {
                    ProductId = product.Id
                });

                if (planList.TotalCount < 8) {
                    var plans = new List<PlanCreateOptions>() {
                        CreateNewPlan("plan_core_au", "Core", 100 * 100, "aud", product.Id)
                    };

                    plans.ForEach(P => {
                        try {
                            planService.Create(P);
                        } catch { }
                    });
                }

                return true;
            });
        }

        private  PlanCreateOptions CreateNewPlan(string planId, string name, int? amount, string currency, string productId)
        {
            return new PlanCreateOptions {
                Id = planId,
                Amount = amount,
                Interval = "month",
                Currency = currency,
                ProductId = productId,
                TrialPeriodDays = 0,
                BillingScheme = "per_unit",
                Nickname = $"{name} {currency.ToUpper()}",
                UsageType = "licensed",
                TransformUsage = new PlanTransformUsageOptions {
                    DivideBy = 100,
                    Round = "up"
                }
            };
        }

        private  Product PrepareNewProduct()
        {
            return AccessStripeService(() => {
                var productService = new ProductService();

                string productId = "prod_management";
                try {
                    return productService.Get(productId);
                } catch (Exception ex) {
                    //Log.Warn("Missing new Stripe product", ex);
                    return productService.Create(new ProductCreateOptions {
                        Id = productId,
                        Type = StripeProductTypes.Service,
                        Name = "Subscription",
                        StatementDescriptor = StripeStatementDescriptorTypes.Subscription
                    });
                }
            });
        }


        public Product GetProduct(Plan stripePlan)
        {
            return stripePlan.Product ?? GetProduct(stripePlan?.ProductId);
        }

        public  Product GetProduct(string productId)
        {
            return AccessStripeService(() => {
                if (string.IsNullOrWhiteSpace(productId)) {
                    return null;
                }

                var productService = new ProductService();

                try {
                    return productService.Get(productId);
                } catch (Exception ex) {
                    //Log.Warn("Failed to get stripe product", ex);
                    return null;
                }
            });
        }
        #endregion

        #region Subscription
        public void CancelSubscription(string subscriptionId)
        {
            try {
                AccessStripeService(() => {
                    var subscriptionService = new SubscriptionService();
                    var subscriptionOptions = new SubscriptionCancelOptions();
                    return subscriptionService.Cancel(subscriptionId, subscriptionOptions);
                });
            }
            catch (Exception ex) {
                //Log.Error("Failed to cancel subscription", ex);
                throw new StripeException("A problem occurred posting data to the payment gateway.");
            }
        }
        public  Subscription UpdateSubscription(string subscriptionId, Subscribe request, DateTime? trialEnd, decimal taxPercentage)
        {
            return AccessStripeService(() => {
                if (trialEnd <= DateTime.UtcNow) {
                    trialEnd = null;
                }

                var subscriptionService = new SubscriptionService();

                var updateSubscription = new SubscriptionUpdateOptions {
                    TrialEnd = trialEnd,
                    TaxPercent = taxPercentage
                };

                // create or update the subsription plan
                if (!request.GatewayPlanId.IsNullOrEmpty()) {

                    var subscription = subscriptionService.Get(subscriptionId);

                    var planUpdateOptions = new SubscriptionItemUpdateOption {
                        PlanId = request.GatewayPlanId,
                        Id = subscription.Items.Data[0].Id
                    };

                    //// update plan
                    //var subscriptionItems = new StripeSubscriptionItemService().List(
                    //    new StripeSubscriptionItemListOptions() {
                    //        SubscriptionId = subscriptionId,
                    //        Limit = 5
                    //    }
                    //);

                    //if (subscriptionItems.TotalCount > 0) {
                    //    planUpdateOptions.Id = subscriptionItems.FirstNonDefault().Id;
                    //}

                    updateSubscription.Items = new List<SubscriptionItemUpdateOption>{
                            planUpdateOptions
                        };
                }

                return subscriptionService.Update(subscriptionId, updateSubscription);
            });
        }

        public  Subscription CreateSubscription(string cutomerId, Subscribe request, DateTime? trialEnd, decimal taxPercentage)
        {
            return AccessStripeService(() => {
                if (trialEnd <= DateTime.UtcNow) {
                    trialEnd = null;
                }

                var subscriptionService = new SubscriptionService();

                var createSubscriptionPlanItems = new List<SubscriptionItemOption> {
                    new SubscriptionItemOption {
                        PlanId= request.GatewayPlanId
                    }
                };

                var createSubscription = new SubscriptionCreateOptions {
                    CustomerId = cutomerId,
                    TrialEnd = trialEnd,
                    TaxPercent = taxPercentage,
                    Items = createSubscriptionPlanItems
                };


                request.NewCardToken = null;

                return subscriptionService.Create(createSubscription);
            });
        }
        #endregion

        #region Invoice
        public  List<Invoice> GetInvoices(string customerId)
        {
            return AccessStripeService(() => {
                var invoiceService = new InvoiceService();

                var queryInvoice = new InvoiceListOptions {
                    CustomerId = customerId,
                    Paid = true
                };
                var invoices = invoiceService.List(queryInvoice);
                return invoices.Data;
            });
        }

        public Invoice GetInvoice(string invoiceId)
        {
            return AccessStripeService(() => {
                var invoiceService = new InvoiceService();

                return invoiceService.Get(invoiceId);
            });
        }

        public Invoice PayInvoice(Invoice invoice)
        {
            return AccessStripeService(() => {
                var invoiceService = new InvoiceService();
                var invoicePayOptions = new InvoicePayOptions();
                var paidInvoice = invoiceService.Pay(invoice.Id, invoicePayOptions);

                return paidInvoice;
            });
        }

        public Invoice CreateInvoice(string customerId, string description, string statementDescriptor, decimal? taxPercentage)
        {
            return AccessStripeService(() => {
                var invoiceService = new InvoiceService();

                var createInvoice = new InvoiceCreateOptions {
                    CustomerId = customerId,
                    Description = description,
                    Billing = Billing.ChargeAutomatically,
                    TaxPercent = taxPercentage,
                    StatementDescriptor = statementDescriptor
                };

                 return invoiceService.Create(createInvoice);
            });
        }

        public InvoiceItem CreateInvoiceItem(InvoiceItemCreateOptions createInvoiceItem)
        {
            return AccessStripeService(() => {
                var invoiceItemService = new InvoiceItemService();

                return invoiceItemService.Create(createInvoiceItem);
            });
        }

        public void RemoveInvoiceItem(string createInvoiceItemId)
        {
            AccessStripeService(() => {
                var invoiceItemService = new InvoiceItemService();

                return invoiceItemService.Delete(createInvoiceItemId);
            });
        }

        #endregion

        #region Charge
        public Charge CreateCharge(ChargeCreateOptions createCharge)
        {
            return AccessStripeService(() => {
                var chargeService = new ChargeService();
                return chargeService.Create(createCharge);
            });
        }
        public List<Charge> GetCharges(string customerId)
        {
            try {
                return AccessStripeService(() => {
                    var chargeService = new ChargeService {
                        ExpandInvoice = true
                    };

                    var queryCharge = new ChargeListOptions {
                        CustomerId = customerId
                    };
                    var charges = chargeService.List(queryCharge);
                    return charges.Data;
                });

            }
            catch (StripeException ex) {
                //Log.Error(string.Format("Failed to get invoices. Code: {0}, Param: {1}", ex.StripeError?.Code, ex.StripeError?.Parameter), ex);
                throw new CustomerBillingException("There was an issue to get your invoices, please try it later.");
            }

        }

        public Charge GetCharge(string chargeId)
        {
            try {
                return AccessStripeService(() => {
                    var chargeService = new ChargeService {
                        ExpandInvoice = true
                    };

                    return chargeService.Get(chargeId);
                });
            }
            catch (StripeException ex) {
                //Log.Error(string.Format("Failed to get invoices. Code: {0}, Param: {1}", ex.StripeError?.Code, ex.StripeError?.Parameter), ex);
                throw new CustomerBillingException("There was an issue to get your invoices, please try it later.");
            }

        }
        #endregion



        public Customer GetStripeCustomer(string paymentGatewayId)
        {
            return !string.IsNullOrEmpty(paymentGatewayId)
                ? GetCustomer(paymentGatewayId)
                : null;
        }

        public string GetPlanName(string planId)
        {
            return planId.StartsWith("plan_pro_")
                ? "Pro subscription" 
                : (planId.StartsWith("plan_core_") ? "Core subscription" : null);
        }

        public bool IsStripeAvailable()
        {
            try {
                return GetPlans().Any();
            }
            catch {
                return false;
            }
        }
    }

    public class CustomerBillingException: Exception
    {
        public CustomerBillingException()
        { }

        public CustomerBillingException(string message) : base(message)
        { }

        public CustomerBillingException(string message, Exception ex) : base(message, ex)
        { }
    }
}
