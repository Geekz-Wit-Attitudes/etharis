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
    fundDeal: "/fund",
    submitContent: "/submit-content",
    getDeal: "/:id",
    initiateDispute: "/dispute/initiate",
    resolveDispute: "/dispute/resolve",
    autoReleasePayment: "/auto-release",
    autoRefundAfterDeadline: "/auto-refund",
    cancelDeal: "/cancel",
    emergencyCancelDeal: "/emergency-cancel",
    getDeals: "/list",
    canAutoRelease: "/can-auto-release",
    uploadBrief: "/upload-brief",
    secureDownloadBrief: "/brief/:id/download",
  },
  contract: {
    platformFee: "/platform-fee",
    tokenInfo: "/token-info",
  },
};
