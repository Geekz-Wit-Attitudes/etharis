export const endpoints = {
  auth: {
    public: {
      register: "/register",
      login: "/login",
      forgotPassword: "/forgot-password",
      resetPassword: "/reset-password",
    },
    protected: {
      changePassword: "/change-password",
      refreshToken: "/refresh-token",
      verifyEmail: "/verify-email",
      resendVerificationEmail: "/resend-verification-email",
      logout: "/logout",
    },
  },
  user: {
    profile: "/profile",
  },
  deal: {
    createDeal: "/create",
    approveDeal: "/approve",
    acceptDeal: "/accept",
    fundDeal: "/fund",
    submitContent: "/submit-content",
    getDeal: "/",
    getDeals: "/list",
    initiateDispute: "/dispute/initiate",
    resolveDispute: "/dispute/resolve",
    cancelDeal: "/cancel",
    canAutoRelease: "/can-auto-release",
    uploadBrief: "/upload-brief",
    secureDownloadBrief: "/brief/:id/download",
    mintMockIDRX: "/mint-mock-idrx",
  },
  contract: {
    platformFee: "/platform-fee",
    tokenInfo: "/token-info",
  },
};
