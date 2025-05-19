type SubscriptionPlan = {
    currency: string;
    amount: number;
    monthly_blog_limit: number;
};

const READER_MONTHLY: SubscriptionPlan = {
    currency: 'INR',
    amount: 49 * 100,
    monthly_blog_limit: 300
};

const AVID_READER_MONTHLY: SubscriptionPlan = {
    currency: 'INR',
    amount: 499 * 100,
    monthly_blog_limit: 1000
};

export {
    READER_MONTHLY, AVID_READER_MONTHLY
};