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
    uploadBrief: "/upload-brief",
    secureDownloadBrief: "/brief/:id/download",
  },
};
